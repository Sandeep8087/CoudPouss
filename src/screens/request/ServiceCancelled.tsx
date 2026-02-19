import React, { useContext, useEffect, useRef, useState } from 'react';
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
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';

//COMPONENT
import {
    Button,
    Header,
    ProgressView,
    Text,
} from '../../components';
import { API } from '../../api';
import moment from 'moment';

export const arrayIcons = {
    pets: IMAGES.pets,
    homecare: IMAGES.homecare,
    housekeeping: IMAGES.housekeeping,
    childcare: IMAGES.childcare,
    diy: IMAGES.diy,
    transport: IMAGES.transportIcon,
    'personal care': IMAGES.personalCareIcon,
    'tech support': IMAGES.it,
    gardening: IMAGES.gardening,
};

export default function ServiceCancelled(props: any) {
    const STRING = useString();
    const { theme } = useContext<any>(ThemeContext);

    const item = props?.route?.params?.item ?? {};

    console.log('ITEM', JSON.stringify(item))

    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        if (item) {

        }
    }, [item]);

    async function cancelService(serviceId: any) {
        try {
            setLoading(true);
            const result = await API.Instance.post(API.API_ROUTES.onCancelService + `/${serviceId}`);
            if (result.status) {
                SHOW_TOAST(result?.data?.message ?? '', 'success')
                // props?.navigation.navigate(SCREENS.ServiceCancelled.identifier, {
                //     item: result?.data?.data
                // });
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error')
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
        } finally {
            setLoading(false);
        }
    }

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
                        {item?.sub_category_name}
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
                                    {item?.chosen_datetime
                                        ? moment(item?.chosen_datetime).format(
                                            'DD MMM, YYYY',
                                        )
                                        : '-'}
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
                                    {item?.chosen_datetime
                                        ? moment(item?.chosen_datetime).format('hh:mm A')
                                        : '-'}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles(theme).horizontalView,
                                { marginTop: getScaleSize(12) },
                            ]}>
                            <View style={styles(theme).itemView}>
                                {item?.category_name ? (
                                    <Image
                                        style={[
                                            styles(theme).informationIcon,
                                            { tintColor: theme._1A3D51 },
                                        ]}
                                        source={
                                            arrayIcons[
                                            item?.category_name?.toLowerCase() as keyof typeof arrayIcons
                                            ] ?? (arrayIcons['diy'] as any)
                                        }
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={[styles(theme).informationIcon]} />
                                )}
                                <Text
                                    style={{
                                        marginHorizontal: getScaleSize(8),
                                        alignSelf: 'center',
                                    }}
                                    size={getScaleSize(12)}
                                    font={FONTS.Lato.Medium}
                                    color={theme.primary}>
                                    {item?.category_name}
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
                                    {item?.service_address ?? '-'}
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
                            {`€${item?.total_amount ?? '0'}`}
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
                            {`€${item?.service_fee ?? '0'}`}
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
                            {`€${item?.total_refund ?? '0'}`}
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
            {isLoading && <ProgressView />}
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
