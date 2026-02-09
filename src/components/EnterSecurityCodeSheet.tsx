import React, { useContext, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Image,
    Dimensions,
    Animated,
    Easing,
    TextInput,
    Platform,
} from 'react-native';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../context';

//CONSTANT & ASSETS
import { getScaleSize, useString } from '../constant';
import { FONTS, IMAGES } from '../assets';

//COMPONENTS
import Text from './Text';
import Button from './Button';

//PACKAGES
import OTPTextInput from 'react-native-otp-textinput';
import RBSheet from 'react-native-raw-bottom-sheet';


interface EnterSecurityCodeProps {
    cancelServiceDetails?: any;
    onClose: () => void;
    onProcessPress: any
    onRef: any;
    height?: number;
    otpInput?: any;
    onChangeOtp: (text: string) => void;
    otpError?: string;
    otp?: string;
    security_Code?: any;
}

export default function EnterSecurityCodeSheet(props: EnterSecurityCodeProps) {
    const { theme } = useContext<any>(ThemeContext);

    const STRING = useString();
    const { onRef, onProcessPress, onClose, otpInput, onChangeOtp, otpError, security_Code, otp } = props;

    const formattedSecurityCode = security_Code ? security_Code.slice(0, 3) + '-' + security_Code.slice(3) : '';

    return (

        <RBSheet
            ref={onRef}
            customModalProps={{
                animationType: 'fade',
                statusBarTranslucent: true,
            }}
            customStyles={{
                wrapper: {
                    backgroundColor: theme._77777733,
                },
                container: {
                    height: getScaleSize(500),
                    borderTopLeftRadius: getScaleSize(24),
                    borderTopRightRadius: getScaleSize(24),
                    backgroundColor: theme.white,
                },
            }}
            draggable={false}
            closeOnPressMask={true}>
            <View style={styles(theme).content}>
                <Image style={styles(theme).icon} source={IMAGES.pinIcon} />
                <Text
                    size={getScaleSize(22)}
                    font={FONTS.Lato.SemiBold}
                    color={theme.primary}
                    style={{ alignSelf: 'center', marginTop: getScaleSize(24) }}>
                    {STRING.enter_security_code}
                </Text>
                <Text
                    size={getScaleSize(14)}
                    font={FONTS.Lato.Medium}
                    color={theme._737373}
                    align="center"
                    style={{
                        alignSelf: 'center',
                        marginTop: getScaleSize(16),
                        marginHorizontal: getScaleSize(50),
                    }}>
                    {STRING.enter_security_code_message}
                </Text>
                <View style={styles(theme).otpContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: getScaleSize(12), marginVertical: getScaleSize(6) }}>
                        {formattedSecurityCode?.split('').map((char: any, index: any) => (
                            <View key={index} style={{ marginVertical: getScaleSize(10) }} >
                                <Text
                                    font={FONTS.Lato.SemiBold}
                                    size={getScaleSize(16)}
                                    align="center"
                                    color={theme._0F232F} >
                                    {char}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <OTPTextInput
                        ref={otpInput}
                        inputCount={3}
                        handleTextChange={onChangeOtp}
                        value={otp}
                        tintColor={otpError ? theme._EF5350 : theme.primary} // border color when active
                        offTintColor={otpError ? theme._EF5350 : theme._BFBFBF} // border color when inactive
                        textInputStyle={styles(theme).textInput}
                        containerStyle={{ flexDirection: 'row', justifyContent: 'center', gap: getScaleSize(12) }}
                    />
                    {otpError &&
                        <Text
                            size={getScaleSize(14)}
                            font={FONTS.Lato.Regular}
                            color={theme._EF5350}
                            align="center"
                            style={{ marginTop: getScaleSize(8) }}>
                            {otpError}
                        </Text>
                    }
                </View>
                <Button
                    disabled={!otp}
                    style={{margin: getScaleSize(24), }}
                    title={STRING.validate}
                    onPress={onProcessPress}
                />
            </View>
        </RBSheet >
    )
}

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        content: {
            paddingVertical: getScaleSize(24),
            flex: 1.0,
        },
        icon: {
            height: getScaleSize(60),
            width: getScaleSize(60),
            alignSelf: 'center',
        },
        buttonContainer: {
            marginHorizontal: getScaleSize(22),
            marginTop: getScaleSize(24),
        },
        otpContainer: {
            flex: 1.0,
            alignItems: 'center',
        },
        textInput: {
            width: getScaleSize(50),
            height: getScaleSize(50),
            borderWidth: 1,
            borderRadius: getScaleSize(12),
            borderBottomWidth: 1,
            borderColor: theme._BFBFBF,
            fontSize: getScaleSize(16),
            fontFamily: FONTS.Lato.Bold,
            color: theme._31302F,
            backgroundColor: theme.white,
        },
    });