import { auth, firestore } from "@/config/firebase";
import { updateUser } from "@/services/userService";
import {
  AuthContextType,
  ProfileSaveResult,
  RegisterResult,
  UserType,
} from "@/types";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const AuthContext = createContext<AuthContextType | null>(null);

const PROFILE_SAVE_FAILED_MSG =
  "Your account was created, but we couldn't save your profile. You can try again now or update it later from your profile.";

const getErrorCode = (error: unknown): string | null => {
  if (typeof error === "object" && error !== null && "code" in error) {
    return typeof error.code === "string" ? error.code : null;
  }
  return null;
};

const getRegisterErrorMessage = (code: string | null): string => {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Your password is too weak.";
    case "auth/network-request-failed":
      return "No internet connection. Please check your connection.";
    case "auth/operation-not-allowed":
      return "Registration is currently unavailable.";
    default:
      return "Something went wrong. Please try again.";
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const currentUidRef = useRef<string | null>(null);
  const registrationRef = useRef<Promise<void> | null>(null);
  const pendingProfileRef = useRef<{ uid: string; name: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const uid = firebaseUser?.uid ?? null;
      currentUidRef.current = uid;
      if (pendingProfileRef.current && pendingProfileRef.current.uid !== uid) {
        pendingProfileRef.current = null;
      }

      try {
        if (firebaseUser) {
          setUser((prev) =>
            prev?.uid === firebaseUser.uid
              ? { ...prev, email: firebaseUser.email }
              : {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  name: firebaseUser.displayName,
                  image: null,
                }
          );
          setIsSignedIn(true);
          await registrationRef.current;
          await updateUserData(firebaseUser.uid);
        } else {
          setUser(null);
          setIsSignedIn(false);
        }
      } finally {
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      return {
        success: true,
      };
    } catch (error: any) {
      console.log("Login error:", error.code);

      let msg = "Something went wrong. Please try again.";

      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          msg = "Incorrect email or password.";
          break;

        case "auth/invalid-email":
          msg = "Please enter a valid email address.";
          break;

        case "auth/too-many-requests":
          msg = "Too many attempts. Please try again later.";
          break;

        case "auth/network-request-failed":
          msg = "No internet connection. Please check your connection.";
          break;

        case "auth/user-disabled":
          msg = "This account has been disabled.";
          break;
      }

      return {
        success: false,
        msg,
      };
    }
  };

  const saveProfile = async (
    uid: string,
    name: string
  ): Promise<ProfileSaveResult> => {
    const res = await updateUser(uid, { name });

    if (!res.success) {
      console.log("Profile save error:", res.msg);
      return { success: false, msg: PROFILE_SAVE_FAILED_MSG, retryable: true };
    }

    if (pendingProfileRef.current?.uid === uid) {
      pendingProfileRef.current = null;
    }
    setUser((prev) => (prev?.uid === uid ? { ...prev, name } : prev));

    return { success: true };
  };

  const runRegistration = async (
    email: string,
    password: string,
    name: string
  ): Promise<RegisterResult> => {
    let uid: string;

    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      uid = response.user.uid;
    } catch (error: unknown) {
      const code = getErrorCode(error);
      console.log("Register error:", code);
      return { status: "auth-failed", msg: getRegisterErrorMessage(code) };
    }

    pendingProfileRef.current = { uid, name };
    const saved = await saveProfile(uid, name);

    return saved.success
      ? { status: "success" }
      : { status: "profile-failed", msg: saved.msg };
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<RegisterResult> => {
    if (registrationRef.current) {
      return {
        status: "auth-failed",
        msg: "Registration is already in progress.",
      };
    }

    const registration = runRegistration(email.trim(), password, name.trim());
    registrationRef.current = registration.then(
      () => undefined,
      () => undefined
    );

    try {
      return await registration;
    } finally {
      registrationRef.current = null;
    }
  };

  const retryProfileSave = async (): Promise<ProfileSaveResult> => {
    const pending = pendingProfileRef.current;
    const authUser = auth.currentUser;

    if (!pending || !authUser || authUser.uid !== pending.uid) {
      return {
        success: false,
        msg: "There is no profile waiting to be saved. You can update it from your profile.",
        retryable: false,
      };
    }

    return saveProfile(pending.uid, pending.name);
  };

  const updateUserData = async (uid: string) => {
    try {
      const docRef = doc(firestore, "users", uid);
      const docSnap = await getDoc(docRef);

      if (currentUidRef.current !== uid || !docSnap.exists()) return;

      const data = docSnap.data();
      const name =
        typeof data.name === "string" && data.name.trim() ? data.name : null;

      setUser((prev) => {
        if (prev?.uid !== uid) return prev;

        return {
          ...prev,
          name: name ?? prev.name,
          image: data.image ?? prev.image ?? null,
        };
      });
    } catch (error: unknown) {
      console.log("Update user data error:", error);
    }
  };

  const contextValue: AuthContextType = {
    user,
    setUser,
    isAuthReady,
    isSignedIn,
    login,
    register,
    retryProfileSave,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be wrapped inside AuthProvider");
  }

  return context;
};
