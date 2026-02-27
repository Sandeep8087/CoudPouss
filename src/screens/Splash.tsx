import {
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useContext, useEffect} from 'react';

//CONTEXT
import {AuthContext, ThemeContext, ThemeContextType} from '../context';

//CONSTANT & ASSETS
import {IMAGES} from '../assets';
import {getScaleSize, SHOW_TOAST, Storage} from '../constant';

//SCREENS
import {SCREENS} from '.';
import {CommonActions} from '@react-navigation/native';

//API
import {API} from '../api';

import Geolocation from 'react-native-geolocation-service';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';

export default function Splash(props: any) {
  const {theme} = useContext(ThemeContext);
  const {setUser, setUserType, setProfile} = useContext<any>(AuthContext);

  useEffect(() => {
    checkUserDetails();
  }, []);

  useEffect(() => {
    requestPermissions();
    getLocation();
  }, []);

  const hasLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const status = await request(PERMISSIONS.IOS.CAMERA);
      if (status === RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  async function getLocation() {
    const permission = await hasLocationPermission();
    if (!permission) return;

    Geolocation.getCurrentPosition(
      position => {
        console.log('position', position);
      },
      error => {
        console.log('Error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  }

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
    } else {
      await request(PERMISSIONS.IOS.CAMERA);
    }
  };

  async function checkUserDetails() {
    const userDetails = await Storage.get(Storage.USER_DETAILS);
    const userData = JSON.parse(userDetails ?? '{}');
    if (userData && userData?.user_data?.role) {
      setUser(userData);
      setUserType(userData?.user_data?.role);
      getProfileData();
    } else {
      setTimeout(() => {
        props?.navigation?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: SCREENS.Login.identifier}],
          }),
        );
        setUser('');
        setUserType('');
        setProfile('');
      }, 2000);
    }
  }

  async function getProfileData() {
    try {
      const result = await API.Instance.get(
        API.API_ROUTES.getUserDetails + `?platform=app`,
      );
      if (result.status) {
        setProfile(result?.data?.data);
        props.navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: SCREENS.BottomBar.identifier,
              },
            ],
          }),
        );
      } else {
        props.navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: SCREENS.Login.identifier,
              },
            ],
          }),
        );
      }
    } catch (error: any) {
      props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: SCREENS.Login.identifier,
            },
          ],
        }),
      );
    }
  }

  return (
    <View style={styles(theme).container}>
      <SafeAreaView />
      <View style={styles(theme).statusBar}>
        <StatusBar
          translucent={true}
          backgroundColor={theme.primary}
          barStyle={'light-content'}
        />
      </View>
      <Image source={IMAGES.ic_logo} style={styles(theme).logo} />
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1.0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.primary,
    },
    logo: {
      width: Dimensions.get('window').width - getScaleSize(116),
      height: Dimensions.get('window').width - getScaleSize(116),
    },
    statusBar: {
      // height: StatusBar.currentHeight
    },
  });
