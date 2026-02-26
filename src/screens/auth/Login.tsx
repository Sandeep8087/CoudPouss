import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import {
  getScaleSize,
  REGEX,
  requestLocationPermission,
  SHOW_TOAST,
  Storage,
  useString,
} from '../../constant';

//COMPONENTS
import { Header, Input, Text, Button, ProgressView } from '../../components';

//SCREENS
import { SCREENS } from '..';

//PACKAGES
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { API } from '../../api';
import Geolocation from 'react-native-geolocation-service';

import { createNewThread } from '../../services/chat';


export default function Login(props: any) {
  const STRING = useString();
  const { setUser, setUserType, setProfile, profile } =
    useContext<any>(AuthContext);
  const { theme } = useContext<any>(ThemeContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(true);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [visibleCountry, setVisibleCountry] = useState(false);

  console.log('profile==>', profile);
  // const [countryCode, setCountryCode] = useState('+91');
  // const [isPhoneNumber, setIsPhoneNumber] = useState(false);

  // useEffect(() => {
  //   if (email.length >= 3) {
  //     const isNumber = REGEX.phoneRegex.test(email);
  //     setIsPhoneNumber(isNumber)
  //   }
  //   else {
  //     setIsPhoneNumber(false)
  //   }
  // }, [email])

  useEffect(() => {
    getLocation();
  }, []);

  async function onVerification() {
    if (!email) {
      setEmailError(STRING.email_required);
    } else if (!password) {
      setPasswordError(STRING.password_required);
    } else {
      setEmailError('');
      setPasswordError('');
      onLogin();
    }
  }

  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    Geolocation.getCurrentPosition(
      position => {

      },
      error => {
        console.log('Error:', error);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 10000,
        forceRequestLocation: true,
        showLocationDialog: true,
      },
    );
  };

  async function onLogin() {
    // let params = {}
    // if (isPhoneNumber) {
    //   params = {
    //     mobile: email,
    //     phone_country_code: countryCode,
    //     password: password,
    //   }
    // } else {
    const params = {
      email: email,
      password: password,
    }
    // }
    try {
      setLoading(true);
      const result = await API.Instance.post(API.API_ROUTES.login, params);
      if (result.status) {
        Storage.save(Storage.USER_DETAILS, JSON.stringify(result?.data?.data));
        setUser(result?.data?.data);
        setUserType(result?.data?.data?.user_data?.role);
        getProfileData();
      } else {
        SHOW_TOAST(result?.data?.message, 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function getProfileData() {
    try {
      setLoading(true);
      const result = await API.Instance.get(API.API_ROUTES.getUserDetails + `?platform=app`);
      if (result.status) {
        console.log('=== Full API Response ===');
        console.log(JSON.stringify(result?.data, null, 2));

        // API returns data.data.user structure
        const userProfileData = result?.data?.data?.user;
        console.log('=== Login: Profile Data Received ===');
        console.log(
          'userProfileData:',
          JSON.stringify(userProfileData, null, 2),
        );
        console.log('All available keys:', Object.keys(userProfileData || {}));
        setProfile(result?.data?.data);

        // Save user to Firebase for chat functionality
        try {
          console.log('🧪 Testing Firebase connection first...');
          // const isConnected = await testFirebaseConnection();
          // if (!isConnected) {
          //   console.log('⚠️ Firebase connection failed, but continuing...');
          // }

          // Map profile data fields correctly - use actual field names from API
          // console.log('=== Extracting Firebase Data ===');
          // const firebaseUserData = {
          //   user_id: userProfileData?.id,
          //   name: userProfileData?.first_name || '',
          //   email: userProfileData?.email || '',
          //   mobile: userProfileData?.phone_number || '',
          //   role: userProfileData?.role || '',
          //   address:
          //     userProfileData?.elder_address || userProfileData?.address || '',
          //   avatarUrl: userProfileData?.profile_photo_url || '',
          // };
          // console.log('=== Firebase Data to Send ===');
          // console.log(JSON.stringify(firebaseUserData, null, 2));
          createNewThread(
            userProfileData.id,
            userProfileData?.first_name,
            userProfileData?.email,
            userProfileData?.phone_number,
            userProfileData?.role || '',
            userProfileData?.elder_address || userProfileData?.address || '',
            userProfileData?.profile_photo_url || '',
          )
            .then(() => { })
            .finally(() => { });
          console.log('✅ User saved to Firebase successfully');
        } catch (firebaseError: any) {
          console.log('❌ Failed to save user to Firebase:', firebaseError);
        }

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
        SHOW_TOAST(result?.data?.message, 'error');
        console.log('ERR', result?.data?.message);
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles(theme).container}>
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles(theme).mainContainer}>
          <Image source={IMAGES.ic_logo} style={styles(theme).logo} />
          <Text
            size={getScaleSize(27)}
            font={FONTS.Lato.ExtraBold}
            color={theme._2C6587}
            align="center"
            style={{ marginBottom: getScaleSize(12) }}>
            {STRING.welcome_back}
          </Text>
          <Text
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={theme._565656}
            align="center"
            style={{ marginBottom: getScaleSize(36) }}>
            {STRING.enter_your_email_and_password_to_login}
          </Text>
          <View style={styles(theme).inputContainer}>
            {/* {isPhoneNumber ? (
              <Input
                placeholder={STRING.enter_email}
                placeholderTextColor={theme._939393}
                inputTitle={STRING.email}
                inputColor={false}
                value={email}
                maxLength={10}
                keyboardType="email-address"
                autoCapitalize="none"
                countryCode={countryCode ? countryCode : '+91'}
                onPressCountryCode={() => {
                  setVisibleCountry(true);
                }}
                onChangeText={text => {
                  setEmail(text);
                  setEmailError('');
                }}
                isError={emailError}
              />
            ) : ( */}
            <Input
              placeholder={STRING.enter_email}
              placeholderTextColor={theme._939393}
              inputTitle={STRING.email}
              inputColor={false}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={text => {
                setEmail(text);
                setEmailError('');
              }}
              isError={emailError}
            />
            {/* )} */}
          </View>
          <View style={styles(theme).inputContainer}>
            <Input
              placeholder={STRING.enter_password}
              placeholderTextColor={theme._939393}
              inputTitle={STRING.password}
              inputColor={false}
              value={password}
              passwordIcon={true}
              secureTextEntry={show}
              onChnageIcon={() => {
                setShow(!show);
              }}
              onChangeText={text => {
                setPassword(text);
                setPasswordError('');
              }}
              isError={passwordError}
            />
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.Medium}
              onPress={() => {
                props.navigation.navigate(SCREENS.ResetPassword.identifier);
              }}
              color={theme._2C6587}
              align="right"
              style={{ marginTop: getScaleSize(12) }}>
              {STRING.forgot_password}
            </Text>
          </View>
          <Button
            title="Log In"
            style={{ marginBottom: getScaleSize(24) }}
            onPress={() => {
              onVerification();
            }}
          />
          <Text
            size={getScaleSize(20)}
            font={FONTS.Lato.Regular}
            color={theme._999999}
            align="center"
            style={{ marginTop: getScaleSize(12) }}>
            {STRING.dont_have_an_account}{' '}
            <Text
              size={getScaleSize(20)}
              font={FONTS.Lato.SemiBold}
              color={theme._2C6587}
              onPress={() => {
                props.navigation.navigate(SCREENS.AdditionalDetails.identifier);
              }}>
              {STRING.sign_up}
            </Text>
          </Text>
        </View>
      </ScrollView>
      {/* <SelectCountrySheet
        height={getScaleSize(500)}
        isVisible={visibleCountry}
        onPress={(e: any) => {
          console.log('e000', e);
          setCountryCode(e.dial_code);
          setVisibleCountry(false);
        }}
        onClose={() => {
          setVisibleCountry(false);
        }}
      /> */}
      {isLoading && <ProgressView />}
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1.0,
      backgroundColor: theme.white,
      justifyContent: 'center',
    },
    mainContainer: {
      flex: 1.0,
      marginHorizontal: getScaleSize(24),
      marginVertical: getScaleSize(24),
      justifyContent: 'center',
    },
    logo: {
      width: Dimensions.get('window').width - getScaleSize(240),
      height: Dimensions.get('window').width - getScaleSize(240),
      alignSelf: 'center',
      marginBottom: getScaleSize(31),
    },
    inputContainer: {
      marginBottom: getScaleSize(16),
    },
  });
