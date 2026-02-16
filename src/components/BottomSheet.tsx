import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import { ThemeContext, ThemeContextType } from '../context/ThemeProvider';
import RBSheet from 'react-native-raw-bottom-sheet';
import { getScaleSize, useString } from '../constant';
import { FONTS, IMAGES } from '../assets';
import Text from './Text';
import Button from './Button';

interface BottomSheetProps {
    bottomSheetRef: any;
    height: number;
    title?: string;
    description?: string;
    buttonTitle?: string;
    onPressButton?: () => void;
    isStatus?: boolean;
    secondButtonTitle?: string;
    onPressSecondButton?: () => void,
    isInfo?: boolean;
    addMoreServices?: boolean;
    type?: string;
    security_Code?: any;
    isNotCloseable?: boolean;
    image?: any;
}

export default function BottomSheet(props: BottomSheetProps) {
    const { theme } = useContext<any>(ThemeContext);
    const STRING = useString();
    const { bottomSheetRef,
        height, title,
        description, buttonTitle,
        isInfo, onPressButton,
        addMoreServices, isStatus,
        secondButtonTitle, onPressSecondButton,
        type, security_Code,
        isNotCloseable,
        image
    } = props;
    return (
        <RBSheet
            ref={bottomSheetRef}
            customModalProps={{
                animationType: 'fade',
                statusBarTranslucent: true,
            }}
            customStyles={{
                wrapper: {
                    backgroundColor: theme._77777733,
                },
                container: {
                    height: height,
                    borderTopLeftRadius: getScaleSize(24),
                    borderTopRightRadius: getScaleSize(24),
                    backgroundColor: theme.white,
                },
            }}
            draggable={false}
            closeOnPressMask={isNotCloseable ? false : true}>
            <View style={styles(theme).container}>
                {isStatus && (
                    <View style={styles(theme).statusContainer}>
                        <Image source={IMAGES.ic_file_sucess} style={[styles(theme).alartIcon, { marginBottom: getScaleSize(24) }]} />
                        <Text
                            size={getScaleSize(22)}
                            font={FONTS.Lato.SemiBold}
                            align="center"
                            color={theme._555555}
                            style={{ lineHeight: getScaleSize(30) }}>
                            {title}
                        </Text>
                    </View>
                )}
                {type === 'payment' && (
                    <View style={styles(theme).statusContainer}>
                        <Image source={IMAGES.add_service} style={[styles(theme).alartIcon, { marginBottom: getScaleSize(16) }]} />
                        <Text
                            size={getScaleSize(22)}
                            font={FONTS.Lato.SemiBold}
                            align="center"
                            color={theme._323232}>
                            {title}
                        </Text>
                        <Text
                            size={getScaleSize(18)}
                            style={{ marginTop: getScaleSize(16) }}
                            font={FONTS.Lato.Medium}
                            align="center"
                            color={theme._424242}>
                            {description}
                        </Text>
                    </View>
                )}
                {type === 'review' && (
                    <View style={styles(theme).statusContainer}>
                        <Image source={IMAGES.ic_review} style={[styles(theme).alartIcon, { marginBottom: getScaleSize(16) }]} />
                        <Text
                            size={getScaleSize(24)}
                            font={FONTS.Lato.SemiBold}
                            align="center"
                            color={theme._323232}>
                            {title}
                        </Text>
                        <Text
                            size={getScaleSize(19)}
                            style={{ marginTop: getScaleSize(16) }}
                            font={FONTS.Lato.Medium}
                            align="center"
                            color={theme._424242}>
                            {description}
                        </Text>
                    </View>
                )}
                {isInfo && (
                    <View style={styles(theme).mainContainer}>
                        <Image source={IMAGES.ic_alart} style={[styles(theme).alartIcon, { marginBottom: getScaleSize(24) }]} />
                        <Text
                            style={{ marginBottom: getScaleSize(16) }}
                            size={getScaleSize(22)}
                            font={FONTS.Lato.SemiBold}
                            align="center"
                            color={theme._2C6587}>
                            {title}
                        </Text>
                        <Text
                            size={getScaleSize(12)}
                            font={FONTS.Lato.Regular}
                            align="center"
                            color={theme._555555}>
                            {description}
                        </Text>
                    </View>
                )}
                {addMoreServices && (
                    <View style={[styles(theme).mainContainer, { marginHorizontal: getScaleSize(50) }]}>
                        <Image source={IMAGES.add_service} style={[styles(theme).alartIcon, { marginBottom: getScaleSize(12) }]} />
                        <Text
                            size={getScaleSize(18)}
                            font={FONTS.Lato.Medium}
                            align="center"
                            color={theme._214C65}>
                            {title}
                        </Text>
                        <Text
                            style={{ marginTop: getScaleSize(24) }}
                            size={getScaleSize(12)}
                            font={FONTS.Lato.Regular}
                            align="center"
                            color={theme._555555}>
                            {description}
                        </Text>
                    </View>
                )}
                {type === 'out_of_service' && (
                    <View style={[styles(theme).mainContainer, { marginHorizontal: getScaleSize(50) }]}>
                        <Image source={image} style={[styles(theme).alartIcon, { marginBottom: getScaleSize(12) }]} />
                        <Text
                            size={getScaleSize(22)}
                            font={FONTS.Lato.SemiBold}
                            align="center"
                            color={theme._555555}>
                            {title}
                        </Text>
                    </View>
                )}
                {type === 'map_view' && (
                    <View style={styles(theme).mainContainer}>
                        <Image source={IMAGES.pinIcon} style={[styles(theme).alartIcon, { marginBottom: getScaleSize(12) }]} />
                        <Text
                            size={getScaleSize(22)}
                            font={FONTS.Lato.SemiBold}
                            align="center"
                            color={theme._555555}>
                            {title}
                        </Text>
                        <View style={styles(theme).informationView}>
                            <Text
                                font={FONTS.Lato.Medium}
                                size={getScaleSize(16)}
                                color={theme._2C6587} >
                                {STRING.SecurityCode}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: getScaleSize(40), marginTop: getScaleSize(20) }}>
                                {security_Code.split('').map((char: any, index: any) => (
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
                        </View>
                        <Text
                            size={getScaleSize(22)}
                            font={FONTS.Lato.SemiBold}
                            align="center"
                            color={theme._555555}>
                            {description}
                        </Text>
                    </View>
                )}
                {type === 'success' && (
                    <View style={styles(theme).mainContainer}>
                        <Image source={image} style={[styles(theme).alartIcon, { marginBottom: getScaleSize(24) }]} />
                        <Text
                            size={getScaleSize(18)}
                            font={FONTS.Lato.SemiBold}
                            align="center"
                            color={theme._565656}>
                            {title}
                        </Text>
                    </View>
                )}
                {secondButtonTitle ?
                    <View style={styles(theme).buttonContainer}>
                        <TouchableOpacity
                            onPress={onPressSecondButton}
                            style={styles(theme).btnStyle}
                        >
                            <Text
                                size={getScaleSize(19)}
                                font={FONTS.Lato.Bold}
                                align="center"
                                color={theme._214C65}>
                                {secondButtonTitle}
                            </Text>
                        </TouchableOpacity>
                        <Button
                            style={{ flex: 1.0 }}
                            title={buttonTitle}
                            onPress={onPressButton}
                        />
                    </View>
                    :
                    <Button
                        title={buttonTitle}
                        style={{ marginVertical: getScaleSize(24), marginHorizontal: getScaleSize(24) }}
                        onPress={onPressButton}
                    />
                }
            </View>
        </RBSheet>
    )
}

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        container: {
            flex: 1.0,
        },
        mainContainer: {
            marginTop: getScaleSize(24),
            marginHorizontal: getScaleSize(24),
            flex: 1.0,
        },
        alartIcon: {
            width: getScaleSize(60),
            height: getScaleSize(60),
            alignSelf: 'center',
        },
        statusContainer: {
            marginTop: getScaleSize(24),
            marginHorizontal: getScaleSize(24),
            flex: 1.0,
        },
        buttonContainer: {
            gap: getScaleSize(16),
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: getScaleSize(24),
            marginBottom: getScaleSize(24),
        },
        btnStyle: {
            borderWidth: 1,
            borderColor: theme._214C65,
            borderRadius: getScaleSize(12),
            paddingVertical: getScaleSize(18),
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1.0,
        },
        date: {
            fontSize: 12,
            color: '#737373',
            fontFamily: FONTS.Lato.Regular,
        },
        informationView: {
            marginVertical: getScaleSize(24),
            borderRadius: getScaleSize(12),
            paddingHorizontal: getScaleSize(20),
            paddingVertical: getScaleSize(16),
            borderWidth: 1,
            borderColor: theme._E6E6E6,
        },
    });