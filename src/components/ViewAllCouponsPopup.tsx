import React, { useContext, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Image,
    Dimensions,
    FlatList,
    Pressable,
    Platform,
} from 'react-native';
import { ThemeContext, ThemeContextType } from '../context';
import { getScaleSize, useString } from '../constant';
import { FONTS, IMAGES } from '../assets';
import Text from './Text';

import RBSheet from 'react-native-raw-bottom-sheet';

import { useSafeAreaInsets } from 'react-native-safe-area-context';


interface ViewAllCouponsPopupProps {
    cancelServiceDetails?: any;
    onClose: () => void;
    onProcessPress: any
    onRef: any;
    height?: number;
    coupons: any;
    couponCode: any;
}

export default function ViewAllCouponsPopup(props: ViewAllCouponsPopupProps) {

    const insets = useSafeAreaInsets()
    const { theme } = useContext<any>(ThemeContext);

    const STRING = useString();
    const { onRef, onProcessPress, onClose, couponCode, coupons } = props;

    return (
        <RBSheet
            ref={onRef}
            customModalProps={{
                animationType: 'fade',
                statusBarTranslucent: true,
            }}
            customAvoidingViewProps={
                Platform.OS === 'android'
                    ? { enabled: false }
                    : { enabled: true, behavior: 'padding' }
            }
            customStyles={{
                wrapper: {
                    backgroundColor: theme._77777733,
                },
                container: {
                    height: getScaleSize(500),
                    borderTopLeftRadius: getScaleSize(24),
                    borderTopRightRadius: getScaleSize(24),
                    backgroundColor: theme.white,
                    paddingBottom: insets.bottom,
                },
            }}
            draggable={false}
            
            closeOnPressMask={true}>
            <View style={[styles(theme).content]}>
                <Text
                    size={getScaleSize(22)}
                    font={FONTS.Lato.SemiBold}
                    style={{ marginHorizontal: getScaleSize(24), marginBottom: getScaleSize(24) }}
                    color={theme.primary}>
                    {STRING.view_all_coupons}
                </Text>
                <View style={{ height: getScaleSize(400) }}>
                    <FlatList
                        data={coupons}
                        keyExtractor={(item: any, index: number) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles(theme).couponItem}>
                                <View style={{ flex: 1 }}>
                                    <View style={styles(theme).couponItemTitle}>
                                        <Image
                                            source={IMAGES.ic_coupon}
                                            style={styles(theme).icon} />
                                        <Text
                                            size={getScaleSize(14)}
                                            font={FONTS.Lato.SemiBold}
                                            color={theme.primary}>
                                            {item.code_name}
                                        </Text>
                                    </View>
                                    <Text
                                        size={getScaleSize(14)}
                                        font={FONTS.Lato.SemiBold}
                                        color={theme._595959}>
                                        {STRING.welcome_discount}
                                    </Text>
                                </View>
                                <Text
                                    size={getScaleSize(16)}
                                    font={FONTS.Lato.Bold}
                                    style={{ marginHorizontal: getScaleSize(18) }}
                                    color={theme.primary}>
                                    {`${item.discount_percentage}%`}
                                </Text>
                                <Pressable 
                                style={styles(theme).couponItemValue}
                                onPress={() => {
                                    onProcessPress(item);
                                }}>
                                    <Text
                                        size={getScaleSize(16)}
                                        font={FONTS.Lato.Bold}
                                        color={theme.primary}>
                                        {couponCode?.id === item?.id  ?  STRING.applied : STRING.apply}
                                    </Text>
                                </Pressable>
                            </View>
                        )}
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

        },
        icon: {
            height: getScaleSize(20),
            width: getScaleSize(20),
            marginRight: getScaleSize(6),
        },
        couponItem: {
            paddingHorizontal: getScaleSize(16),
            paddingVertical: getScaleSize(13),
            borderRadius: getScaleSize(12),
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme._E6E6E6,
            marginBottom: getScaleSize(16),
            marginHorizontal: getScaleSize(24),
        },
        couponItemTitle: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: getScaleSize(13),
        },
        couponItemValue: {
            paddingHorizontal: getScaleSize(18),
            paddingVertical: getScaleSize(10),
        }
    });