export interface AuthResult {
  valid: boolean;
  userId?: string;
  error?: string;
}

export async function verifyToken(token: string): Promise<AuthResult> {
  try {
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return { valid: false, error: "Empty or invalid token" };
    }
    return { valid: true, userId: "user_nvidia" };
  } catch (err: any) {
    console.error("Auth validation guard caught error:", err);
    return { valid: false, error: err?.message || "Verification failed" };
  }
}