import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import {
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";

type AuthActionResult =
  | { success: true }
  | { success: false; msg: string };

type EmailVerificationResult =
  | { success: true; verified: boolean }
  | { success: false; msg: string };

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/network-request-failed":
        return "Please check your internet connection.";

      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";

      case "auth/user-token-expired":
      case "auth/invalid-user-token":
      case "auth/user-disabled":
        return "Please sign in again to continue.";
    }
  }

  return "Something went wrong. Please try again.";
}

export async function requestPasswordReset(
  email: string
): Promise<AuthActionResult> {
  const normalizedEmail = email.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return {
      success: false,
      msg: "Please enter a valid email address.",
    };
  }

  try {
    await sendPasswordResetEmail(auth, normalizedEmail);

    return { success: true };
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      if (error.code === "auth/user-not-found") {
        return { success: true };
      }

      if (error.code === "auth/invalid-email") {
        return {
          success: false,
          msg: "Please enter a valid email address.",
        };
      }
    }

    return {
      success: false,
      msg: getAuthErrorMessage(error),
    };
  }
}

export async function requestEmailVerification(
  expectedUid?: string
): Promise<AuthActionResult> {
  const user = auth.currentUser;

  if (!user) {
    return {
      success: false,
      msg: "Please sign in to verify your email.",
    };
  }

  if (expectedUid !== undefined && user.uid !== expectedUid) {
    return {
      success: false,
      msg: "Your session changed. Please try again.",
    };
  }

  try {
    await reload(user);

    if (auth.currentUser !== user) {
      return {
        success: false,
        msg: "Your session changed. Please try again.",
      };
    }

    if (user.emailVerified) {
      return { success: true };
    }

    await sendEmailVerification(user);

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      msg: getAuthErrorMessage(error),
    };
  }
}

export async function checkEmailVerification(): Promise<EmailVerificationResult> {
  const user = auth.currentUser;

  if (!user) {
    return {
      success: false,
      msg: "Please sign in to check your email verification.",
    };
  }

  try {
    await reload(user);

    if (auth.currentUser !== user) {
      return {
        success: false,
        msg: "Your session changed. Please try again.",
      };
    }

    if (user.emailVerified) {
      await user.getIdToken(true);
    }

    if (auth.currentUser !== user) {
      return {
        success: false,
        msg: "Your session changed. Please try again.",
      };
    }

    return {
      success: true,
      verified: user.emailVerified,
    };
  } catch (error: unknown) {
    return {
      success: false,
      msg: getAuthErrorMessage(error),
    };
  }
}