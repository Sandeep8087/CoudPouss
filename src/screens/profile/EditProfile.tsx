import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Dimensions,
    Platform,
} from 'react-native';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { getScaleSize, SHOW_SUCCESS_TOAST, SHOW_TOAST, useString } from '../../constant';

//COMPONENT
import {
    Header,
    Input,
    Text,
    Button,
    SelectCountrySheet,
} from '../../components';

//PACKAGES
import { launchImageLibrary } from 'react-native-image-picker';
import { API } from '../../api';

export default function EditProfile(props: any) {

    const STRING = useString();
    const { theme } = useContext<any>(ThemeContext);
    const { profile, fetchProfile } = useContext(AuthContext)
    const inputHeight = Platform.OS == 'ios' ? getScaleSize(56) : getScaleSize(56)

    const [isLoading, setLoading] = useState(false);
    const [bio, setBio] = useState('')
    const [bioError, setBioError] = useState('');
    const [experienceSpecialities, setExperienceSpecialities] = useState('');
    const [experienceSpecialitiesError, setExperienceSpecialitiesError] = useState('');
    const [achievements, setAchievements] = useState('')
    const [achievementsError, setAchievementsError] = useState('');
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [mobileNumberError, setMobileNumberError] = useState('');
    const [address, setAddress] = useState('');
    const [addressError, setAddressError] = useState('');
    const [showCountryCode, setShowCountryCode] = useState(false);
    const [profileImage, setProfileImage] = useState<any>(null);
    const [yearsOfExperience, setYearsOfExperience] = useState<string>('');
    const [firstImageURL, setFirstImageURL] = useState<any>(null);
    const [secondImageURL, setSecondImageURL] = useState<any>(null);
    const [firstProductImageURL, setFirstProductImageURL] = useState<any>(null);
    const [secondProductImageURL, setSecondProductImageURL] = useState<any>(null);
    const [addressHeight, setAddressHeight] = useState(inputHeight);
    const [visibleCountry, setVisibleCountry] = useState(false)

    const fullPhone = profile?.user?.phone_number ?? '';

    const codeMatch = fullPhone.match(/^\+\d+/);
    const numberMatch = fullPhone.replace(/^\+\d+/, '');

    const [countryCode, setCountryCode] = useState(codeMatch || '+91');
    const [countryFlag, setCountryFlag] = useState('🇮🇳');
    const [mobileNumber, setMobileNumber] = useState(numberMatch);

    console.log('profile==>', profile)

    useEffect(() => {
        setName((profile?.user?.first_name ?? "") + " " + (profile?.user?.last_name ?? ""));
        setEmail(profile?.user?.email ?? '');
        setMobileNumber(profile?.user?.phone_number ?? '');
        setAddress(profile?.user?.address ?? '');
        setYearsOfExperience(
            String(profile?.provider_info?.years_of_experience ?? '')
        );
        setBio(profile?.provider_info?.bio ?? '');
        setExperienceSpecialities(profile?.provider_info?.experience_speciality ?? '');
        setAchievements(profile?.provider_info?.achievements ?? '');
        setFirstImageURL(profile?.past_work_files?.[0] ?? null);
        setSecondImageURL(profile?.past_work_files?.[1] ?? null);
    }, [profile]);

    console.log('firstImageURL', profile?.past_work_photos)

    const pickImage = async (type: string) => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (!response.didCancel && !response.errorCode && response.assets) {
                const asset: any = response.assets[0];
                console.log('asset', asset)
                if (type === 'profile') {
                    setProfileImage(asset);
                    uploadProfileImage(asset);
                } else if (type === 'first') {
                    setFirstImageURL(asset?.uri);
                    uploadProductImage(asset, 'first');
                } else if (type === 'second') {
                    setSecondImageURL(asset?.uri);
                    uploadProductImage(asset, 'second');
                }
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
            })
            setLoading(false);
            if (result.status) {
                SHOW_TOAST(result?.data?.message ?? '', 'success')
                await fetchProfile()
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error')
                setProfileImage(null);
            }
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

    async function onEditUserProfile() {

        const nameErr = validateName(name);
        const mobileErr = validateMobile(mobileNumber);
        const addressErr = validateAddress(address);

        const bioErr = validateOptionalText(bio);
        const expErr = validateOptionalText(experienceSpecialities);
        const achErr = validateOptionalText(achievements);

        if (bioErr || expErr || achErr) {
            setBioError(bioErr);
            setExperienceSpecialitiesError(expErr);
            setAchievementsError(achErr);
            return;
        }

        if (nameErr || mobileErr || addressErr) {
            setNameError(nameErr)
            setMobileNumberError(mobileErr)
            setAddressError(addressErr)
            return;
        }

        try {
            const params = {
                "user_data": {
                    "name": name.trim(),
                    "address": address.trim()
                },
                "provider_data": {
                    "bio": bio.trim(),
                    "experience_speciality": experienceSpecialities.trim(),
                    "achievements": achievements.trim(),
                    "years_of_experience": parseFloat(yearsOfExperience) || 0,
                    past_work_image_keys: [firstImageURL, secondImageURL]
                }
            }
            setLoading(true);
            const result = await API.Instance.patch(API.API_ROUTES.editProfile, params);
            setLoading(false);

            console.log('EDIT PROFILE RES', JSON.stringify(result))

            if (result?.status) {
                SHOW_TOAST(STRING.profile_updated_successfully, 'success')
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

    async function uploadProductImage(asset: any, type: string) {
        try {
            const formData = new FormData();

            formData.append('past_work_photos', {
                uri: asset?.uri,
                name: asset?.fileName || 'profile_image.jpg',
                type: asset?.type || 'image/jpeg',
            });
            setLoading(true);
            const result = await API.Instance.post(API.API_ROUTES.uploadProviderJobFiles, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (result.status) {
                console.log('kjsdkjadakjdjasdna', result?.data?.file?.[0]?.storage_key)
                if (type === 'first') setFirstProductImageURL(result?.data?.file?.[0]?.storage_key);
                else if (type === 'second') setSecondProductImageURL(result?.data?.file?.[0]?.storage_key);
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error');
                if (type === 'first') setFirstImageURL(null);
                else if (type === 'second') setSecondImageURL(null);
            }
        } catch (error: any) {
            if (type === 'first') setFirstImageURL(null);
            else if (type === 'second') setSecondImageURL(null);
            SHOW_TOAST(error?.message ?? '', 'error');
        } finally {
            setLoading(false);
        }
    }

    const validateExperienceInput = (text: string) => {
        // Remove spaces
        let value = text.trim();

        // Allow only digits and dot
        value = value.replace(/[^0-9.]/g, '');

        // Prevent multiple dots
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts[1];
        }

        // Allow only 2 decimal places
        if (parts[1]?.length > 2) {
            value = parts[0] + '.' + parts[1].slice(0, 2);
        }

        // Max value 99
        if (parseFloat(value) > 99) {
            value = '99';
        }

        return value;
    };

    const validateTextInputs = (text: string) => {
        // Allow alphabets, numbers, spaces and selected special chars
        let value = text.replace(/[^a-zA-Z0-9\s.,'\-_@]/g, '');

        // Remove emojis & unsupported unicode
        value = value.replace(
            /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDFFF])/g,
            ''
        );

        // Limit to 300 chars
        return value.slice(0, 300);
    };

    const validateOptionalText = (value: string) => {
        const trimmed = value.trim();

        if (!trimmed) return '';

        if (!/[a-zA-Z0-9]/.test(trimmed)) {
            return 'Invalid input';
        }

        if (trimmed.length < 5) {
            return 'Minimum 5 characters required';
        }

        if (trimmed.length > 300) {
            return 'Maximum 300 characters allowed';
        }

        return '';
    };

    const validateName = (value: string) => {
        const trimmed = value.trim();

        if (!trimmed) return "Name is required";

        if (!/^[A-Za-z]/.test(trimmed))
            return "Name cannot start with special character";

        if (!/^[A-Za-z\s]+$/.test(trimmed))
            return "Only letters allowed";

        return "";
    };

    const validateMobile = (value: string) => {
        const trimmed = value.trim();

        if (!trimmed) return "Mobile number required";

        if (!/^[0-9]{10}$/.test(trimmed))
            return "Enter valid 10 digit number";

        return "";
    };

    const validateAddress = (value: string) => {
        const trimmed = value.trim();

        if (!trimmed) return "Address required";

        if (trimmed.length < 2 || trimmed.length > 250)
            return "Address must be 2–250 characters";

        return "";
    };

    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
                screenName={STRING.edit_profile}
            />
            <ScrollView
                style={styles(theme).scrolledContainer}
                showsVerticalScrollIndicator={false}>
                {profile?.user?.profile_photo_url ?
                    <Image source={{ uri: profile?.user?.profile_photo_url }}
                        resizeMode='cover' style={styles(theme).profileContainer} />
                    :
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
                }
                <TouchableOpacity onPress={() => {
                    pickImage("profile")
                }}>
                    <Text
                        size={getScaleSize(16)}
                        font={FONTS.Lato.SemiBold}
                        align="center"
                        color={theme._2C6587}
                        style={{ marginBottom: getScaleSize(24) }}>
                        {STRING.edit_picture_or_avatar}
                    </Text>
                </TouchableOpacity>
                <Text
                    size={getScaleSize(18)}
                    font={FONTS.Lato.Medium}
                    color={theme._2C6587}
                    style={{ marginBottom: getScaleSize(16) }}>
                    {STRING.personal_information}
                </Text>
                <View style={styles(theme).mainContainer}>
                    <Input
                        placeholder={STRING.enter_name}
                        placeholderTextColor={theme._939393}
                        inputTitle={STRING.full_name}
                        inputColor={true}
                        value={name}
                        maxLength={50}
                        continerStyle={{ marginBottom: getScaleSize(20) }}
                        onChangeText={text => {
                            if (text.length === 1 && !/[A-Za-z]/.test(text)) return;
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
                            setAddress(text);
                            setAddressError('');
                        }}
                        isError={addressError}
                    />
                    <Input
                        placeholder={STRING.experience}
                        inputTitle={STRING.years_of_experience}
                        inputColor={true}
                        keyboardType='number-pad'
                        value={yearsOfExperience}
                        onChangeText={(text: any) => {
                            const cleanedValue = validateExperienceInput(text);
                            setYearsOfExperience(cleanedValue);
                        }}
                    />
                </View>
                <Text
                    size={getScaleSize(18)}
                    font={FONTS.Lato.Medium}
                    color={theme._2C6587}
                    style={{ marginBottom: getScaleSize(16) }}>
                    {STRING.public_profile_details}
                </Text>
                <View style={styles(theme).mainContainer}>
                    <Input
                        inputTitle={STRING.Bio}
                        inputColor={true}
                        value={bio}
                        inputContainer={styles(theme).inputContainerHeight}
                        multiline={true}
                        numberOfLines={8}
                        continerStyle={{ marginBottom: getScaleSize(20) }}
                        onChangeText={text => {
                            const clean = validateTextInputs(text);
                            setBio(clean);
                            setBioError(validateOptionalText(clean));
                        }}
                        isError={bioError}
                    />
                    <Input
                        inputTitle={STRING.ExperienceSpecialities}
                        inputColor={true}
                        value={experienceSpecialities}
                        inputContainer={styles(theme).inputContainerHeight}
                        multiline={true}
                        numberOfLines={8}
                        continerStyle={{ marginBottom: getScaleSize(20) }}
                        onChangeText={text => {
                            const clean = validateTextInputs(text);
                            setExperienceSpecialities(clean);
                            setExperienceSpecialitiesError(validateOptionalText(clean));
                        }}
                        isError={experienceSpecialitiesError}
                    />
                    <Input
                        inputTitle={STRING.Achievements}
                        inputColor={true}
                        value={achievements}
                        inputContainer={styles(theme).inputContainerHeight}
                        multiline={true}
                        numberOfLines={8}
                        continerStyle={{ marginBottom: getScaleSize(20) }}
                        onChangeText={text => {
                            const clean = validateTextInputs(text);
                            setAchievements(clean);
                            setAchievementsError(validateOptionalText(clean));
                        }}
                        isError={achievementsError}
                    />
                    <Text
                        size={getScaleSize(17)}
                        font={FONTS.Lato.Medium}
                        color={theme._858686}>
                        {STRING.upload_images_of_past_works}
                    </Text>
                    <View style={styles(theme).imageUploadContent}>
                        <TouchableOpacity
                            style={{ flex: 1, marginRight: getScaleSize(9) }}
                            activeOpacity={1}
                            onPress={() => {
                                pickImage("first")
                            }}>
                            {firstImageURL ? (
                                <Image
                                    style={styles(theme).ImageStyle}
                                    source={{ uri: firstImageURL }}
                                />
                            ) : (
                                <View style={styles(theme).uploadButton}>
                                    <Image
                                        style={styles(theme).attachmentIcon}
                                        source={IMAGES.upload_attachment}
                                    />
                                    <Text
                                        style={{ marginTop: getScaleSize(8) }}
                                        size={getScaleSize(15)}
                                        font={FONTS.Lato.Regular}
                                        color={theme._818285}>
                                        {STRING.upload_from_device}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flex: 1, marginLeft: getScaleSize(9) }}
                            activeOpacity={1}
                            onPress={() => {
                                pickImage("second")
                            }}>
                            {secondImageURL ? (
                                <Image
                                    style={styles(theme).ImageStyle}
                                    source={{ uri: secondImageURL }}
                                />
                            ) : (
                                <View style={[styles(theme).uploadButton]}>
                                    <Image
                                        style={styles(theme).attachmentIcon}
                                        source={IMAGES.upload_attachment}
                                    />
                                    <Text
                                        style={{ marginTop: getScaleSize(8) }}
                                        size={getScaleSize(15)}
                                        font={FONTS.Lato.Regular}
                                        color={theme._818285}>
                                        {STRING.upload_from_device}
                                    </Text>
                                </View>
                            )}

                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <Button
                title={STRING.update}
                style={styles(theme).updateButton}
                onPress={() => {
                    onEditUserProfile()
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
            <SafeAreaView />
        </View>
    );
}

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.white },
        scrolledContainer: {
            marginHorizontal: getScaleSize(24),
        },
        profileContainer: {
            width: getScaleSize(126),
            height: getScaleSize(126),
            borderWidth: 1,
            borderColor: theme._F0EFF0,
            borderRadius: getScaleSize(126),
            alignSelf: 'center',
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
        mainContainer: {
            marginBottom: getScaleSize(24),
            borderWidth: 1,
            borderColor: theme._E6E6E6,
            borderRadius: getScaleSize(12),
            padding: getScaleSize(24),
        },
        imageUploadContent: {
            marginTop: getScaleSize(12),
            flexDirection: 'row',
        },
        uploadButton: {
            flex: 1.0,
            borderWidth: 1,
            borderColor: theme._818285,
            borderStyle: 'dashed',
            borderRadius: getScaleSize(8),
            justifyContent: 'center',
            alignItems: 'center',
            height: getScaleSize(160),
        },
        attachmentIcon: {
            height: getScaleSize(40),
            width: getScaleSize(40),
            alignSelf: 'center',
        },
        updateButton: {
            marginHorizontal: getScaleSize(24),
            marginVertical: getScaleSize(24),
        },
        inputContainerHeight: {
            height: getScaleSize(190),
            textAlignVertical: 'top'
        },
        inputContainerHeight90: {
            height: getScaleSize(90),
            textAlignVertical: 'top'
        },
        ImageStyle: {
            height: getScaleSize(160),
            width: (Dimensions.get('window').width - getScaleSize(108)) / 2,
            borderRadius: getScaleSize(8),
            resizeMode: 'cover',
        }
    });
