import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

//CONTEXT
import { AuthContext, LaungageContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, REGEX, sanitizeAddressInput, sanitizeNameInput, SHOW_TOAST, Storage, useString } from '../../constant';

//SCREENS
import { SCREENS } from '..';

//COMPONENTS
import {
  Header,
  Input,
  Text,
  Button,
  SelectCountrySheet,
  ProgressView,
} from '../../components';

//PACKAGES
import { CommonActions } from '@react-navigation/native';
import { API } from '../../api';
import { launchImageLibrary } from 'react-native-image-picker';
import debounce from 'lodash/debounce';

export default function AddPersonalDetails(props: any) {

  const STRING = useString();

  const { theme } = useContext<any>(ThemeContext);
  const { userType, setUser, setUserType, setProfile } = useContext<any>(AuthContext);
  const { setLanguage } = useContext<any>(LaungageContext);

  const isEmail = props?.route?.params?.email || '';
  // const isPhoneNumber = props?.route?.params?.isPhoneNumber || false;
  // const isCountryCode = props?.route?.params?.countryCode || '+91';

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [mobileNoError, setMobileNoError] = useState('');
  const [email, setEmail] = useState(isEmail ? isEmail : '');
  const [emailError, setEmailError] = useState('');
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [visibleCountry, setVisibleCountry] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [profileImage, setProfileImage] = useState<any>(null);
  const [countryFlag, setCountryFlag] = useState('🇮🇳');

  // useEffect(() => {
  //   if (isPhoneNumber) {
  //     setMobileNo(isEmail);
  //     setCountryCode(isCountryCode);
  //   } else {
  //     setEmail(isEmail);
  //   }
  // }, [isEmail]);

  const getInitialName = (fullName: string) => {
    if (!fullName) return '';

    const words = fullName.trim().split(' ');

    if (words.length === 1) {
      return words[0][0]?.toUpperCase();
    }

    return (
      words[0][0]?.toUpperCase() +
      words[words.length - 1][0]?.toUpperCase()
    );
  };

  const pickImage = async () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (!response.didCancel && !response.errorCode && response.assets) {
        const asset: any = response.assets[0];
        setProfileImage(asset);
        uploadProfileImage(asset);
      } else {
        console.log('response', response);
      }
    });
  };

  async function uploadProfileImage(asset: any) {
    try {
      const formData = new FormData();
      formData.append('email', isEmail);
      formData.append('file', {
        uri: asset?.uri,
        name: asset?.fileName || 'profile_image.jpg',
        type: asset?.type || 'image/jpeg',
      });
      setLoading(true);
      const result = await API.Instance.post(
        API.API_ROUTES.uploadProfileImage,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      setLoading(false);
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success');
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
        setProfileImage(null);
      }
      console.log('error==>', result?.data?.message);
    } catch (error: any) {
      setProfileImage(null);
      setLoading(false);
      SHOW_TOAST(error?.message ?? '', 'error');
      console.log(error?.message);
    } finally {
      setLoading(false);
    }
  }

  const onSignup = useCallback(async () => {
    if (isLoading) return;
    const cleanName = name.trim();
    const cleanMobile = mobileNo.trim();
    const cleanAddress = address.trim();
    let nextNameError = '';
    let nextMobileError = '';
    let nextAddressError = '';

    if (!cleanName) {
      nextNameError = STRING.name_required;
    } else if (!/^[A-Za-z.\-\s]+$/.test(cleanName)) {
      nextNameError = STRING.name_invalid_characters;
    }

    if (!cleanMobile) {
      nextMobileError = STRING.mobile_number_required;
    } else if (!/^[0-9]{6,15}$/.test(cleanMobile)) {
      nextMobileError = STRING.mobile_number_must_be_6_to_15_digits;
    }

    if (!cleanAddress) {
      nextAddressError = STRING.address_required;
    } else if (/^\d+$/.test(cleanAddress)) {
      nextAddressError = STRING.address_only_numbers_error;
    } else if (/^[^A-Za-z0-9]+$/.test(cleanAddress)) {
      nextAddressError = STRING.address_special_char_error;
    }

    setNameError(nextNameError);
    setMobileNoError(nextMobileError);
    setAddressError(nextAddressError);

    if (nextNameError || nextMobileError || nextAddressError) {
      return;
    } else {
      setNameError('');
      setMobileNoError('');
      setAddressError('');
      const params = {
        mobile: cleanMobile,
        phone_country_code: countryCode,
        name: cleanName,
        email: email,
        address: cleanAddress,
        role: userType,
      };
      try {
        setLoading(true);
        const result = await API.Instance.post(API.API_ROUTES.addPersonalDetails, params);
        if (result?.status) {
          SHOW_TOAST(result?.data?.message ?? '', 'success');
          const userData = result?.data?.data;
          await Storage.save(
            Storage.USER_DETAILS,
            JSON.stringify(userData)
          );
          setUser(userData);
          setUserType(userData?.user_data?.role);
          await getProfileData();
        } else {
          SHOW_TOAST(result?.data?.message ?? '', 'error');
        }
      } catch (error: any) {
        SHOW_TOAST(error?.message ?? 'Something went wrong', 'error');
      } finally {
        setLoading(false);
      }
    }
  }, [address, countryCode, email, isLoading, mobileNo, name, userType, STRING, setUser, setUserType, setProfile, setLanguage]);

  const debouncedSignup = useMemo(
    () =>
      debounce(() => {
        onSignup();
      }, 500),
    [onSignup]
  );

  useEffect(() => {
    return () => {
      debouncedSignup.cancel();
    };
  }, [debouncedSignup]);

  async function getProfileData() {
    try {
      const result = await API.Instance.get(API.API_ROUTES.getUserDetails + `?platform=app`);
      if (result.status) {
        setProfile(result?.data?.data);
        setLanguage(result?.data?.data?.user?.lang);
        onNext();
      } else {
        SHOW_TOAST(result?.data?.message, 'error');
        console.log('ERR', result?.data?.message);
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
      return null;
    }
  }

  async function onNext() {
    if (userType == 'service_provider') {
      props.navigation.navigate(SCREENS.ChooseYourSubscription.identifier);
    } else {
      props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: SCREENS.BottomBar.identifier }],
        }),
      );
    }
  }

  return (
    <View style={styles(theme).container}>
      <Header
        onBack={() => {
          props.navigation.goBack();
        }}
        screenName={STRING.add_personal_details}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles(theme).mainContainer}>
          <View style={styles(theme).imageContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage?.uri }}
                style={styles(theme).image}
              />
            ) : name.trim() ? (
              <View style={styles(theme).image}>
                <Text
                  size={getScaleSize(24)}
                  font={FONTS.Lato.Regular}
                  color={theme._262B43E5}>
                  {getInitialName(name)}
                </Text>
              </View>
            ) : (
              <Image
                source={IMAGES.user_placeholder}
                style={styles(theme).image}
                resizeMode="cover"
              />
            )}
            <TouchableOpacity
              onPress={() => {
                pickImage();
              }}>
              <Text
                size={getScaleSize(16)}
                font={FONTS.Lato.SemiBold}
                color={theme._2C6587}
                align="center">
                {STRING.upload_profile_picture}
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={theme._565656}
            style={{ marginBottom: getScaleSize(16) }}>
            {STRING.enter_profile_details}
          </Text>
          <Input
            placeholder={STRING.enter_name}
            placeholderTextColor={theme._939393}
            inputTitle={STRING.name}
            inputColor={true}
            continerStyle={{ marginBottom: getScaleSize(16) }}
            value={name}
            maxLength={50}
            onChangeText={text => {
              const clean = sanitizeNameInput(text);
              setName(clean);
              setNameError('');
            }}
            isError={nameError}
          />
          <Input
            placeholder={STRING.enter_mobile_no}
            placeholderTextColor={theme._939393}
            inputTitle={STRING.mobile_no}
            inputColor={true}
            continerStyle={{ marginBottom: getScaleSize(16) }}
            value={mobileNo}
            // editable={!isPhoneNumber}
            onChangeText={text => {
              const digitsOnly = text.replace(/[^0-9]/g, '');
              setMobileNo(digitsOnly);
              setMobileNoError('');
            }}
            keyboardType="number-pad"
            maxLength={15}
            isError={mobileNoError}
            countryCode={countryCode}
            countryFlag={countryFlag}
            onPressCountryCode={() => {
              setVisibleCountry(true);
            }}
          />
          <Input
            placeholder={STRING.enter_email}
            placeholderTextColor={theme._939393}
            inputTitle={STRING.email}
            inputColor={true}
            containerStyle={{
              opacity: 0.5,
              backgroundColor: theme._F0EFF0,
            }}
            continerStyle={{ marginBottom: getScaleSize(16) }}
            value={email}
            editable={isEmail ? false : true}
            onChangeText={text => {
              setEmail(text);
              setEmailError('');
            }}
            isError={emailError}
          />
          <Input
            placeholder={STRING.enter_address}
            placeholderTextColor={theme._939393}
            inputTitle={STRING.address}
            inputColor={true}
            continerStyle={{ marginBottom: getScaleSize(16) }}
            value={address}
            maxLength={250}
            onChangeText={text => {
              const clean = sanitizeAddressInput(text);
              setAddress(clean);
              setAddressError('');
            }}
            isError={addressError}
          />

        </View>
      </ScrollView>
      <Button
        title={STRING.next}
        style={{
          marginVertical: getScaleSize(24),
          marginHorizontal: getScaleSize(24),
        }}
        disabled={isLoading}
        onPress={() => {
          if (isLoading) return;
          debouncedSignup();
        }}
      />
      {/* </KeyboardAwareScrollView> */}
      <SelectCountrySheet
        height={getScaleSize(500)}
        isVisible={visibleCountry}
        onPress={(e: any) => {
          console.log('e', e)
          setCountryCode(e.dial_code);
          setCountryFlag(e.flag);
          setVisibleCountry(false);
        }}
        onClose={() => {
          setVisibleCountry(false);
        }}
      />
      {isLoading && <ProgressView />}
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.white,
      flex: 1.0,
    },
    mainContainer: {
      // flex: 1.0,
      marginHorizontal: getScaleSize(24),
      marginVertical: getScaleSize(18),
      // justifyContent: 'center',
    },
    imageContainer: {
      alignItems: 'center',
      marginTop: getScaleSize(20),
      marginBottom: getScaleSize(16),
    },
    image: {
      backgroundColor: theme._F0EFF0,
      width: getScaleSize(126),
      height: getScaleSize(126),
      borderRadius: getScaleSize(126),
      marginBottom: getScaleSize(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
