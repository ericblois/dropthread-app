import { cloudRun } from './Constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import User from './User';

export async function subscribeNotifications() {
    let status = await Notifications.getPermissionsAsync()
    if (!status.granted) {
        status = await Notifications.requestPermissionsAsync()
        if (!status.granted)
        throw new Error('Could not get permissions for notifications')
        
    } else {
        const userData = await User.get()
        if (userData.expoPushToken) {
            return
        }
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data
    // On Android, a channel needs to be set
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }
    await cloudRun('POST', 'subscribeNotifications', {
        token: token
    })
}

export async function disableNotifications() {
    await cloudRun('POST', 'subscribeNotifications', {
        token: null
    })
}

Notifications.setNotificationHandler({
    handleNotification: async (notif) => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true
    })
})