export function safeReturnTo(next: string | null | undefined, fallback = "/account") {
  if (!next) {
    return fallback;
  }

  if (!next.startsWith("/")) {
    return fallback;
  }

  return next;
}

export function normalizeAuthError(error: unknown) {
  const rawMessage =
    typeof error === "string"
      ? error
      : error && typeof error === "object" && "message" in error && typeof error.message === "string"
        ? error.message
        : "Authentication failed. Please try again.";

  const message = rawMessage.toLowerCase();

  if (message.includes("email not confirmed") || message.includes("email address not confirmed")) {
    return "Verify your email before signing in.";
  }

  if (message.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }

  if (message.includes("user already registered")) {
    return "This email already has an account. Try signing in instead.";
  }

  if (message.includes("password should be at least")) {
    return "Use at least 8 characters for a stronger password.";
  }

  if (message.includes("forbidden") || message.includes("not allowed")) {
    return "That action is not available right now.";
  }

  return rawMessage;
}