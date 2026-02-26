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
import { ThemeContext, ThemeContextType } from '../context';
import { getScaleSize, useString } from '../constant';
import { FONTS, IMAGES } from '../assets';
import Text from './Text';
import { constant } from 'lodash';
import RBSheet from 'react-native-raw-bottom-sheet';
import Button from './Button';
import Input from './Input';


interface RenegotiationProps {
    cancelServiceDetails?: any;
    onClose: () => void;
    onProcessPress: any
    onRef: any;
    height?: number;
    onChangeNewQuoteAmount?: (text: string) => void;
    newQuoteAmount?: string;
    newQuoteAmountError?: string;
    item?: any;
    type?: string;
}

export default function RenegotiationSheet(props: RenegotiationProps) {
    const { theme } = useContext<any>(ThemeContext);

    const STRING = useString();
    const { onRef, onProcessPress, onClose, newQuoteAmount, type, newQuoteAmountError, onChangeNewQuoteAmount, item, height } = props;

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
                    height: height ? height : getScaleSize(580),
                    borderTopLeftRadius: getScaleSize(24),
                    borderTopRightRadius: getScaleSize(24),
                    backgroundColor: theme.white,
                },
            }}
            draggable={false}
            closeOnPressMask={true}>
            <View style={styles(theme).content}>
                <Image style={styles(theme).icon} source={type == 'accept' ? IMAGES.ic_like : IMAGES.renegotiationIcon} />
                {type == 'accept' ? (
                    <Text
                        size={getScaleSize(20)}
                        font={FONTS.Lato.Regular}
                        color={theme._939393}
                        align="center"
                        style={{ marginTop: getScaleSize(24), marginHorizontal: getScaleSize(40) }}>
                        {STRING.the_client_has_approved_your_request_Would_you_like_to_proceed_with_the_next_steps}
                    </Text>
                ) : (
                    <>
                        <Text
                            size={getScaleSize(22)}
                            font={FONTS.Lato.SemiBold}
                            color={theme.primary}
                            style={{ alignSelf: 'center', marginTop: getScaleSize(24) }}>
                            {STRING.renegotiate}
                        </Text>
                        <Text
                            size={getScaleSize(12)}
                            font={FONTS.Lato.Regular}
                            color={theme._555555}
                            align="center"
                            style={{
                                alignSelf: 'center',
                                marginTop: getScaleSize(16),
                                marginHorizontal: getScaleSize(50),
                            }}>
                            {STRING.renegotiate_message}
                        </Text>
                    </>
                )}
                <View style={styles(theme).informationContainer}>
                    <Text
                        size={getScaleSize(18)}
                        font={FONTS.Lato.SemiBold}
                        color={theme._323232}
                        style={{ marginBottom: getScaleSize(8) }}>
                        {STRING.current_payment_breakdown}
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
                            {`€${item?.finalized_quote_amount ?? '0'}`}
                        </Text>
                    </View>
                    <View style={styles(theme).horizontalView}>
                        <Text
                            style={{ flex: 1.0 }}
                            size={getScaleSize(14)}
                            font={FONTS.Lato.SemiBold}
                            color={'#595959'}>
                            {STRING.Platform_Fee_15}
                        </Text>
                        <Text
                            size={getScaleSize(14)}
                            font={FONTS.Lato.SemiBold}
                            color={'#595959'}>
                            {`€${item?.platform_fee ?? '0'}`}
                        </Text>
                    </View>
                    <View style={styles(theme).horizontalView}>
                        <Text
                            style={{ flex: 1.0 }}
                            size={getScaleSize(14)}
                            font={FONTS.Lato.SemiBold}
                            color={'#595959'}>
                            {STRING.Taxes}
                        </Text>
                        <Text
                            size={getScaleSize(14)}
                            font={FONTS.Lato.SemiBold}
                            color={'#595959'}>
                            {`€${item?.taxes ?? '0'}`}
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
                            {`€${item?.total ?? '0'}`}
                        </Text>
                    </View>
                </View>
                {type !== 'accept' && (
                    <View style={{ flex: 1.0, marginTop: getScaleSize(20), marginHorizontal: getScaleSize(24) }}>
                        <Text
                            size={getScaleSize(14)}
                            font={FONTS.Lato.SemiBold}
                            color={theme._323232}
                            style={{ marginBottom: getScaleSize(8) }}>
                            {STRING.enter_requested_adjustment}
                        </Text>
                        <View style={{
                            height: getScaleSize(56),
                            borderWidth: 1,
                            borderColor: newQuoteAmountError ? theme._EF5350 : theme._D5D5D5,
                            borderRadius: getScaleSize(12),
                            paddingHorizontal: getScaleSize(16)
                        }}>
                            <TextInput
                                style={styles(theme).input}
                                placeholder={STRING.Enter_Requested_Adjustment}
                                placeholderTextColor={theme._818285}
                                value={newQuoteAmount ? `€${newQuoteAmount}` : ''}
                                keyboardType="numeric"
                                onChangeText={onChangeNewQuoteAmount}
                            />
                        </View>
                        {newQuoteAmountError &&
                            <Text
                                style={{ marginTop: getScaleSize(4) }}
                                size={getScaleSize(12)}
                                font={FONTS.Lato.Regular}
                                color={theme._EF5350}>
                                {newQuoteAmountError}
                            </Text>
                        }
                    </View>
                )}
                <View style={styles(theme).buttonContainer}>
                    {type != 'accept' &&
                        <TouchableOpacity
                            style={styles(theme).backButtonContainer}
                            activeOpacity={1}
                            onPress={onClose}>
                            <Text
                                size={getScaleSize(19)}
                                font={FONTS.Lato.Bold}
                                color={theme._214C65}
                                style={{ alignSelf: 'center' }}>
                                {STRING.cancel}
                            </Text>
                        </TouchableOpacity>
                    }
                    {type != 'accept' && <View style={{ width: getScaleSize(16) }} />}
                    <Button
                        style={{ flex: 1.0 }}
                        title={STRING.proceed}
                        onPress={onProcessPress}
                    />
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
            flex: 1.0,
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme._214C65,
            borderRadius: getScaleSize(12),
            paddingVertical: getScaleSize(18)
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
            marginTop: getScaleSize(20),
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
        },
        input: {
            fontSize: getScaleSize(16),
            fontFamily: FONTS.Lato.Medium,
            color: theme._31302F,
            flex: 1.0,
            height: Platform.OS == 'ios' ? getScaleSize(56) : getScaleSize(56),
        },
    });