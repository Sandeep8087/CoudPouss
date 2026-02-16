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
        if (!password) {
            setPasswordError(STRING.please_enter_your_password);
        } else if (!REGEX.password.test(password)) {
            setPasswordError(STRING.password_validation_message);
        } else if (!confirmPassword) {
            setConfirmPasswordError(STRING.please_enter_your_re_enter_password);
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
                            setPassword(text);
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
                            setConfirmPassword(text);
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
