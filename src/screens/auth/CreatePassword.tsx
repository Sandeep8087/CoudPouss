import { Dimensions, Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
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

export default function CreatePassword(props: any) {

    const STRING = useString();

    const { theme } = useContext<any>(ThemeContext);

    const email = props?.route?.params?.email || '';
    // const isPhoneNumber = props?.route?.params?.isPhoneNumber || false;
    // const countryCode = props?.route?.params?.countryCode || '+91';

    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [show, setShow] = useState(true);
    const [confirmShow, setConfirmShow] = useState(true);
    const [isLoading, setLoading] = useState(false);

    async function onSignup() {
        if (!password) {
            setPasswordError(STRING.password_required);
        }
        else if (/\s/.test(password)) {
            setPasswordError(STRING.white_space_not_allowed);
        }
        else if (password.length > 12) {
            setPasswordError(STRING.maximum_12_characters_allowed);
        }
        else if (!REGEX.password.test(password)) {
            setPasswordError(STRING.password_validation_message);
        } else if (!confirmPassword) {
            setConfirmPasswordError(STRING.confirm_password_required);
        } else if (password !== confirmPassword) {
            setConfirmPasswordError(STRING.passwords_do_not_match);
        } else {
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
                const result: any = await API.Instance.post(API.API_ROUTES.createPassword, params);
                setLoading(false);
                console.log('result', result.status, result)
                if (result.status) {
                    SHOW_TOAST(result?.data?.message ?? '', 'success')
                    props.navigation.navigate(SCREENS.AddPersonalDetails.identifier, {
                        email: email,
                        // isPhoneNumber: isPhoneNumber,
                        // countryCode: countryCode,
                    });
                } else {
                    if (result?.code === 409) {
                        if (result?.data?.message == 'Password already set. Redirect to Details page.') {
                            props.navigation.navigate(SCREENS.AddPersonalDetails.identifier, {
                                email: email,
                            })
                        } else {
                            SHOW_TOAST(result?.data?.message ?? '', 'error')
                        }
                    } else {
                        SHOW_TOAST(result?.data?.message ?? '', 'error')
                        console.log('error==>', result?.data?.message)
                    }
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
        <View style={[styles(theme).container
        ]}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
                screenName={STRING.create_password}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles(theme).mainContainer}>
                    <Text
                        size={getScaleSize(18)}
                        font={FONTS.Lato.SemiBold}
                        color={theme._565656}
                        style={{ marginBottom: getScaleSize(20) }}>
                        {STRING.create_a_strong_password}
                    </Text>
                    <Input
                        placeholder={STRING.enter_new_password}
                        placeholderTextColor={theme._939393}
                        inputTitle={STRING.password}
                        inputColor={true}
                        value={password}
                        passwordIcon={true}
                        secureTextEntry={show}
                        onChnageIcon={() => {
                            setShow(!show);
                        }}
                        onChangeText={text => {
                            // Remove all whitespace
                            const cleaned = text.replace(/\s/g, '');

                            // Limit to 12 characters
                            const trimmed = cleaned.slice(0, 12);

                            setPassword(trimmed);
                            setPasswordError('');
                        }}
                        isError={passwordError}
                    />
                    <Input
                        placeholder={STRING.re_enter_new_password}
                        placeholderTextColor={theme._939393}
                        inputTitle={STRING.confirm_password}
                        inputColor={true}
                        value={confirmPassword}
                        passwordIcon={true}
                        secureTextEntry={confirmShow}
                        continerStyle={{ marginTop: getScaleSize(16) }}
                        onChnageIcon={() => {
                            setConfirmShow(!confirmShow);
                        }}
                        onChangeText={text => {
                            const cleaned = text.replace(/\s/g, '');
                            const trimmed = cleaned.slice(0, 12);

                            setConfirmPassword(trimmed);
                            setConfirmPasswordError('');
                        }}
                        isError={confirmPasswordError}
                    />
                </View>
            </ScrollView>
            <Button
                title={STRING.next}
                style={{ marginVertical: getScaleSize(24), marginHorizontal: getScaleSize(24) }}
                onPress={() => {
                    onSignup();
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
