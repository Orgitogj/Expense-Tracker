import { auth, firestore } from "@/config/firebase";
import { AuthContextType, UserType } from "@/types";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();

  const [user, setUser] = useState<UserType>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
        });
        updateUserData(firebaseUser.uid);

        router.replace("/(tabs)");
      } else {
        setUser(null);
        router.replace("/(auth)/welcome");
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

  const register = async (
    email: string,
    password: string,
    name: string
  ) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(firestore, "users", response.user.uid), {
        name,
        email,
        uid: response.user.uid,
      });

      return {
        success: true,
      };
    } catch (error: any) {
      console.log("Register error:", error.code);

      let msg = "Something went wrong. Please try again.";

      switch (error.code) {
        case "auth/email-already-in-use":
          msg = "This email is already registered.";
          break;

        case "auth/invalid-email":
          msg = "Please enter a valid email address.";
          break;

        case "auth/weak-password":
          msg = "Your password is too weak.";
          break;

        case "auth/network-request-failed":
          msg = "No internet connection. Please check your connection.";
          break;

        case "auth/operation-not-allowed":
          msg = "Registration is currently unavailable.";
          break;
      }

      return {
        success: false,
        msg,
      };
    }
  };

  const updateUserData = async (uid: string) => {
    try {
      const docRef = doc(firestore, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        const userData: UserType = {
          uid: data?.uid || null,
          email: data?.email || null,
          name: data?.name || null,
          image: data?.image || null,
        };

        setUser(userData);
      }
    } catch (error: any) {
      console.log("Update user data error:", error);
    }
  };

  const contextValue: AuthContextType = {
    user,
    setUser,
    login,
    register,
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
