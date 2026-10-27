import { auth, firestore } from "@/lib/firebase";
import { UserDataType } from "@/features/profile/types";
import { ResponseType } from "@/lib/types";
import { doc, setDoc } from "firebase/firestore";
import { uploadFileToStorage } from "./imageService";

export const updateUser = async (
  uid: string,
  updatedData: UserDataType,
): Promise<ResponseType> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) {
      return {
        success: false,
        msg: "You must be signed in to update your profile",
      };
    }
    const data: Record<string, any> = { ...updatedData };
    if (data.image && data.image?.uri) {
      const imageUpload = await uploadFileToStorage(data.image, "users");
      if (!imageUpload.success) {
        return {
          success: false,
          msg: imageUpload.msg || "Failed to upload image",
        };
      }
      data.image = imageUpload.data;
    }
    data.uid = currentUser.uid;
    data.email = currentUser.email;
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );
    const userRef = doc(firestore, "users", uid);
    await setDoc(userRef, cleanData, { merge: true });
    return { success: true, msg: "Updated successfuly" };
  } catch (error: any) {
    console.log("error updating user:", error);
    return { success: false, msg: error?.message };
  }
};
