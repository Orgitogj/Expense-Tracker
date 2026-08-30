import { storage } from "@/config/firebase";
import { ResponseType } from "@/types";
import { File } from "expo-file-system";
import { getDownloadURL, ref, uploadString } from "firebase/storage";

export const getProfileImage=(file:any)=>{
   if(file&& typeof file=='string') return file; 
   if(file&& typeof file=='object' ) return file.uri;
   return require('../assets/images/defaultAvatar.png');
}

export const uploadFileToStorage=async(
    file:any,
    folderName:string
):Promise<ResponseType>=>{
    try{
        if(!file) return {success:true,data:null};

        if(typeof file=='string') return {success:true,data:file};

        if(!file?.uri) return {success:false,msg:"Could not read the selected image"};

        const base64=await new File(file.uri).base64();
        const contentType=file.mimeType||"image/jpeg";
        const fileRef=ref(storage,`${folderName}/${Date.now()}`);

        await uploadString(fileRef,base64,"base64",{contentType});
        const downloadUrl=await getDownloadURL(fileRef);

        return {success:true,data:downloadUrl};
    }
    catch(error:any){
        console.log('error uploading file:',error);
        return {success:false,msg:error?.message||"Could not upload the image"};
    }
}
