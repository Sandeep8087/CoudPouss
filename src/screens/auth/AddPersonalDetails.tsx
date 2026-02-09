import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';

//CONTEXT
import {AuthContext, ThemeContext, ThemeContextType} from '../../context';

//CONSTANT & ASSETS
import {FONTS, IMAGES} from '../../assets';
import {getScaleSize, SHOW_TOAST, Storage, useString} from '../../constant';

//SCREENS
import {SCREENS} from '..';

//COMPONENTS
import {
  Header,
  Input,
  Text,
  Button,
  SelectCountrySheet,
} from '../../components';
import {CommonActions} from '@react-navigation/native';
import {API} from '../../api';
import {launchImageLibrary} from 'react-native-image-picker';

export default function AddPersonalDetails(props: any) {
  const STRING = useString();

  const {theme} = useContext<any>(ThemeContext);
  const {userType, setUser, setUserType, setProfile} =
    useContext<any>(AuthContext);

  const isEmail = props?.route?.params?.email || '';
  const isPhoneNumber = props?.route?.params?.isPhoneNumber || false;
  const isCountryCode = props?.route?.params?.countryCode || '+91';

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [mobileNoError, setMobileNoError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [visibleCountry, setVisibleCountry] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [profileImage, setProfileImage] = useState<any>(null);

  useEffect(() => {
    if (isPhoneNumber) {
      setMobileNo(isEmail);
      setCountryCode(isCountryCode);
    } else {
      setEmail(isEmail);
    }
  }, [isEmail]);

  const pickImage = async () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
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
      formData.append(isPhoneNumber ? 'mobile' : 'email', isEmail);
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
    if (!name) {
      setNameError(STRING.please_enter_your_name);
    } else if (!mobileNo) {
      setMobileNoError(STRING.please_enter_your_mobile_number);
    } else if (!email) {
      setEmailError(STRING.please_enter_your_email);
    } else if (!address) {
      setAddressError(STRING.please_enter_your_address);
    } else {
      setNameError('');
      setMobileNoError('');
      setEmailError('');
      setAddressError('');

      const params = {
        mobile: mobileNo,
        phone_country_code: countryCode,
        name: name,
        email: email,
        address: address,
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
          console.log('error==>', result?.data?.message);
        }
      } catch (error: any) {
        SHOW_TOAST(error?.message ?? '', 'error');
        console.log(error?.message);
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
          routes: [{name: SCREENS.BottomBar.identifier}],
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
                source={{uri: profileImage?.uri}}
                style={styles(theme).image}
              />
            ) : (
              <View style={styles(theme).image}>
                <Text
                  size={getScaleSize(24)}
                  font={FONTS.Lato.Regular}
                  color={theme._262B43E5}>
                  {STRING.bc}
                </Text>
              </View>
            )}
            {/* <View style={styles(theme).image}>
              <Text
                size={getScaleSize(24)}
                font={FONTS.Lato.Regular}
                color={theme._262B43E5}>
                {STRING.bc}
              </Text>
            </View> */}
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
            style={{marginBottom: getScaleSize(16)}}>
            {STRING.enter_profile_details}
          </Text>
          <Input
            placeholder={STRING.enter_name}
            placeholderTextColor={theme._939393}
            inputTitle={STRING.name}
            inputColor={true}
            continerStyle={{marginBottom: getScaleSize(16)}}
            value={name}
            onChangeText={text => {
              setName(text);
              setNameError('');
            }}
            isError={nameError}
          />
          <Input
            placeholder={STRING.enter_mobile_no}
            placeholderTextColor={theme._939393}
            inputTitle={STRING.mobile_no}
            inputColor={true}
            continerStyle={{marginBottom: getScaleSize(16)}}
            value={mobileNo}
            editable={!isPhoneNumber}
            onChangeText={text => {
              setMobileNo(text);
              setMobileNoError('');
            }}
            isError={mobileNoError}
            countryCode={countryCode}
            onPressCountryCode={() => {
              setVisibleCountry(true);
            }}
          />
          <Input
            placeholder={STRING.enter_email}
            placeholderTextColor={theme._939393}
            inputTitle={STRING.email}
            inputColor={true}
            continerStyle={{marginBottom: getScaleSize(16)}}
            value={email}
            editable={isPhoneNumber}
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
            continerStyle={{marginBottom: getScaleSize(16)}}
            value={address}
            onChangeText={text => {
              setAddress(text);
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
          setCountryCode(e.dial_code);
          setVisibleCountry(false);
        }}
        onClose={() => {
          setVisibleCountry(false);
        }}
      />
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
