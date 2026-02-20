import { Dimensions, Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';

//SCREENS
import { SCREENS } from '..';

//COMPONENTS
import { Header, Input, Text, Button } from '../../components';

//PACKAGES
import OTPTextInput from 'react-native-otp-textinput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { API } from '../../api';

export default function Otp(props: any) {

    const insets = useSafeAreaInsets();

    const STRING = useString();
    const isFromSignup = props?.route?.params?.isFromSignup || false;
    // const isPhoneNumber = props?.route?.params?.isPhoneNumber || false;
    // const countryCode = props?.route?.params?.countryCode || '+91';
    const email = props?.route?.params?.email || '';

    const { theme } = useContext<any>(ThemeContext);
    const otpInput = useRef<OTPTextInput>(null);

    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60); // seconds
    const [isResendDisabled, setIsResendDisabled] = useState(true);

    useEffect(() => {
        let interval: any;
        if (isResendDisabled) {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setIsResendDisabled(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isResendDisabled]);


    async function onOtp() {
        if (isFromSignup) {
            onSignup()
        } else {
            onNewPassword();
        }
    }

    async function onNewPassword() {
        if (!otp) {
            setOtpError(STRING.please_enter_your_otp);
        } else {
            setOtpError('');
            // let params = {}
            // if (isPhoneNumber) {
            //     params = {
            //         mobile: email,
            //         phone_country_code: countryCode,
            //         otp: otp,
            //     }
            // } else {
            const params = {
                email: email,
                otp: otp,
            }
            // }
            try {
                setLoading(true);
                const result: any = await API.Instance.post(API.API_ROUTES.verifyResetPassword, params);
                setLoading(false);
                console.log('result', result.status, result)
                if (result.status) {
                    SHOW_TOAST(result?.data?.message ?? '', 'success')
                    props.navigation.navigate(SCREENS.NewPassword.identifier, {
                        email: email,
                        // isPhoneNumber: isPhoneNumber,
                        // countryCode: countryCode,
                    });
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

    async function onSignup() {
        if (!otp) {
            setOtpError(STRING.please_enter_your_otp);
        } else {
            setOtpError('');
            // let params = {}
            // if (isPhoneNumber) {
            //     params = {
            //         mobile: email,
            //         phone_country_code: countryCode,
            //         otp: otp,
            //     }
            // } else {
            const params = {
                email: email,
                otp: otp,
            }
            // }
            try {
                setLoading(true);
                const result: any = await API.Instance.post(API.API_ROUTES.verifyOtp, params);
                setLoading(false);
                console.log('result', result.status, result)
                if (result.status) {
                    SHOW_TOAST(result?.data?.message ?? '', 'success')
                    props.navigation.navigate(SCREENS.CreatePassword.identifier, {
                        email: email,
                        // isPhoneNumber: isPhoneNumber,
                        // countryCode: countryCode,
                    });
                } else {
                    if (result?.code === 409) {
                        if (result?.data?.message == 'OTP already verified. Redirect to Password page.') {
                            props.navigation.navigate(SCREENS.CreatePassword.identifier, {
                                email: email,
                            })
                        } else if (result?.data?.message == 'Password already set. Redirect to Details page.') {
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

    async function onResendOtp() {
        try {
            // let params = {}
            // if (isPhoneNumber) {
            //     params = {
            //         mobile: email,
            //         phone_country_code: countryCode,
            //     }
            // } else {
            const params = {
                email: email,
            }
            // }
            setLoading(true);
            const result = await API.Instance.post(API.API_ROUTES.resendOtp, params);
            setLoading(false);
            console.log('result', result.status, result)
            if (result.status) {
                SHOW_TOAST(result?.data?.message ?? '', 'success')
                otpInput.current?.clear();
                setTimer(60);
                setIsResendDisabled(true);
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error')
                console.log('error==>', result?.data?.message)
            }
        }
        catch (error: any) {
            setLoading(false);
            SHOW_TOAST(error?.message ?? '', 'error');
            console.log(error?.message)
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <View style={[styles(theme).container,
        { paddingBottom: Platform.OS === 'android' ? insets.bottom : 0 }
        ]}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
                screenName={STRING.enter_OTP}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles(theme).mainContainer}>
                    <Text
                        size={getScaleSize(18)}
                        font={FONTS.Lato.SemiBold}
                        color={theme._939393}
                        style={{ marginBottom: getScaleSize(32) }}>
                        {STRING.please_enter_four_digit_pin_sent_on_email}
                    </Text>
                    <View style={styles(theme).inputContainer}>
                        <Text
                            size={getScaleSize(18)}
                            font={FONTS.Lato.Medium}
                            color={theme._555555}
                            style={{ marginBottom: getScaleSize(8) }}>
                            {STRING.code}
                        </Text>
                        <OTPTextInput
                            ref={otpInput}
                            inputCount={4}
                            handleTextChange={(val: string) => {
                                setOtp(val);
                                setOtpError('');
                            }}
                            tintColor={otpError ? theme._EF5350 : theme.primary} // border color when active
                            offTintColor={otpError ? theme._EF5350 : theme._BFBFBF} // border color when inactive
                            textInputStyle={styles(theme).textInput}
                        />
                        {otpError &&
                            <Text
                                style={{ marginTop: getScaleSize(8) }}
                                size={getScaleSize(16)}
                                font={FONTS.Lato.Regular}
                                color={theme._EF5350}>
                                {otpError}
                            </Text>
                        }
                    </View>
                </View>
            </ScrollView>
            <View style={styles(theme).resendOtpView}>
                {isResendDisabled ? (
                    <Text
                        font={FONTS.Lato.SemiBold}
                        color={theme._2C6587}
                        size={getScaleSize(18)}
                        align="center">
                        {`Resend code in ${timer} seconds`}
                    </Text>
                ) : (
                    <TouchableOpacity
                        onPress={() => {
                            onResendOtp();
                        }}>
                        <Text
                            size={getScaleSize(20)}
                            font={FONTS.Lato.SemiBold}
                            color={theme._2C6587}
                            align="center"
                            style={{ marginBottom: getScaleSize(16) }}>
                            {STRING.resend_code}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            <Button
                title={isFromSignup ? STRING.verify_OTP : STRING.continue}
                disabled={!otp}
                style={{ marginBottom: getScaleSize(24), marginHorizontal: getScaleSize(24) }}
                onPress={() => {
                    onOtp();
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
        inputContainer: {
            marginBottom: getScaleSize(16),
        },
        textInput: {
            width: getScaleSize(77),
            height: getScaleSize(54),
            borderWidth: 1,
            borderRadius: getScaleSize(12),
            borderBottomWidth: 1,
            borderColor: theme._BFBFBF,
            fontSize: getScaleSize(16),
            fontFamily: FONTS.Lato.Bold,
            color: theme._31302F,
            backgroundColor: theme.white,
        },
        resendOtpView: {
            alignItems: 'center',
            marginTop: getScaleSize(12),
            marginBottom: getScaleSize(10)
        },
    });