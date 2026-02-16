import React, {useContext, useEffect, useRef} from 'react';
import {Alert, Linking, PermissionsAndroid, Platform, View} from 'react-native';

//COMPONENTS
import {Tabbar} from '../components';

//SCREENS
import {TABS} from '.';

//CONTEXT
import {AuthContext} from '../context';

//PACKAGES
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {getApp} from '@react-native-firebase/app';
import {
  getMessaging,
  registerDeviceForRemoteMessages,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

const Tab = createBottomTabNavigator();

function BottomBar(props: any) {
  const {userType} = useContext<any>(AuthContext);

  const isProfile = props?.route?.params?.isProfile ?? false;
  const isValidationService =
    props?.route?.params?.isValidationService ?? false;
  const isTask = props?.route?.params?.isTask ?? false;
  const isProfessionalProfile =
    props?.route?.params?.isProfessionalProfile ?? false;

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
    }
    if (isProfessionalProfile) {
      return TABS.Profile.identifier;
    } else {
      return TABS.ProfessionalHome.identifier;
    }
  }

  useEffect(() => {
    getNotificationTokens();
  }, []);

  async function getNotificationTokens() {
    try {
      const token: any = await requestPermissionsAndToken();
      console.log('token===', JSON.stringify(token));
      if (token) {
        console.log('token===', JSON.stringify(token));
        // onUpdateFcmToken(token)
      } else {
        console.log('No FCM token received');
      }
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  }

  async function requestPermissionsAndToken() {
    if (Platform.OS === 'android') {
      try {
        const status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (status) {
          const app: any = getApp();
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
              onPress: () => {},
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
            {text: 'No', style: 'cancel'},
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
