import { sendRequest } from './Constants';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager'
import { Platform } from 'react-native';
import User from './User';
/*
    Functions to subscribe / unsubscribe from notifications
*/
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
    await sendRequest('POST', 'subscribeNotifications', {
        token: token
    })
}

export async function disableNotifications() {
    await sendRequest('POST', 'subscribeNotifications', {
        token: null
    })
}
/*
    Configuration for notifications
*/

// Notification received in foreground
Notifications.setNotificationHandler({
    handleNotification: async (notif) => {
        if (notif.request.content.data.hasOwnProperty('imgURL')) {

        }
        return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true
        }
    }
})
// Notification received in background
TaskManager.defineTask('backgroundNotification', ({data, error, executionInfo}) => {
    console.log('Received notification in background');
})
Notifications.registerTaskAsync('backgroundNotification')