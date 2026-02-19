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
import React, { useContext, useEffect, useState } from 'react';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, REGEX, SHOW_TOAST, Storage, useString } from '../../constant';

//SCREENS
import { SCREENS } from '..';

//COMPONENTS
import {
  Header,
  Input,
  Text,
  Button,
  SelectCountrySheet,
} from '../../components';
import { CommonActions } from '@react-navigation/native';
import { API } from '../../api';
import { launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddPersonalDetails(props: any) {
  const STRING = useString();

  const { theme } = useContext<any>(ThemeContext);
  const { userType, setUser, setUserType, setProfile } =
    useContext<any>(AuthContext);

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

  async function onSignup() {

    // REGEX (clean + strict)
    const emojiRegex =
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+)/;

    const nameRegex = /^[A-Za-z.\- ]+$/;
    const onlyNumbers = /^\d+$/;
    const onlySpecialChars = /^[^A-Za-z0-9]+$/;
    const mobileRegex = /^[0-9]{10}$/;

    // Trim everything first
    const cleanName = name.trim();
    const cleanMobile = mobileNo.trim();
    const cleanAddress = address.trim();
    const cleanEmail = email.trim();

    // Update state with trimmed values
    setName(cleanName);
    setMobileNo(cleanMobile);
    setAddress(cleanAddress);
    setEmail(cleanEmail);

    let hasError = false;

    setNameError('');
    setMobileNoError('');
    setEmailError('');
    setAddressError('')

    // NAME VALIDATION 
    if (!cleanName) {
      setNameError(STRING.name_required);
      hasError = true;
    } else if (cleanName.length < 2 || cleanName.length > 50) {
      setNameError(STRING.name_min_max_error);
      hasError = true;
    } else if (emojiRegex.test(cleanName)) {
      setNameError(STRING.emoji_not_allowed);
      hasError = true;
    } else if (!nameRegex.test(cleanName)) {
      setNameError(STRING.name_invalid_characters);
      hasError = true;
    }

    // MOBILE VALIDATION 
    if (!cleanMobile) {
      setMobileNoError(STRING.mobile_number_required);
      hasError = true;
    } else if (!mobileRegex.test(cleanMobile)) {
      setMobileNoError(STRING.mobile_must_be_10_digits);
      hasError = true;
    }

    // EMAIL VALIDATION 
    if (!cleanEmail) {
      setEmailError(STRING.email_required);
      hasError = true;
    } else if (
      cleanEmail.length < 6 ||
      cleanEmail.length > 100 ||
      !REGEX.email.test(cleanEmail)
    ) {
      setEmailError(STRING.please_enter_valid_email);
      hasError = true;
    }

    // ADDRESS VALIDATION 
    if (!cleanAddress) {
      setAddressError(STRING.address_required);
      hasError = true;
    } else if (cleanAddress.length < 2 || cleanAddress.length > 250) {
      setAddressError(STRING.address_min_max_error);
      hasError = true;
    } else if (emojiRegex.test(cleanAddress)) {
      setAddressError(STRING.emoji_not_allowed);
      hasError = true;
    } else if (onlyNumbers.test(cleanAddress)) {
      setAddressError(STRING.address_only_numbers_error);
      hasError = true;
    } else if (onlySpecialChars.test(cleanAddress)) {
      setAddressError(STRING.address_special_char_error);
      hasError = true;
    }

    if (hasError) {
      return
    }
    else {
      const params = {
        mobile: cleanMobile,
        phone_country_code: countryCode,
        name: cleanName,
        email: cleanEmail,
        address: cleanAddress,
        role: userType,
      };

      try {
        setLoading(true);
        const result = await API.Instance.post(
          API.API_ROUTES.addPersonalDetails,
          params,
        );

        if (result.status) {
          SHOW_TOAST(result?.data?.message ?? '', 'success');
          Storage.save(
            Storage.USER_DETAILS,
            JSON.stringify(result?.data?.data),
          );
          setUser(result?.data?.data);
          setUserType(result?.data?.data?.user_data?.role);
          getProfileData();
        } else {
          SHOW_TOAST(result?.data?.message ?? '', 'error');
        }
      } catch (error: any) {
        SHOW_TOAST(error?.message ?? '', 'error');
      } finally {
        setLoading(false);
      }
    }
  }

  async function getProfileData() {
    try {
      setLoading(true);
      const result = await API.Instance.get(API.API_ROUTES.getUserDetails);
      if (result.status) {
        setProfile(result?.data?.data);
        onNext();
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
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
                setName(text.replace(/\s+/g, ' '));
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
              maxLength={10}
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
                setAddress(text.replace(/\s+/g, ' '));
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
          onPress={() => {
            onSignup();
          }}
        />
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
      </View>
      <SafeAreaView />
    </KeyboardAvoidingView>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.white,
      justifyContent: 'center',
    },
    mainContainer: {
      flex: 1.0,
      marginHorizontal: getScaleSize(24),
      marginVertical: getScaleSize(18),
      justifyContent: 'center',
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
