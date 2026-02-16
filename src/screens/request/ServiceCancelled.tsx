import React, { useContext, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
} from 'react-native';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { getScaleSize, useString } from '../../constant';

//COMPONENT
import {
    Button,
    Header,
    Text,
} from '../../components';

export default function ServiceCancelled(props: any) {
    const STRING = useString();
    const { theme } = useContext<any>(ThemeContext);

    const item = props?.route?.params?.item ?? {};

    useEffect(() => {
        if (item) {
           
        }
    }, [item]);

    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
                screenName={STRING.service_cancelled}
            />
            <ScrollView
                style={styles(theme).scrolledContainer}
                showsVerticalScrollIndicator={false}>
                <Image style={styles(theme).doneIcon} source={IMAGES.serviceCancelledIcon} />
                <Text
                    style={{ marginTop: getScaleSize(24) }}
                    size={getScaleSize(19)}
                    align="center"
                    font={FONTS.Lato.Medium}
                    color={theme._424242}>
                    {STRING.service_cancelled_message}
                </Text>
                <View style={styles(theme).informationContainer}>
                    <Text
                        style={{}}
                        size={getScaleSize(16)}
                        font={FONTS.Lato.Bold}
                        color={theme.primary}>
                        {'Furniture Assembly'}
                    </Text>
                    <View style={styles(theme).informationView}>
                        <View style={styles(theme).horizontalView}>
                            <View style={styles(theme).itemView}>
                                <Image
                                    style={styles(theme).informationIcon}
                                    source={IMAGES.calender}
                                />
                                <Text
                                    style={{
                                        marginHorizontal: getScaleSize(8),
                                        alignSelf: 'center',
                                    }}
                                    size={getScaleSize(12)}
                                    font={FONTS.Lato.Medium}
                                    color={theme.primary}>
                                    {'16 Aug, 2025'}
                                </Text>
                            </View>
                            <View style={styles(theme).itemView}>
                                <Image
                                    style={styles(theme).informationIcon}
                                    source={IMAGES.clock}
                                />
                                <Text
                                    style={{
                                        marginHorizontal: getScaleSize(8),
                                        alignSelf: 'center',
                                    }}
                                    size={getScaleSize(12)}
                                    font={FONTS.Lato.Medium}
                                    color={theme.primary}>
                                    {'10:00 am'}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles(theme).horizontalView,
                                { marginTop: getScaleSize(12) },
                            ]}>
                            <View style={styles(theme).itemView}>
                                <Image
                                    style={styles(theme).informationIcon}
                                    source={IMAGES.service}
                                />
                                <Text
                                    style={{
                                        marginHorizontal: getScaleSize(8),
                                        alignSelf: 'center',
                                    }}
                                    size={getScaleSize(12)}
                                    font={FONTS.Lato.Medium}
                                    color={theme.primary}>
                                    {'DIY Services'}
                                </Text>
                            </View>
                            <View style={styles(theme).itemView}>
                                <Image
                                    style={styles(theme).informationIcon}
                                    source={IMAGES.pin}
                                />
                                <Text
                                    style={{
                                        marginHorizontal: getScaleSize(8),
                                        alignSelf: 'center',
                                    }}
                                    size={getScaleSize(12)}
                                    numberOfLines={4}
                                    font={FONTS.Lato.Medium}
                                    color={theme.primary}>
                                    {'Paris, 75001'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles(theme).informationContainer}>
                    <Text
                        size={getScaleSize(18)}
                        font={FONTS.Lato.SemiBold}
                        color={theme._323232}>
                        {STRING.payment_breakdown}
                    </Text>
                    <View style={styles(theme).newhorizontalView}>
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
                            {'€499'}
                        </Text>
                    </View>
                    <View style={styles(theme).newhorizontalView}>
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
                            {'€49'}
                        </Text>
                    </View>
                    <View style={styles(theme).dotView} />
                    <View style={styles(theme).newhorizontalView}>
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
                            {'€450.00'}
                        </Text>
                    </View>
                </View>
                <Text
                    style={{ marginTop: getScaleSize(20) }}
                    size={getScaleSize(12)}
                    font={FONTS.Lato.Regular}
                    color={theme._555555}>
                    {STRING.cancelled_message}
                </Text>
                <View style={{ height: getScaleSize(32) }}></View>
                <Button
                    title={STRING.ProceedtoPay}
                    style={{ marginHorizontal: getScaleSize(22), marginBottom: getScaleSize(16) }}
                    onPress={() => {
                    }}
                />
            </ScrollView>
        </View>
    );
}

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.white },
        scrolledContainer: {
            marginTop: getScaleSize(19),
            marginHorizontal: getScaleSize(24),
        },
        doneIcon: {
            height: getScaleSize(60),
            width: getScaleSize(60),
            alignSelf: 'center',
            resizeMode: 'contain',
        },
        informationContainer: {
            marginTop: getScaleSize(20),
            borderWidth: 1,
            borderColor: '#D5D5D5',
            borderRadius: getScaleSize(16),
            paddingHorizontal: getScaleSize(16),
            paddingVertical: getScaleSize(20),
        },
        informationView: {
            paddingVertical: getScaleSize(16),
            backgroundColor: '#EAF0F3',
            borderRadius: getScaleSize(16),
            paddingHorizontal: getScaleSize(16),
            marginTop: getScaleSize(16),
        },
        horizontalView: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        itemView: {
            flexDirection: 'row',
            flex: 1.0,
        },
        informationIcon: {
            height: getScaleSize(25),
            width: getScaleSize(25),
            alignSelf: 'center',
        },
        dotView: {
            // flex:1.0,
            borderStyle: 'dashed',
            borderColor: theme.primary,
            borderWidth: 1,
            marginTop: getScaleSize(8),
        },
        newhorizontalView: {
            flexDirection: 'row',
            marginTop: getScaleSize(16),
        },
        profilePicView: {
            height: getScaleSize(56),
            width: getScaleSize(56),
            borderRadius: getScaleSize(28),
        },
        newButton: {
            // flex: 1.0,
            backgroundColor: theme.primary,
            borderRadius: 8,
            height: getScaleSize(38),
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: getScaleSize(24),
        },
        flexRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        phoneIcon: {
            height: getScaleSize(20),
            width: getScaleSize(20),
            marginRight: getScaleSize(6),
        }
    });
