export type UserType = {
  uid?: string;
  email?: string | null;
  name: string | null;
  image?: any;
} | null;

export type RegisterResult =
  | { status: "success"; verificationWarning?: string }
  | { status: "auth-failed"; msg: string }
  | { status: "profile-failed"; msg: string; verificationWarning?: string }
  | { status: "session-changed" };

export type ProfileSaveResult =
  { success: true } | { success: false; msg: string; retryable: boolean };

export type AuthContextType = {
  user: UserType;
  setUser: Function;
  isAuthReady: boolean;
  isSignedIn: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; msg?: string }>;
  register: (
    email: string,
    password: string,
    name: string,
  ) => Promise<RegisterResult>;
  retryProfileSave: () => Promise<ProfileSaveResult>;
  updateUserData: (userId: string) => Promise<void>;
};
