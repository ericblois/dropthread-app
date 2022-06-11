import { storage } from "./Constants";
import { Platform } from "react-native";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default class ServerData {

    // Uploads a file then returns the download URL 
    static async uploadFile(localDataPath: string, serverPath: string) {
      const fileURI = Platform.OS === "ios" ? localDataPath.replace("file://", "") : localDataPath
      const targetRef = ref(storage, serverPath)
      const response = await fetch(fileURI)
      const blob = await response.blob()
      const result = await uploadBytes(targetRef, blob)
      return (await getDownloadURL(result.ref))
    }
    // Deletes a file
    static async deleteFile(serverPath: string) {
      const targetRef = ref(storage, serverPath)
      await deleteObject(targetRef)
    }
}