import { Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, useString } from '../../constant';

//SCREENS
import { SCREENS } from '..';

//COMPONENTS
import { Header, Input, Text, Button } from '../../components';

export default function SignupSelect(props: any) {

    const STRING = useString();
    const { setUserType } = useContext<any>(AuthContext);
    const { theme } = useContext<any>(ThemeContext);

    return (
        <View style={styles(theme).container}>
            <Header />
                <View style={styles(theme).mainContainer}>
                    <Image source={IMAGES.ic_logo} style={styles(theme).logo} />
                    <Text
                        size={getScaleSize(27)}
                        font={FONTS.Lato.ExtraBold}
                        color={theme._2C6587}
                        align="center"
                        style={{ marginBottom: getScaleSize(24) }}>
                        {STRING.coudPouss}
                    </Text>
                    <Text
                        size={getScaleSize(18)}
                        font={FONTS.Lato.SemiBold}
                        color={theme._737373}
                        align="center"
                        style={{ marginHorizontal: getScaleSize(48) }}>
                        {STRING.Empowering_seniors_with_easy_access_to_trusted_help_care_and_companionship_whenever_needed}
                    </Text>
                    <Button
                        title={STRING.Sign_up_as_Elder}
                        style={{ marginTop: getScaleSize(108) }}
                        onPress={() => {
                            props.navigation.navigate(SCREENS.Signup.identifier)
                            setUserType('elderly_user')
                        }}
                    />
                    <View style={styles(theme).orView}>
                        <View style={styles(theme).orLine} />
                        <View style={styles(theme).orText}>
                            <Text
                                size={getScaleSize(18)}
                                font={FONTS.Lato.Regular}
                                color={theme._818285}
                                align="center">
                                {STRING.or}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles(theme).btnView}
                        activeOpacity={0.5}
                        onPress={() => {
                            props.navigation.navigate(SCREENS.Signup.identifier)
                            setUserType('service_provider')
                        }}>
                        <Text
                            size={getScaleSize(19)}
                            font={FONTS.Lato.Bold}
                            color={theme._214C65}
                            align="center">
                            {STRING.Sign_up_as_Professional}
                        </Text>
                    </TouchableOpacity>
                </View>
        </View >
    );
}

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        container: {
            flex: 1.0,
            backgroundColor: theme.white,
            justifyContent:'center'
        },
        mainContainer: {
            flexGrow: 1,
            marginHorizontal: getScaleSize(24),
            marginTop: getScaleSize(63),
            paddingBottom: getScaleSize(40),
        },
        logo: {
            width: Dimensions.get('window').width - getScaleSize(190),
            height: Dimensions.get('window').width - getScaleSize(190),
            alignSelf: 'center',
            marginBottom: getScaleSize(5),
        },
        btnView: {
            borderWidth: 1,
            borderRadius: getScaleSize(12),
            borderColor: theme._214C65,
            paddingVertical: getScaleSize(18),
            alignItems: 'center',
            justifyContent: 'center',
        },
        orView: {
            marginTop: getScaleSize(40),
            marginBottom: getScaleSize(30),
        },
        orLine: {
            height: 1,
            backgroundColor: theme._F2F3F3,
        },
        orText: {
            marginTop: getScaleSize(-14),
            backgroundColor: theme.white,
            paddingHorizontal: getScaleSize(20),
            alignSelf: 'center',
        }
    });
