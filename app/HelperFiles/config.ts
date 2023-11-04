import * as Device from 'expo-device';
import Config from 'react-native-config';

export const googleMapsKey = Config.GOOGLE_MAPS_API_KEY
// First URL should have laptop network IP address (may need to change it)
export let requestURL = __DEV__ ? (Device.isDevice ? 'http://192.168.40.35:8080' : 'http://localhost:8080') : 'https://dropthread-cloud-run-7bnszsbpsa-uc.a.run.app'

