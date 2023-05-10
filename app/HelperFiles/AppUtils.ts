import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { httpsCallable } from "firebase/functions"
import uuid from "react-native-uuid"
import { Coords, ItemData, UserData } from "./DataTypes"
import { auth, cloudRun, functions } from "./Constants"
import { LocalCache } from "./LocalCache"
import ServerData from "./ServerData"
import * as Location from "expo-location"
import { NavigationContainerRef } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "./Navigation"
import { DeviceEventEmitter } from "react-native"

export default abstract class AppUtils {

    // Check if location permission is granted
    public static async hasLocationPermission() {
        let servicesEnabled = await Location.hasServicesEnabledAsync();
        let geoPerm = await Location.getForegroundPermissionsAsync();
        return servicesEnabled && geoPerm.granted;
    }

    // Request location permission
    public static async requestLocationPermission() {
        const perms = await Location.getForegroundPermissionsAsync();
        if (!perms.granted) {
            if (!perms.canAskAgain) {
                return false;
            }
            let geoPerm = await Location.requestForegroundPermissionsAsync();
            return geoPerm.granted;
        }
        return true;
    }

    public static hasNotificationPermission() {
        return false;
    }
    public static hasCameraPermission() {
        return false;
    }
    public static hasPhotoPermission() {
        return false;
    }

    public static getLocation(): Promise<Coords> {
        return new Promise(async (resolve, reject) => {
            try {
                // Check location permission
                let auth = await Location.getForegroundPermissionsAsync()
                // Permission isn't given
                if (!auth.granted) {
                    // Request permission
                    auth = await Location.requestForegroundPermissionsAsync()
                    // Rejected
                    if (!auth.granted) {
                        reject('Location permission rejected.')
                    }
                }
                // Get location
                const pos = await Location.getCurrentPositionAsync({
                    accuracy: Location.LocationAccuracy.Balanced
                })
                resolve({
                    lat: pos.coords.latitude,
                    long: pos.coords.longitude
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    public static errorMessage(code: string): string {
        switch (code) {
            case 'auth/invalid-email':
                return 'Invalid email address.'
            case 'auth/user-disabled':
                return 'This account has been disabled.'
            case 'auth/user-not-found':
                return 'This account does not exist.'
            case 'auth/wrong-password':
                return 'Incorrect password.'
            case 'auth/email-already-in-use':
                return 'This email is already in use.'
            case 'auth/operation-not-allowed':
                return 'This operation is not allowed.'
            case 'auth/weak-password':
                return 'Password is too weak.'
            case 'auth/id-token-revoked':
                auth.signOut().then(() => {
                    DeviceEventEmitter.emit('goToEntry');
                })
                return 'Session has expired. Please sign out and log back in.'
            case 'app/invalid-credential':
                return 'Server error.'
            case 'Network request failed':
                return 'There was a network issue. Please check your internet connection and try again.'
            default:
                return 'An error occurred.'
        }
    }
}