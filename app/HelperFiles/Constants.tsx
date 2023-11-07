import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { connectStorageEmulator, getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions';
import * as geofireSource from 'geofire-common';
import { CustomImageButton } from './CompIndex';
import { icons } from './StyleSheet';
import * as Device from 'expo-device';
import Config from 'react-native-config';
import { Coords } from './DataTypes';
import { hereApiKey } from './config';

const localhost = Device.isDevice ? '192.168.40.35' : 'localhost'
// First URL should have laptop network IP address (may need to change it)
let requestURL = __DEV__ ? (Device.isDevice ? 'http://192.168.40.35:8080' : 'http://localhost:8080') : 'https://dropthread-cloud-run-7bnszsbpsa-uc.a.run.app'

const firebaseConfig = {
  apiKey: Config.FIREBASE_API_KEY,
  appId: Config.FIREBASE_APP_ID,
  authDomain: Config.FIREBASE_AUTH_DOMAIN,
  messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID,
  projectId: Config.FIREBASE_PROJECT_ID,
  storageBucket: Config.FIREBASE_STORAGE_BUCKET
}

// Initialize Firebase
if (getApps().length < 1) {
  initializeApp(firebaseConfig, 'Dropthread')
}

export const firebaseApp = getApp('Dropthread');
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);
export const functions = getFunctions(firebaseApp);

if (__DEV__) {
  connectAuthEmulator(auth, `http://${localhost}:9099`);
  connectStorageEmulator(storage, localhost, 9199);
}

export const geofire = geofireSource

export const currencyFormatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD"
  } as Intl.NumberFormatOptions
)

export const simpleCurrencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0
} as Intl.NumberFormatOptions
)

export const reverseGeocode = async (coords: Coords) => {
    // Send request
    const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${coords.lat}%2C${coords.long}&lang=en-US&apiKey=${hereApiKey}`
    const res = await fetch(url)
    const resJson = await res.json() as {
      items: {
        title: string,
        id: string,
        resultType: string,
        houseNumberType: string,
        address: {
          label: string,
          countryCode: string,
          countryName: string,
          state: string,
          county: string,
          city: string,
          district: string,
          street: string,
          postalCode: string,
          houseNumber: string
        },
        position: {
          lat: number,
          lng: number
        },
        access: 
          {
            lat: number,
            lng: number
          }[],
        distance: number,
        mapView: {
          west: number,
          south: number,
          east: number,
          north: number
        }
      }[]
    }
    //Check if request was successful
    if (resJson && resJson.items && resJson.items.length > 0) {
      return resJson.items[0]
    }
}

//const requestURL = 'localhost:8080'
export const sendRequest = async (method: 'GET' | 'POST', url: string, data?: any, debug: boolean = false) => {
  // Get auth token
  if (!auth.currentUser) {
    throw new Error('Could not retrieve user');
  }
  const token = await auth.currentUser!.getIdToken();
  if (!token) {
    throw new Error(`Could not retrieve token for user: ${auth.currentUser?.uid}`)
  }
  if (debug) {
    console.log(`REQUEST ${method} ${url}
    token: ${token.substring(0, 20)}...
    body: ${JSON.stringify({
      ...data,
      JWTToken: token
    })}`)
  }
  // Send request
  const response = await fetch(`${requestURL}/${url}`, {
    method: method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...data,
      JWTToken: token
    }),
    mode: 'cors'
  })
  const text = await response.text()
  if (!response.ok) {
    throw JSON.parse(text);
  }
  //const result = await response.json()
  if (debug) {
    console.log(`
    ${method} ${url} RESPONSE:
    ${text}
    `)
  }
  return text !== '' ? JSON.parse(text) : null
}


