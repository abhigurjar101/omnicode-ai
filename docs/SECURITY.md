# Execution boundary

OmniCode is a local coding-agent prototype with filesystem/command capabilities. Its command runner uses local subprocesses, strips a fixed list of credential variable names, constrains the selected working directory, enforces a timeout and spills large outputs into artifacts.

These checks are not an operating-system sandbox. A shell command may still access resources available to the user, inherit unlisted sensitive environment variables or perform network operations. Static code scans and risk classification are heuristics, not proofs of safety.

Keep the FastAPI service bound to loopback. The development API has permissive CORS and file/command endpoints; it has not been verified as a securely isolated multi-user service. Use disposable workspaces and independently review generated changes. Add strong authentication, authorization, process/container isolation, network controls and audited permission enforcement before deploying it for other users.

Do not commit API keys, vault contents, task histories or memory databases. The included environment file is a blank template. Live inference sends context to the configured provider.
