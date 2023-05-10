import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { connectStorageEmulator, getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions';
import * as geofireSource from 'geofire-common';
import { CustomImageButton } from './CompIndex';
import firebaseConfig from './firebase-config.json';
import { icons } from './StyleSheet';
import { cloudRunURL } from './config';
import * as Device from 'expo-device';

const localhost = Device.isDevice ? '192.168.10.55' : 'localhost'

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

//const cloudRunURL = 'localhost:8080'
export const cloudRun = async (method: 'GET' | 'POST', url: string, data?: any, debug: boolean = false) => {
  let bgy = cloudRunURL
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
  const response = await fetch(`${cloudRunURL}/${url}`, {
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


