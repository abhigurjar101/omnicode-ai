"""Secure Encrypted Vault for OMNICODE AI 2.0 Credentials.

Uses AES-256 (Fernet) authenticated encryption to persist API keys, tokens,
and workspace-level secrets on disk or in database with zero raw secrets leakage.
"""

import os
import json
import base64
import hashlib
from typing import Dict, Any, Optional, List
from pathlib import Path
from cryptography.fernet import Fernet
from pydantic import BaseModel, Field


class ProviderCredential(BaseModel):
    provider_id: str  # openai, anthropic, cursor, copilot, ollama, custom
    api_key_masked: str
    encrypted_secret: str
    base_url: Optional[str] = None
    organization_id: Optional[str] = None
    is_active: bool = True
    capabilities: List[str] = Field(default_factory=list)
    created_at: str = ""
    updated_at: str = ""


class CredentialVault:
    """Manages encrypted credential storage per workspace."""

    def __init__(self, storage_dir: Optional[str] = None, master_key: Optional[str] = None):
        if not storage_dir:
            default_vault = os.path.expanduser("~/.nemicode/vault")
            if not os.path.exists(default_vault) and os.path.exists(os.path.expanduser("~/.omnicode/vault")):
                default_vault = os.path.expanduser("~/.omnicode/vault")
            storage_dir = os.environ.get("NEMICODE_VAULT_DIR", os.environ.get("OMNICODE_VAULT_DIR", default_vault))
        self.storage_path = Path(storage_dir)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self._vault_file = self.storage_path / "credentials.enc.json"

        # Initialize or derive Fernet cipher
        raw_key = master_key or os.environ.get("NEMICODE_MASTER_KEY", os.environ.get("OMNICODE_MASTER_KEY"))
        if not raw_key:
            # Generate or load a local stable machine-level salt key
            key_file = self.storage_path / ".master_salt"
            if key_file.exists():
                raw_key = key_file.read_text().strip()
            else:
                raw_key = Fernet.generate_key().decode()
                key_file.write_text(raw_key)
                os.chmod(key_file, 0o600)

        # Ensure valid 32-byte urlsafe base64 for Fernet
        if isinstance(raw_key, str):
            if len(raw_key) == 44 and raw_key.endswith("="):
                fernet_key = raw_key.encode()
            else:
                digest = hashlib.sha256(raw_key.encode()).digest()
                fernet_key = base64.urlsafe_b64encode(digest)
        else:
            fernet_key = raw_key

        self.cipher = Fernet(fernet_key)

    def _read_store(self) -> Dict[str, Dict[str, Any]]:
        if not self._vault_file.exists():
            return {}
        try:
            with open(self._vault_file, "r") as f:
                return json.load(f)
        except Exception:
            return {}

    def _write_store(self, data: Dict[str, Dict[str, Any]]) -> None:
        with open(self._vault_file, "w") as f:
            json.dump(data, f, indent=2)
        os.chmod(self._vault_file, 0o600)

    @staticmethod
    def mask_key(secret: str) -> str:
        """Safely mask a secret for UI display (e.g., sk-...a8b9)."""
        if not secret:
            return ""
        if len(secret) <= 8:
            return "********"
        return f"{secret[:4]}...{secret[-4:]}"

    def store_credential(
        self,
        workspace_id: str,
        provider_id: str,
        secret: str,
        base_url: Optional[str] = None,
        org_id: Optional[str] = None,
        capabilities: Optional[List[str]] = None,
    ) -> ProviderCredential:
        """Encrypts and securely stores provider credential for a workspace."""
        encrypted_bytes = self.cipher.encrypt(secret.encode())
        encrypted_str = encrypted_bytes.decode()
        masked = self.mask_key(secret)

        store = self._read_store()
        ws_store = store.setdefault(workspace_id, {})

        from datetime import datetime, timezone
        now_iso = datetime.now(timezone.utc).isoformat()

        record = {
            "provider_id": provider_id,
            "api_key_masked": masked,
            "encrypted_secret": encrypted_str,
            "base_url": base_url,
            "organization_id": org_id,
            "is_active": True,
            "capabilities": capabilities or ["reasoning", "code_generation", "tool_calling"],
            "created_at": ws_store.get(provider_id, {}).get("created_at", now_iso),
            "updated_at": now_iso,
        }
        ws_store[provider_id] = record
        self._write_store(store)
        return ProviderCredential(**record)

    def get_credential(self, workspace_id: str, provider_id: str) -> Optional[str]:
        """Decrypts and returns the raw secret for internal adapter use only."""
        store = self._read_store()
        ws_store = store.get(workspace_id, {})
        record = ws_store.get(provider_id)
        if not record or not record.get("is_active"):
            # Check environment fallback
            env_var_map = {
                "openai": "OPENAI_API_KEY",
                "anthropic": "ANTHROPIC_API_KEY",
                "cursor": "CURSOR_API_KEY",
                "copilot": "GITHUB_TOKEN",
                "ollama": "OLLAMA_API_KEY",
            }
            env_var = env_var_map.get(provider_id)
            if env_var and os.environ.get(env_var):
                return os.environ[env_var]
            return None

        encrypted_secret = record["encrypted_secret"]
        try:
            decrypted = self.cipher.decrypt(encrypted_secret.encode()).decode()
            return decrypted
        except Exception:
            return None

    def list_credentials(self, workspace_id: str) -> List[ProviderCredential]:
        """Lists masked credential metadata for frontend display (never reveals secrets)."""
        store = self._read_store()
        ws_store = store.get(workspace_id, {})
        res = []
        for pid, record in ws_store.items():
            res.append(ProviderCredential(**record))
        return res

    def revoke_credential(self, workspace_id: str, provider_id: str) -> bool:
        """Deactivates a credential."""
        store = self._read_store()
        if workspace_id in store and provider_id in store[workspace_id]:
            store[workspace_id][provider_id]["is_active"] = False
            self._write_store(store)
            return True
        return False

    def delete_credential(self, workspace_id: str, provider_id: str) -> bool:
        """Permanently purges a credential from the vault."""
        store = self._read_store()
        if workspace_id in store and provider_id in store[workspace_id]:
            del store[workspace_id][provider_id]
            self._write_store(store)
            return True
        return False
