import { firestore } from "@/config/firebase";
import { ResponseType, UserDataType } from "@/types";
import { doc, updateDoc } from "firebase/firestore";
import { uploadFileToStorage } from "./imageService";

export const updateUser=async(
    uid:string,
    updatedData:UserDataType
):Promise<ResponseType>=>{
    try{
        if(updatedData.image&&updatedData?.image?.uri){
            const imageUpload=await uploadFileToStorage(updatedData.image,"users");
            if(!imageUpload.success){
                return {success:false,msg:imageUpload.msg||"Failed to upload image"};
            }
            updatedData.image=imageUpload.data;
        }
        const userRef=doc(firestore,"users",uid);
        await updateDoc(userRef,updatedData);
        return{success:true,msg:"Updated successfuly"};
    }
    catch(error:any){
        console.log('error updating user:',error);
        return {success:false,msg:error?.message}

    }
}
