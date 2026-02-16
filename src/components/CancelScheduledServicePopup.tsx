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
} from 'react-native';
import { ThemeContext, ThemeContextType } from '../context';
import { getScaleSize, useString } from '../constant';
import { FONTS, IMAGES } from '../assets';
import Text from './Text';
import { constant } from 'lodash';
import RBSheet from 'react-native-raw-bottom-sheet';


interface CancelScheduledServicePopupProps {
    cancelServiceDetails?: any;
    onClose: () => void;
    onCancel: (item: any) => void;
    onRef: any;
    height?: number;
}

export default function CancelScheduledServicePopup(props: CancelScheduledServicePopupProps) {
    const { theme } = useContext<any>(ThemeContext);

    const STRING = useString();
    const { onRef, cancelServiceDetails, onClose, onCancel, height } = props;
    console.log('cancelServiceDetails==>', cancelServiceDetails)

    function getTitle() {
        if (cancelServiceDetails?.hours_before_service) {
            return STRING.cancel_scheduled_service;
        } else {
            return STRING.cancellation_not_possible;
        }
    }

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
                    height: getScaleSize(550),
                    borderTopLeftRadius: getScaleSize(24),
                    borderTopRightRadius: getScaleSize(24),
                    backgroundColor: theme.white,
                },
            }}
            draggable={false}
            closeOnPressMask={true}>
            <View style={styles(theme).content}>
                <Image style={styles(theme).icon} source={IMAGES.serviceCancelledIcon} />
                <Text
                    size={getScaleSize(22)}
                    font={FONTS.Lato.Bold}
                    color={theme.primary}
                    style={{ alignSelf: 'center', marginTop: getScaleSize(16) }}>
                    {getTitle()}
                </Text>
                {cancelServiceDetails?.hours_before_service && (
                    <Text
                        size={getScaleSize(19)}
                        font={FONTS.Lato.Medium}
                        color={theme._424242}
                        align="center"
                        style={{
                            alignSelf: 'center',
                            marginTop: getScaleSize(16),
                            marginHorizontal: getScaleSize(50),
                        }}>
                        {STRING.are_you_sure_you_want_to_cancel_your_scheduled_service_with_the_expert}
                    </Text>
                )}
                {cancelServiceDetails?.hours_before_service && !cancelServiceDetails?.is_within_48_hours && (
                    <View style={styles(theme).informationContainer}>
                        <Text
                            size={getScaleSize(18)}
                            font={FONTS.Lato.SemiBold}
                            color={theme._323232}
                            style={{ marginBottom: getScaleSize(8) }}>
                            {STRING.payment_breakdown}
                        </Text>
                        <View style={styles(theme).horizontalView}>
                            <Text
                                style={{ flex: 1.0 }}
                                size={getScaleSize(14)}
                                font={FONTS.Lato.SemiBold}
                                color={'#595959'}>
                                {STRING.FinalizedQuoteAmount}
                            </Text>
                            <Text
                                size={getScaleSize(14)}
                                font={FONTS.Lato.SemiBold}
                                color={'#595959'}>
                                {`€${cancelServiceDetails?.total_amount ?? '0'}`}
                            </Text>
                        </View>
                        <View style={styles(theme).horizontalView}>
                            <Text
                                style={{ flex: 1.0 }}
                                size={getScaleSize(14)}
                                font={FONTS.Lato.SemiBold}
                                color={'#595959'}>
                                {STRING.service_fee}
                            </Text>
                            <Text

                                size={getScaleSize(14)}
                                font={FONTS.Lato.SemiBold}
                                color={'#595959'}>
                                {`€${cancelServiceDetails?.service_fee ?? '0'}`}
                            </Text>
                        </View>
                        <View style={styles(theme).dotView} />
                        <View style={styles(theme).horizontalView}>
                            <Text
                                style={{ flex: 1.0 }}
                                size={getScaleSize(20)}
                                font={FONTS.Lato.SemiBold}
                                color={'#0F232F'}>
                                {STRING.Total}
                                <Text
                                    size={getScaleSize(11)}
                                    font={FONTS.Lato.Regular}
                                    color={theme._424242}>
                                    {'  (final amount you will get)'}
                                </Text>
                            </Text>
                            <Text
                                size={getScaleSize(20)}
                                font={FONTS.Lato.SemiBold}
                                color={theme.primary}>
                                {`€${cancelServiceDetails?.total_refund ?? '0'}`}
                            </Text>
                        </View>
                    </View>
                )}
                {/* <View style={{flex:1.0}}/> */}
                <View style={styles(theme).buttonContainer}>
                    <TouchableOpacity
                        style={styles(theme).nextButtonContainer}
                        activeOpacity={1}
                        onPress={() => {
                            onClose()
                        }}>
                        <Text
                            size={getScaleSize(19)}
                            font={FONTS.Lato.Bold}
                            color={theme.white}
                            style={{ alignSelf: 'center' }}>
                            {STRING.keep_booking}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles(theme).backButtonContainer}
                        activeOpacity={1}
                        onPress={()=>{
                            onCancel(cancelServiceDetails?.service_id ?? null)
                        }}>
                        <Text
                            size={getScaleSize(19)}
                            font={FONTS.Lato.Bold}
                            color={theme._C62828}
                            style={{ alignSelf: 'center' }}>
                            {STRING.confirm_cancellation}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </RBSheet>
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
        radioButtonContainer: {
            marginTop: getScaleSize(20),
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: theme._D5D5D5,
            paddingVertical: getScaleSize(17),
            paddingHorizontal: getScaleSize(17),
            borderRadius: getScaleSize(12),
            marginHorizontal: getScaleSize(22),
        },
        radioButton: {
            height: getScaleSize(24),
            width: getScaleSize(24),
            alignSelf: 'center',
        },
        buttonContainer: {
            flexDirection: 'row',
            marginHorizontal: getScaleSize(22),
            marginTop: getScaleSize(24),
        },
        backButtonContainer: {
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme._C62828,
            borderRadius: getScaleSize(12),
            paddingVertical: getScaleSize(18),
            backgroundColor: theme.white,
            marginLeft: getScaleSize(8),
            paddingHorizontal: getScaleSize(22),
        },
        nextButtonContainer: {
            flex: 1.0,
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.primary,
            borderRadius: getScaleSize(12),
            paddingVertical: getScaleSize(18),
            backgroundColor: theme.primary,
            marginRight: getScaleSize(8),
        },
        informationContainer: {
            marginTop: getScaleSize(16),
            borderWidth: 1,
            borderColor: '#D5D5D5',
            borderRadius: getScaleSize(16),
            paddingHorizontal: getScaleSize(16),
            paddingVertical: getScaleSize(28),
            marginHorizontal: getScaleSize(24),
        },
        horizontalView: {
            flexDirection: 'row',
            marginTop: getScaleSize(8),
        },
        dotView: {
            // flex:1.0,
            borderStyle: 'dashed',
            borderColor: theme.primary,
            borderWidth: 1,
            marginTop: getScaleSize(16),
            marginBottom: getScaleSize(8),
        }
    });