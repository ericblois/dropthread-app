import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { httpsCallable } from "firebase/functions"
import uuid from "react-native-uuid"
import { Coords, ItemData, UserData } from "../HelperFiles/DataTypes"
import { auth, cloudRun, functions } from "./Constants"
import { LocalCache } from "./LocalCache"
import ServerData from "./ServerData"
import Geolocation from "react-native-geolocation-service"
import Permissions from "react-native-permissions"
import { Platform } from "react-native"

export default abstract class User {

    // Create a new user from a UserData object, returns UserCredential
    static create = async (userData: UserData, pass: string) => {
        // Create a new user account using email
        const cred = await createUserWithEmailAndPassword(auth, userData.email, pass)
        // Add name to user account
        await updateProfile(cred.user, { displayName: userData.name })
        await cloudRun('POST', "createUser", {
            userData: userData
        })
        return cred.user.uid
    }
    // Get the account data of the current user
    static getCurrent() {
        if (auth.currentUser) {
            return auth.currentUser
        } else {
            throw new Error("Could not retrieve the current user.")
        }
    }

    // Get the data of the current user
    static async get() {
        const cacheResult = LocalCache.getUser(User.getCurrent().uid)
        if (cacheResult) {
            return cacheResult
        }
        const result = await cloudRun('POST', "getUser", {
            userID: User.getCurrent().uid
        }) as UserData
        LocalCache.saveUser(User.getCurrent().uid, result)
        return result
    }

    // Update fields in the user's document
    static async update(data: Partial<UserData>) {
        if (!data.userID) {
            throw new Error('No user ID provided for update')
        }
        await cloudRun('POST', "updateUser", {
            userData: data
        })
        // Reload this user in cache
        LocalCache.forceReloadUser(data.userID)
        return
    }
    // Delete the current user
    /*static async deleteAccount() {
            const currentUser = User.getCurrent()
            const userDocRef = firestore.doc("/users/".concat(currentUser.uid))
            const userDoc = (await userDocRef.get()).data() as UserData
            await currentUser.delete()
            await ServerData.deleteDoc(userDocRef)
            await firestore.runTransaction(async (transaction) => {
                
            })
    }*/

    public static async uploadItemImages(itemID: string, localPaths: string[]) {
        const downloadURLs = await Promise.all(localPaths.map(async (localPath) => {
            // Generate a new uuid to be used as the filename
            const newID = uuid.v4()
            const serverPath = `users/${User.getCurrent().uid}/items/${itemID}/images/${newID}.jpg`
            const result = await ServerData.uploadFile(localPath, serverPath)
            return result
        }))
        return downloadURLs
    }

    public static async deleteImages(downloadURLs: string[]) {
        // Server will automatically update item data, if it still exists
        await Promise.all(downloadURLs.map((downloadURL) => {
            const serverPath = downloadURL.substring(downloadURL.lastIndexOf('/') + 1, downloadURL.indexOf('?')).replace(/\%2F/g, '/')
            return ServerData.deleteFile(serverPath)
        }))
    }

    public static getLocation(): Promise<Coords> {
        return new Promise(async (resolve, reject) => {
            // Check location permission
            const perm = Platform.OS === 'ios' ? Permissions.PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : Permissions.PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
            const auth = await Permissions.check(perm)
            // Permission isn't given
            if (auth !== 'granted' && auth !== 'limited') {
                // Request permission
                const newAuth = await Geolocation.requestAuthorization('whenInUse')
                // Rejected
                if (newAuth !== 'granted') {
                    reject('Location permission rejected.')
                }
            }
            // Get location
            Geolocation.getCurrentPosition((pos) => {
                console.log('got it')
                resolve({
                    lat: pos.coords.latitude,
                    long: pos.coords.longitude
                })
            }, (e) => reject(e), {
                enableHighAccuracy: true,
                timeout: 10000
            })
        })
    }
}