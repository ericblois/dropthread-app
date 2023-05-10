import * as Device from 'expo-device';

// First URL should have laptop network IP address (may need to change it)

export let cloudRunURL = __DEV__ ? (Device.isDevice ? 'http://192.168.10.55:8080' : 'http://localhost:8080') : 'https://dropthread-cloud-run-7bnszsbpsa-uc.a.run.app'