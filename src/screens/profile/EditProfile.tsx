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
    const [mobileNumber, setMobileNumber] = useState('');
    const [mobileNumberError, setMobileNumberError] = useState('');
    const [address, setAddress] = useState('');
    const [addressError, setAddressError] = useState('');
    const [showCountryCode, setShowCountryCode] = useState(false);
    const [profileImage, setProfileImage] = useState<any>(null);
    const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
    const [firstImageURL, setFirstImageURL] = useState<any>(null);
    const [secondImageURL, setSecondImageURL] = useState<any>(null);
    const [firstProductImageURL, setFirstProductImageURL] = useState<any>(null);
    const [secondProductImageURL, setSecondProductImageURL] = useState<any>(null);
    const [addressHeight, setAddressHeight] = useState(inputHeight);

    useEffect(() => {
        setName((profile?.user?.first_name ?? "") + " " + (profile?.user?.last_name ?? ""));
        setEmail(profile?.user?.email ?? '');
        setMobileNumber(profile?.user?.phone_number ?? '');
        setAddress(profile?.user?.address ?? '');
        setYearsOfExperience(profile?.provider_info?.years_of_experience ?? '');
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
        try {
            const params = {
                "user_data": {
                    "name": name,
                    "address": address
                },
                "provider_data": {
                    "bio": bio,
                    "experience_speciality": experienceSpecialities,
                    "achievements": achievements,
                    "years_of_experience": Number(yearsOfExperience) || 0,
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
                        countryCode={'+91'}
                        onPressCountryCode={() => {
                            setShowCountryCode(true);
                        }}
                        onChangeText={text => {
                            setMobileNumber(text);
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
                        value={yearsOfExperience.toString()}
                        onChangeText={(text: any) => {
                            setYearsOfExperience(text);
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
                            setBio(text);
                            setBioError('');
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
                            setExperienceSpecialities(text);
                            setExperienceSpecialitiesError('');
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
                            setAchievements(text);
                            setAchievementsError('');
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
