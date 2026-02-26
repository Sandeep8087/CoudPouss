import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, REGEX, SHOW_TOAST, useString } from '../../constant';

//SCREENS
import { SCREENS } from '..';

//COMPONENTS
import { Header, Input, Text, Button } from '../../components';
import { API } from '../../api';
import { CommonActions } from '@react-navigation/native';

export default function NewPassword(props: any) {

    const STRING = useString();

    const { theme } = useContext<any>(ThemeContext);

    const email = props?.route?.params?.email || '';
    // const isPhoneNumber = props?.route?.params?.isPhoneNumber || false;
    // const countryCode = props?.route?.params?.countryCode || '+91';

    const [isLoading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [show, setShow] = useState(true);
    const [confirmShow, setConfirmShow] = useState(true);

    async function onNewPassword() {
        const cleanPassword = password.trim();
        const cleanConfirmPassword = confirmPassword.trim();

        setPasswordError('');
        setConfirmPasswordError('');

        // Password required
        if (!cleanPassword) {
            setPasswordError(STRING.password_required);
            return;
        }

        // No whitespace allowed
        else if (/\s/.test(cleanPassword)) {
            setPasswordError('Password cannot contain spaces');
            return;
        }

        // Length check (8–12)
        else if (cleanPassword.length < 8 || cleanPassword.length > 12) {
            setPasswordError('Password must be 8 to 12 characters long');
            return;
        }

        // Strong password validation
        else if (!REGEX.password.test(cleanPassword)) {
            setPasswordError(STRING.password_validation_message);
            return;
        }

        // Confirm password required
        else if (!cleanConfirmPassword) {
            setConfirmPasswordError('Confirm password is required');
            return;
        }

        // Password mismatch
        else if (cleanPassword !== cleanConfirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            return;
        }
        else {
            setPasswordError('');
            setConfirmPasswordError('');
            // let params = {}
            // if (isPhoneNumber) {
            //     params = {
            //         mobile: email,
            //         phone_country_code: countryCode,
            //         password: password,
            //         confirm_password: confirmPassword,
            //     }
            // } else {
            const params = {
                email: email,
                password: password,
                confirm_password: confirmPassword,
            }
            // }
            try {
                setLoading(true);
                const result = await API.Instance.post(API.API_ROUTES.createNewPassword, params);
                setLoading(false);
                console.log('result', result.status, result)
                if (result.status) {
                    SHOW_TOAST(result?.data?.message ?? '', 'success')
                    props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: SCREENS.Login.identifier }],
                        }),
                    );
                } else {
                    SHOW_TOAST(result?.data?.message ?? '', 'error')
                    console.log('error==>', result?.data?.message)
                }
            } catch (error: any) {
                setLoading(false);
                SHOW_TOAST(error?.message ?? '', 'error');
                console.log(error?.message)
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
                screenName={STRING.set_new_password}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles(theme).mainContainer}>
                    <Text
                        size={getScaleSize(18)}
                        font={FONTS.Lato.SemiBold}
                        color={theme._939393}
                        style={{ marginBottom: getScaleSize(20) }}>
                        {STRING.Your_new_password_must_be_different_from_previously_used_passwords}
                    </Text>
                    <Input
                        placeholder={STRING.enter_new_password}
                        placeholderTextColor={theme._939393}
                        value={password}
                        passwordIcon={true}
                        secureTextEntry={show}
                        onChnageIcon={() => {
                            setShow(!show);
                        }}
                        onChangeText={text => {
                            const trimmed = text.trimStart(); // remove leading spaces
                            const noSpaces = trimmed.replace(/\s/g, ''); // remove all spaces
                            const limited = noSpaces.slice(0, 12); // max 12 chars

                            setPassword(limited);
                            setPasswordError('');
                        }}
                        isError={passwordError}
                    />
                    <Input
                        placeholder={STRING.re_enter_new_password}
                        placeholderTextColor={theme._939393}
                        value={confirmPassword}
                        passwordIcon={true}
                        secureTextEntry={confirmShow}
                        continerStyle={{ marginTop: getScaleSize(16) }}
                        onChnageIcon={() => {
                            setConfirmShow(!confirmShow);
                        }}
                        onChangeText={text => {
                            const trimmed = text.trimStart();
                            const noSpaces = trimmed.replace(/\s/g, '');
                            const limited = noSpaces.slice(0, 12);

                            setConfirmPassword(limited);
                            setConfirmPasswordError('');
                        }}
                        isError={confirmPasswordError}
                    />
                </View>
            </ScrollView>
            <Button
                title={STRING.reset_password}
                style={{ marginVertical: getScaleSize(24), marginHorizontal: getScaleSize(24) }}
                onPress={() => {
                    onNewPassword();
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
            justifyContent: 'center'
        },
        mainContainer: {
            flex: 1.0,
            marginHorizontal: getScaleSize(24),
            marginVertical: getScaleSize(18),
            justifyContent: 'center'
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
