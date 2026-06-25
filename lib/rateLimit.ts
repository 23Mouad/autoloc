/**
 * Simple in-memory rate limiter.
 * Tracks request counts per key (e.g. IP address) within a time window.
 * NOTE: Resets on server restart — suitable for single-instance dev/staging.
 * For production multi-instance deployments, swap for a Redis-backed solution.
 */

interface RateLimitEntry {
  count:     number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  /** Max allowed requests in the window */
  limit:  number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success:    boolean;
  remaining:  number;
  retryAfter: number; // seconds until reset (0 if allowed)
}

export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    // Start a fresh window
    store.set(key, { count: 1, resetTime: now + config.windowMs });
    return { success: true, remaining: config.limit - 1, retryAfter: 0 };
  }

  if (entry.count >= config.limit) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { success: false, remaining: 0, retryAfter };
  }

  entry.count += 1;
  return { success: true, remaining: config.limit - entry.count, retryAfter: 0 };
}

/** Pre-configured limiters */

/** Auth endpoints: 10 attempts per 15 minutes */
export function authRateLimit(ip: string) {
  return rateLimit(`auth:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
}

/** OTP resend: 3 per 10 minutes */
export function otpResendRateLimit(email: string) {
  return rateLimit(`otp_resend:${email}`, { limit: 3, windowMs: 10 * 60 * 1000 });
}

/** Forgot-password: 3 per 30 minutes */
export function forgotPasswordRateLimit(ip: string) {
  return rateLimit(`forgot:${ip}`, { limit: 3, windowMs: 30 * 60 * 1000 });
}

/** Utility: extract IP from NextRequest */
export function getIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
