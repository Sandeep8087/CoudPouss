import React, { useContext, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    SafeAreaView,
    Platform,
} from 'react-native';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, SHOW_SUCCESS_TOAST, SHOW_TOAST, useString } from '../../constant';

//COMPONENTS
import { Text, Header, Input, Button, BottomSheet, SelectCountrySheet } from '../../components';

//API
import { API } from '../../api';

//PACKAGES
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//SCREENS
import { SCREENS } from '..';

export default function MyProfile(props: any) {

    const insets = useSafeAreaInsets();

    const STRING = useString();

    const { theme } = useContext<any>(ThemeContext);

    const { profile, fetchProfile, setUser, setUserType } = useContext(AuthContext)

    const bottomSheetRef = useRef<any>(null);
    const inputHeight = Platform.OS == 'ios' ? getScaleSize(56) : getScaleSize(56)

    const [name, setName] = useState((profile?.user?.first_name ?? "") + " " + (profile?.user?.last_name ?? ""));
    const [nameError, setNameError] = useState('');
    const [email, setEmail] = useState(profile?.user?.email ?? "");
    const [emailError, setEmailError] = useState('');
    const [mobileNumberError, setMobileNumberError] = useState('');
    const [address, setAddress] = useState(profile?.user?.address ?? "");
    const [addressError, setAddressError] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState<any>(null);
    const [addressHeight, setAddressHeight] = useState(inputHeight);
    const [visibleCountry, setVisibleCountry] = useState(false);

    const fullPhone = profile?.user?.phone_number ?? '';

    const codeMatch = fullPhone.match(/^\+\d+/);
    const numberMatch = fullPhone.replace(/^\+\d+/, '');

    const [countryCode, setCountryCode] = useState(codeMatch || '+91');
    const [countryFlag, setCountryFlag] = useState('🇮🇳');
    const [mobileNumber, setMobileNumber] = useState(numberMatch);

    const pickImage = async () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (!response.didCancel && !response.errorCode && response.assets) {
                const asset: any = response.assets[0];
                console.log('asset', asset)
                setProfileImage(asset);
                uploadProfileImage(asset);
            } else {
                console.log('response', response)
            }
        });
    }

    async function uploadProfileImage(asset: any) {
        try {
            const formData = new FormData();
            formData.append(profile?.user?.phone_number ? 'email' : 'email', profile?.user?.email);
            formData.append('file', {
                uri: asset?.uri,
                name: asset?.fileName || 'profile_image.jpg',
                type: asset?.type || 'image/jpeg',
            });

            console.log('FORM DATA', formData)
            setLoading(true);
            const result = await API.Instance.post(API.API_ROUTES.uploadProfileImage, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setLoading(false);
            console.log('PROFILE PIC RES', JSON.stringify(result))

            if (result.status) {
                SHOW_TOAST(result?.data?.message ?? '', 'success')
                await fetchProfile()
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error')
                setProfileImage(null);
            }
            console.log('error==>', result?.data?.message)
        }
        catch (error: any) {
            setProfileImage(null);
            setLoading(false);
            SHOW_TOAST(error?.message ?? '', 'error');
            console.log(error?.message)
        } finally {
            setLoading(false);
        }
    }

    const isOnlyWhitespace = (value: string) => !value || !value.trim();

    // Detect emoji (Unicode emoji ranges)
    const containsEmoji = (str: any) => {
        return /[\p{Extended_Pictographic}]/u.test(str);
    };

    // Detect HTML/script tags
    const containsHTML = (str: any) => /<[^>]*>/g.test(str);

    // Find first invalid character
    const findInvalidChar = (value: any, regex: any) => {
        for (let char of value) {
            if (!regex.test(char)) {
                return char;
            }
        }
        return null;
    };

    // NAME VALIDATION 
    const validateName = (value: any) => {
        const trimmed = value.trim();

        // 1. Only whitespace
        if (!trimmed) {
            return "Name cannot be empty or only spaces";
        }

        // 2. Length
        if (trimmed.length < 2 || trimmed.length > 50) {
            return "Name must be between 2 and 50 characters";
        }

        // 3. Emoji check
        if (containsEmoji(trimmed)) {
            return "Name cannot contain emojis";
        }

        // 4. Allow only letters + space
        const validNameChar = /^[A-Za-z\s]$/;
        const invalidChar = findInvalidChar(trimmed, validNameChar);

        if (invalidChar) {
            return `Invalid character in name: "${invalidChar}"`;
        }

        return "";
    };

    // ADDRESS VALIDATION 

    const validateAddress = (value: any) => {
        const trimmed = value.trim();

        // 1. Only whitespace
        if (!trimmed) {
            return "Address cannot be empty or only spaces";
        }

        // 2. Length check
        if (trimmed.length < 2 || trimmed.length > 250) {
            return "Address must be between 2 and 250 characters";
        }

        // 3. Emoji check
        if (containsEmoji(trimmed)) {
            return "Address cannot contain emojis";
        }

        // 4. HTML/script check
        if (containsHTML(trimmed)) {
            return "HTML or script tags are not allowed";
        }

        // 5. Must contain at least one letter
        if (!/[A-Za-z]/.test(trimmed)) {
            return "Address must contain at least one letter";
        }

        // 6. Allowed characters only
        const allowedRegex = /^[A-Za-z0-9\s,.\-/#:+()]+$/;

        if (!allowedRegex.test(trimmed)) {
            return "Address contains invalid characters";
        }

        return "";
    };


    async function onEditUserProfile() {

        const trimmedAddress = address.trim();
        const addressValidation = validateAddress(trimmedAddress);
        const trimmedName = name.trim();

        if (addressValidation) {
            setAddressError(addressValidation);
            return;
        }

        // Name validation
        const nameValidation = validateName(trimmedName);
        if (nameValidation) {
            setNameError(nameValidation);
            return;
        }

        // Mobile validation
        if (isOnlyWhitespace(mobileNumber)) {
            setMobileNumberError("Mobile number required");
            return;
        }

        try {
            const params = {
                user_data: {
                    name: trimmedName,
                    address: trimmedAddress,
                    phone_number: mobileNumber,
                    phone_country_code: countryCode,
                }
            };

            console.log('EDIT PARAMS', params)

            setLoading(true);
            const result = await API.Instance.patch(API.API_ROUTES.editProfile, params);
            setLoading(false);

            console.log('EDIT PROFILE RES', JSON.stringify(result))

            if (result?.status) {
                SHOW_SUCCESS_TOAST(STRING.profile_updated_successfully)
                setLoading(false);
                props.navigation.goBack();
                await fetchProfile()
            }
            else {
                SHOW_TOAST(result?.data?.message, 'error')
                console.log('ERR', result?.data?.message)
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
        }
    }

    async function onDeleteProfile() {

        try {
            setLoading(true);
            const result: any = await API.Instance.delete(API.API_ROUTES.deleteProfile);
            setLoading(false);

            console.log('DELETE PROFILE RES', JSON.stringify(result))

            if (result?.status) {
                await AsyncStorage.clear()
                setUser(null);
                setUserType(null);
                setTimeout(() => {
                    setLoading(false)
                    props.navigation.dispatch(CommonActions.reset({
                        index: 0,
                        routes: [{
                            name: SCREENS.Login.identifier
                        }]
                    }))
                }, 500);
            }
            else {
                SHOW_TOAST(result?.data?.message, 'error')
                console.log('ERR', result?.data?.message)
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
        }
    }

    return (
        <View style={[styles(theme).container,
        { paddingBottom: Platform.OS === 'android' ? insets.bottom : 0 }
        ]}>
            <Header
                rightIcon={{ icon: IMAGES.ic_delete_profile, title: STRING.delete_profile }}
                onPress={() => { bottomSheetRef.current.open() }}
                onBack={() => { props.navigation.goBack() }}
                screenName={STRING.my_profile}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles(theme).mainContainer}>
                    {profile?.user?.profile_photo_url ? (
                        <Image source={{ uri: profile?.user?.profile_photo_url }} resizeMode='cover' style={styles(theme).profileContainer} />
                    ) : (
                        <View style={styles(theme).EmptyProfileContainer}>
                            <Text
                                size={getScaleSize(24)}
                                font={FONTS.Lato.Regular}
                                align="center"
                                color={theme._262B43E5}>
                                {(profile?.user?.first_name?.charAt(0) ?? '').toUpperCase() +
                                    (profile?.user?.last_name?.charAt(0) ?? '').toUpperCase()}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity onPress={() => {
                        pickImage()
                    }}>
                        <Text
                            size={getScaleSize(16)}
                            font={FONTS.Lato.SemiBold}
                            align="center"
                            color={theme._2C6587}>
                            {STRING.edit_picture_or_avatar}
                        </Text>
                    </TouchableOpacity>
                    <Text
                        style={{ marginTop: getScaleSize(22), marginBottom: getScaleSize(12) }}
                        size={getScaleSize(20)}
                        font={FONTS.Lato.SemiBold}
                        color={theme._2B2B2B}>
                        {STRING.personal_information}
                    </Text>
                    <Input
                        placeholder={STRING.enter_name}
                        placeholderTextColor={theme._939393}
                        inputTitle={STRING.full_name}
                        inputColor={true}
                        value={name}
                        continerStyle={{ marginBottom: getScaleSize(20) }}
                        onChangeText={text => {
                            setName(text);
                            setNameError('');
                        }}
                        isError={nameError}
                    />
                    <Input
                        placeholder={STRING.enter_email}
                        placeholderTextColor={theme._939393}
                        inputTitle={STRING.e_mail_id}
                        inputColor={true}
                        continerStyle={{ marginBottom: getScaleSize(20) }}
                        value={email}
                        editable={false}
                        onChangeText={text => {
                            setEmail(text);
                            setEmailError('');
                        }}
                        isError={emailError}
                    />
                    <Input
                        placeholder={STRING.enter_mobile_number}
                        placeholderTextColor={theme._939393}
                        inputTitle={STRING.mobile_number}
                        inputColor={true}
                        keyboardType="numeric"
                        continerStyle={{ marginBottom: getScaleSize(20) }}
                        value={mobileNumber}
                        maxLength={10}
                        countryCode={`${countryFlag} ${countryCode}`}
                        onPressCountryCode={() => {
                            setVisibleCountry(true);
                        }}
                        onChangeText={text => {
                            const cleaned = text.replace(/[^0-9]/g, '');
                            setMobileNumber(cleaned);
                            setMobileNumberError('');
                        }}
                        isError={mobileNumberError}
                    />
                    <Input
                        placeholder={STRING.enter_address}
                        placeholderTextColor={theme._939393}
                        inputTitle={STRING.address}
                        inputColor={true}
                        value={address}
                        multiline={true}
                        numberOfLines={10}
                        onContentSizeChange={(e) => {
                            const newHeight = e.nativeEvent.contentSize.height;
                            setAddressHeight(
                                Math.min(getScaleSize(200), Math.max(inputHeight, newHeight))
                            );
                        }}
                        inputContainer={{
                            maxHeight: getScaleSize(200),
                            height: addressHeight,
                            minHeight: inputHeight,
                        }}
                        continerStyle={{ marginBottom: getScaleSize(20) }}
                        onChangeText={text => {
                            // remove HTML brackets immediately
                            let cleaned = text.replace(/[<>]/g, '');

                            // block emoji live
                            if (containsEmoji(cleaned)) return;

                            setAddress(cleaned);
                            setAddressError('');
                        }}
                        isError={addressError}
                    />
                </View>
            </ScrollView>
            <Button
                title={STRING.update}
                style={{ marginVertical: getScaleSize(24), marginHorizontal: getScaleSize(24) }}
                onPress={() => {
                    onEditUserProfile()
                }}
            />
            <BottomSheet
                bottomSheetRef={bottomSheetRef}
                height={getScaleSize(350)}
                isInfo={true}
                title={STRING.are_you_sure_you_want_to_delete_your_account}
                description={STRING.delete_account_message}
                buttonTitle={STRING.delete_profile}
                secondButtonTitle={STRING.cancel}
                onPressSecondButton={() => {
                    bottomSheetRef.current.close();
                }}
                onPressButton={() => {
                    onDeleteProfile()
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
        </View >
    );
}

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.white
        },
        mainContainer: {
            flex: 1,
            marginHorizontal: getScaleSize(24),
        },
        profileContainer: {
            width: getScaleSize(126),
            height: getScaleSize(126),
            borderRadius: getScaleSize(126),
            alignSelf: 'center',
            borderWidth: 1,
            borderColor: theme._F0EFF0,
            marginBottom: getScaleSize(12),
        },
        EmptyProfileContainer: {
            width: getScaleSize(126),
            height: getScaleSize(126),
            backgroundColor: theme._F0EFF0,
            borderRadius: getScaleSize(126),
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: getScaleSize(12),
        },
    });
