import React, { useContext, useEffect, useRef } from 'react';
import { Alert, Linking, PermissionsAndroid, Platform, View } from 'react-native';

//COMPONENTS
import { Tabbar } from '../components';

//SCREENS
import { TABS } from '.';

//CONTEXT
import { AuthContext } from '../context';

//PACKAGES
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getApp, initializeApp, getApps } from '@react-native-firebase/app';
import {
  getMessaging,
  registerDeviceForRemoteMessages,
  AuthorizationStatus,
  onNotificationOpenedApp,
  getInitialNotification,
  onMessage,
} from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';

//API
import { API } from '../api';

const Tab = createBottomTabNavigator();

function BottomBar(props: any) {
  const { userType } = useContext<any>(AuthContext);

  const isProfile = props?.route?.params?.isProfile ?? false;
  const isValidationService =
    props?.route?.params?.isValidationService ?? false;
  const isTask = props?.route?.params?.isTask ?? false;
  const isProfessionalProfile = props?.route?.params?.isProfessionalProfile ?? false;

  function getInitialRouteName() {
    if (isProfile) {
      return TABS.Profile.identifier;
    } else if (isValidationService) {
      return TABS.Request.identifier;
    } else {
      return TABS.Home.identifier;
    }
  }

  function getProfessionalRouteName() {
    console.log('isTask==>', isTask);
    if (isTask) {
      return TABS.Task.identifier;
    } if (isProfessionalProfile) {
      return TABS.Profile.identifier;
    } else {
      return TABS.ProfessionalHome.identifier;
    }
  }

  const firebaseConfig = {
    apiKey: 'your-api-key',
    projectId: 'your-project-id',
    appId: 'your-app-id',
    messagingSenderId: 'your-sender-id',
  };

  useEffect(() => {
    PushNotification.createChannel(
      {
        channelId: 'coudpouss_notification', // Must match the one you use in localNotification
        channelName: 'CoudPouss Notifications',
        channelDescription: 'Channel for CoudPouss foreground notifications',
        playSound: true,
        soundName: 'default',
        importance: 4, // HIGH importance
        vibrate: true,
      },
      created => console.log(`createChannel returned '${created}'`), // true if created, false if already exists
    );
    
    const unsubscribe = getMessaging().onMessage(async remoteMessage => {
      // When app in foreground
      console.log('Message handled in the foregroud!', remoteMessage);
      if (Platform.OS === 'ios') {
        PushNotificationIOS.presentLocalNotification({
          alertTitle: remoteMessage?.notification?.title,
          alertBody: remoteMessage?.notification?.body ?? '',
          userInfo: remoteMessage.data,
        });
      } else {
        PushNotification.localNotification({
          channelId: 'coudpouss_notification',
          vibration: 300,
          priority: 'high',
          importance: 'high',
          title: remoteMessage?.notification?.title ?? '',
          message: remoteMessage?.notification?.body ?? '',
          smallIcon: 'ic_stat_notification',
          largeIcon: 'ic_stat_notification',
          userInfo: remoteMessage?.data,
        });
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    getNotificationTokens();
  }, []);

  async function getNotificationTokens() {
    try {
      const token: any = await requestPermissionsAndToken();
      console.log('token===', JSON.stringify(token));
      if (token) {
        console.log('token===', JSON.stringify(token));
        onNotification(token);
      } else {
        console.log('No FCM token received');
      }
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  }

  async function onNotification(token: any) {
    try {
      const params = {
        token: token,
        platform: Platform.OS,
      }
      const result = await API.Instance.post(API.API_ROUTES.onNotification, params);
      console.log('result', result.status, result)
      if (result.status) {
        console.log('result==>', result?.data?.message)
      } else {
        console.log('error==>', result?.data?.message)

      }
    } catch (error: any) {
      console.log(error?.message)
    }
  }

  async function requestPermissionsAndToken() {
    if (Platform.OS === 'android') {
      try {
        const status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (status) {
          const app: any =
            getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
          let fcmToken = await getMessaging(app).getToken();
          return fcmToken;
        }
      } catch (error) {
        Alert.alert(
          'Notification was declined.',
          'Go to your settings and enable notifications always.',
          [
            {
              text: 'No',
              onPress: () => { },
            },
            {
              text: 'Open Settings',
              onPress: () => {
                Linking.openSettings();
              },
            },
          ],
        );

        return null;
      }
    } else {
      const fcmToken = await requestFCMToken();
      return fcmToken;
    }
  }

  const requestFCMToken = async (): Promise<string | null> => {
    try {
      // Initialize app if not already
      const app: any = getApp();

      const messaging = getMessaging(app);

      // Register the device
      await registerDeviceForRemoteMessages(messaging);

      // Request permission
      const authStatus = await messaging.requestPermission();

      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const fcmToken = await messaging.getToken();
        return fcmToken;
      } else {
        Alert.alert(
          'Notification was declined.',
          'Go to your settings and enable notifications always.',
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                Linking.openSettings();
              },
            },
          ],
        );
        return null;
      }
    } catch (error) {
      console.error('FCM Token Error:', error);
      return null;
    }
  };

  if (userType === 'service_provider') {
    return (
      <>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName={getProfessionalRouteName()}
          tabBar={props => {
            return <Tabbar {...props} />;
          }}>
          <Tab.Screen
            name={TABS.ProfessionalHome.identifier}
            component={TABS.ProfessionalHome.component}
          />
          <Tab.Screen
            name={TABS.Task.identifier}
            component={TABS.Task.component}
          />
          <Tab.Screen
            name={TABS.Chat.identifier}
            component={TABS.Chat.component}
          />
          <Tab.Screen
            name={TABS.Profile.identifier}
            component={TABS.Profile.component}
          />
        </Tab.Navigator>
      </>
    );
  } else {
    return (
      <>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName={getInitialRouteName()}
          tabBar={props => {
            return <Tabbar {...props} />;
          }}>
          <Tab.Screen
            name={TABS.Home.identifier}
            component={TABS.Home.component}
          />
          <Tab.Screen
            name={TABS.Request.identifier}
            component={TABS.Request.component}
          />
          <Tab.Screen name={'plus'} component={() => <View />} />
          <Tab.Screen
            name={TABS.Chat.identifier}
            component={TABS.Chat.component}
          />
          <Tab.Screen
            name={TABS.Profile.identifier}
            component={TABS.Profile.component}
          />
        </Tab.Navigator>
      </>
    );
  }
}

export default BottomBar;
