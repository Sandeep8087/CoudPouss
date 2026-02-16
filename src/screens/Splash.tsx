import {
  Dimensions,
  Image,
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

export default function Splash(props: any) {
  const {theme} = useContext(ThemeContext);
  const {setUser, setUserType, setProfile} = useContext<any>(AuthContext);

  useEffect(() => {
    checkUserDetails();
  }, []);

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
      const result = await API.Instance.get(API.API_ROUTES.getUserDetails);
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
