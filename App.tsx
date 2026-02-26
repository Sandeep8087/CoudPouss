import React, {ReactElement, useContext, useEffect, useRef} from 'react';
import {
  Linking,
  LogBox,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

//CONTEXT
import {ThemeProvider, AuthProvider, ThemeContext} from './src/context';

//CONSTANT & ASSETS
import {getScaleSize} from './src/constant';
import {FONTS} from './src/assets';
import {ThemeName} from './src/context/ThemeProvider';

//SCREENS
import {SCREENS} from './src/screens';

//PACKAGES
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import _ from 'lodash';
import KeyboardManager from 'react-native-keyboard-manager';
import Toast, {
  BaseToast,
  ErrorToast,
  InfoToast,
} from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

LogBox.ignoreAllLogs(true);

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{backgroundColor: '#FFFFFF', borderLeftColor: '#2E7D32'}}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1NumberOfLines={3}
      text1Style={{
        fontSize: getScaleSize(12),
        color: '#000000',
        fontFamily: FONTS.Lato.Regular,
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{backgroundColor: '#FFFFFF', borderLeftColor: '#FF5959'}}
      text1NumberOfLines={3}
      text1Style={{
        fontSize: getScaleSize(12),
        color: '#000000',
        fontFamily: FONTS.Lato.Regular,
      }}
    />
  ),
  info: (props: any) => (
    <InfoToast
      style={{backgroundColor: '#FFFFFF', borderLeftColor: '#FF5959'}}
      {...props}
      text1NumberOfLines={3}
      text1Style={{
        fontSize: getScaleSize(12),
        color: '#000000',
        fontFamily: FONTS.Lato.Regular,
      }}
    />
  ),
};

const {Navigator, Screen} = createStackNavigator();

function App(): any {
  // const toastRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      KeyboardManager.setEnable(true);
    }
  }, []);

  function AppWrraper(): ReactElement {
    const {currentTheme} = useContext(ThemeContext);

    return (
      <View style={styles.container}>
        <NavigationContainer>
          <Navigator
            screenOptions={{
              headerShown: false,
              gestureEnabled: false,
            }}
            initialRouteName={SCREENS.Splash.identifier}>
            {_.toArray(SCREENS).map((item: any, index: number) => {
              return item.component ? (
                <Screen
                  key={item.identifier}
                  name={item.identifier}
                  component={item.component}
                />
              ) : null;
            })}
          </Navigator>
        </NavigationContainer>
        <Toast config={toastConfig} />
      </View>
    );
  }

  // useEffect(() => {
  //   openApp();
  // }, []);

  // const openApp = async () => {
  //   PushNotification.createChannel(
  //     {
  //       channelId: 'coudpouss_notification',
  //       channelName: 'CoudPouss Notifications',
  //       channelDescription: 'Notifications for CoudPouss app',
  //       playSound: true,
  //       soundName: 'default',
  //       vibrate: true,
  //     },
  //     (created: any) => console.log(`createChannel returned index'${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
  //   );

  //   messaging().onMessage((remoteMessage: any) => {
  //     const {notification, messageId, data} = remoteMessage;
  //     console.log('notification:::>>', JSON.stringify(remoteMessage));
  //     if (notification) {
  //       PushNotification.localNotification({
  //         // message: notification?.body ? notification?.body : '',
  //         // channelId: 'my-channel',
  //         // title: notification?.title ? notification?.title : 'Lushful',
  //         // vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
  //         // priority: 'high', // (optional) set notification priority, default: high
  //         // importance: 'high',
  //         // soundName: 'default',
  //         // playSound: false,
  //         // invokeApp: true, // Ensures the app opens when tapped
  //         // data: data,

  //         title: remoteMessage?.notification?.title || 'New Message',
  //         message: remoteMessage?.notification?.body || '',
  //         channelId: 'coudpouss_notification',
  //         vibration: 300,
  //         priority: 'high',
  //         importance: 'high',
  //         soundName: 'default',
  //         playSound: false,
  //         invokeApp: true, // Ensures the app opens when tapped
  //       });
  //     }
  //   });
  // };

  return (
    <SafeAreaView style={{flex: 1.0}}>
      <ThemeProvider>
        <AuthProvider>{AppWrraper()}</AuthProvider>
      </ThemeProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1.0,
    backgroundColor: 'Transparent',
  },
});

export default App;
