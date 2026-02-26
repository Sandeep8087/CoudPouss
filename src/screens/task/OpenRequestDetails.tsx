import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    View,
    StatusBar,
    StyleSheet,
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Alert,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Image,
    Platform,
} from 'react-native';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { arrayIcons, getScaleSize, SHOW_TOAST, useString } from '../../constant';

//COMPONENT
import {
    Header,
    ProgressView,
    StatusItem,
    Text,
} from '../../components';

//PACKAGES
import { API } from '../../api';
import moment from 'moment';
import { SCREENS } from '..';

export default function OpenRequestDetails(props: any) {

    const STRING = useString();
    const { theme } = useContext<any>(ThemeContext);
    const item = props?.route?.params?.item;

    const [isStatus, setIsStatus] = useState(true);

    const [visibleTaskDetails, setVisibleTaskDetails] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [serviceDetails, setServiceDetails] = useState<any>({});
    const [status, setStatus] = useState<any>('');

    useEffect(() => {
        if (item) {
            getServiceDetails();
        }
    }, []);

    const openservice = serviceDetails?.task_status === 'open';

    async function getServiceDetails() {
        try {
            const params = {
                service_id: item?.id
            }
            setLoading(true);
            const result = await API.Instance.post(API.API_ROUTES.getServiceDetails, params);
            setLoading(false);
            if (result.status) {
                setServiceDetails(result?.data?.data ?? {});
                
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error')
            }
        } catch (error: any) {
            setLoading(false);
            SHOW_TOAST(error?.message ?? '', 'error');
            console.log(error?.message)
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
                screenName={STRING.TaskDetails}
            />
            <ScrollView
                style={styles(theme).scrolledContainer}
                showsVerticalScrollIndicator={false}>
                <View style={styles(theme).imageContainer}>
                    {serviceDetails?.sub_category_logo ?
                        <Image
                            style={styles(theme).imageView}
                            source={{ uri: serviceDetails?.sub_category_logo }}
                        />
                        :
                        <View style={[styles(theme).imageView, { backgroundColor: theme._D5D5D5 }]} />
                    }
                    <Text
                        style={{
                            marginVertical: getScaleSize(12),
                            marginLeft: getScaleSize(4),
                        }}
                        size={getScaleSize(24)}
                        font={FONTS.Lato.Bold}
                        color={theme.primary}>
                        {serviceDetails?.sub_category_name ?? ''}
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
                                    {serviceDetails?.chosen_datetime ? moment.utc(serviceDetails?.chosen_datetime).local().format('DD MMM, YYYY') : '-'}
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
                                    {serviceDetails?.chosen_datetime ? moment.utc(serviceDetails?.chosen_datetime).local().format('hh:mm A') : '-'}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[
                                styles(theme).horizontalView,
                                { marginTop: getScaleSize(12) },
                            ]}>
                            <View style={styles(theme).itemView}>
                                {serviceDetails?.category_name ?
                                    <Image
                                        style={[styles(theme).informationIcon, { tintColor: theme._1A3D51 }]}
                                        source={arrayIcons[serviceDetails?.category_name?.toLowerCase() as keyof typeof arrayIcons] ?? arrayIcons['diy'] as any}
                                        resizeMode='cover'
                                    />
                                    :
                                    <View style={[styles(theme).informationIcon]} />
                                }
                                <Text
                                    style={{
                                        marginHorizontal: getScaleSize(8),
                                        alignSelf: 'center',
                                    }}
                                    size={getScaleSize(12)}
                                    font={FONTS.Lato.Medium}
                                    color={theme.primary}>
                                    {serviceDetails?.category_name ?? ''}
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
                                    {'-'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View
                    style={[
                        styles(theme).profileContainer,
                        { paddingVertical: getScaleSize(26) },
                    ]}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row' }}
                        activeOpacity={1}
                        onPress={() => {
                            setIsStatus(!isStatus);
                        }}>
                        <Text
                            style={{ flex: 1.0 }}
                            size={getScaleSize(18)}
                            font={FONTS.Lato.Medium}
                            color={theme._323232}>
                            {STRING.CheckStatus}
                        </Text>
                        <TouchableOpacity
                            style={{ height: getScaleSize(25), width: getScaleSize(24) }}
                            activeOpacity={1}
                            onPress={() => {
                                setIsStatus(!isStatus);
                            }}>
                            <Image
                                style={{ height: getScaleSize(25), width: getScaleSize(24) }}
                                source={isStatus ? IMAGES.up : IMAGES.down}
                            />
                        </TouchableOpacity>
                    </TouchableOpacity>
                    {isStatus && (
                        <>
                            <View style={styles(theme).devider}></View>
                            <View style={{ marginTop: getScaleSize(32) }}>
                                {serviceDetails?.lifecycle?.map((item: any, index: number) => (
                                    <StatusItem
                                        key={index}
                                        item={item}
                                        index={index}
                                        isLast={index === serviceDetails?.lifecycle?.length - 1}
                                    />
                                ))}
                            </View>
                        </>
                    )}
                </View>
                <View
                    style={[
                        styles(theme).profileContainer,
                        { paddingVertical: getScaleSize(26) },
                    ]}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row' }}
                        activeOpacity={1}
                        onPress={() => {
                            setVisibleTaskDetails(!visibleTaskDetails);
                        }}>
                        <Text
                            style={{ flex: 1.0 }}
                            size={getScaleSize(18)}
                            font={FONTS.Lato.SemiBold}
                            color={theme._323232}>
                            {STRING.TaskDetails}
                        </Text>
                        <TouchableOpacity
                            style={{ height: getScaleSize(25), width: getScaleSize(24) }}
                            activeOpacity={1}
                            onPress={() => {
                                setVisibleTaskDetails(!visibleTaskDetails);
                            }}>
                            <Image
                                style={{ height: getScaleSize(25), width: getScaleSize(24) }}
                                source={visibleTaskDetails ? IMAGES.up : IMAGES.down}
                            />
                        </TouchableOpacity>
                    </TouchableOpacity>
                    {visibleTaskDetails && (
                        <>
                            <View style={styles(theme).devider}></View>
                            <Text
                                style={{ flex: 1.0, marginTop: getScaleSize(20) }}
                                size={getScaleSize(18)}
                                font={FONTS.Lato.SemiBold}
                                color={'#424242'}>
                                {STRING.Servicedescription}
                            </Text>
                            <Text
                                style={{ flex: 1.0, marginTop: getScaleSize(16) }}
                                size={getScaleSize(14)}
                                font={FONTS.Lato.Medium}
                                color={theme._939393}>
                                {serviceDetails?.service_description ?? '-'}
                            </Text>
                            <Text
                                style={{ flex: 1.0, marginTop: getScaleSize(20) }}
                                size={getScaleSize(18)}
                                font={FONTS.Lato.SemiBold}
                                color={'#424242'}>
                                {STRING.Jobphotos}
                            </Text>
                            <FlatList
                                data={serviceDetails?.media?.photos ?? []}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item, index) => index.toString()}
                                contentContainerStyle={{ gap: getScaleSize(16) }}
                                renderItem={({ item, index }) => {
                                    return (
                                        <TouchableOpacity onPress={() => {
                                            props.navigation.navigate(SCREENS.WebViewScreen.identifier, {
                                                url: item,
                                            })
                                        }}>
                                            <Image
                                                style={[styles(theme).photosView]}
                                                resizeMode='cover'
                                                source={{ uri: item }}
                                            />
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </>
                    )}
                </View>
                <View style={{ height: getScaleSize(100) }} />
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
        imageContainer: {
            paddingVertical: getScaleSize(12),
            paddingHorizontal: getScaleSize(12),
            borderRadius: getScaleSize(20),
            backgroundColor: '#EAF0F3',
        },
        imageView: {
            height: getScaleSize(172),
            borderRadius: getScaleSize(20),
            flex: 1.0,
        },
        informationView: {
            paddingVertical: getScaleSize(16),
            backgroundColor: theme.white,
            borderRadius: getScaleSize(16),
            paddingHorizontal: getScaleSize(16),
        },
        horizontalView: {
            flexDirection: 'row',
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
        amountContainer: {
            marginTop: getScaleSize(32),
            paddingVertical: getScaleSize(9),
            borderWidth: 1,
            borderColor: '#D5D5D5',
            borderRadius: getScaleSize(16),
            paddingHorizontal: getScaleSize(16),
        },
        negociateButton: {
            paddingVertical: getScaleSize(10),
            paddingHorizontal: getScaleSize(20),
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: getScaleSize(8),
            backgroundColor: theme.primary,
        },
        profileContainer: {
            borderColor: '#D5D5D5',
            paddingVertical: getScaleSize(13),
            paddingHorizontal: getScaleSize(16),
            borderWidth: 1,
            borderRadius: getScaleSize(16),
            marginTop: getScaleSize(24),
        },
        likeIcon: {
            height: getScaleSize(28),
            width: getScaleSize(28),
            alignSelf: 'center',
        },
        profilePicView: {
            height: getScaleSize(56),
            width: getScaleSize(56),
            borderRadius: getScaleSize(28),
        },
        newButton: {
            flex: 1.0,
            backgroundColor: theme.primary,
            borderRadius: 8,
            height: getScaleSize(38),
            justifyContent: 'center',
            alignItems: 'center',
        },
        serviceDescriptionView: {
            marginTop: getScaleSize(12),
            borderWidth: 1,
            borderColor: theme._D5D5D5,
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 16,
        },
        imageUploadContent: {
            marginTop: getScaleSize(12),
            flexDirection: 'row',
        },
        uploadButton: {
            flex: 1.0,
            borderWidth: 1,
            borderColor: theme._818285,
            borderStyle: 'dashed',
            borderRadius: getScaleSize(8),
            justifyContent: 'center',
            alignItems: 'center',
            height: getScaleSize(160),
        },
        attachmentIcon: {
            height: getScaleSize(40),
            width: getScaleSize(40),
            alignSelf: 'center',
        },
        photosView: {
            height: getScaleSize(144),
            width: (Dimensions.get('window').width - getScaleSize(108)) / 2,
            borderRadius: 8,
            marginTop: getScaleSize(18),
            backgroundColor: theme._EAF0F3,
        },
        buttonContainer: {
            flexDirection: 'row',
            marginHorizontal: getScaleSize(22),
            marginBottom: getScaleSize(17),
        },
        backButtonContainer: {
            flex: 1.0,
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.primary,
            borderRadius: getScaleSize(12),
            paddingVertical: getScaleSize(18),
            backgroundColor: theme.white,
            marginRight: getScaleSize(8),
        },
        nextButtonContainer: {
            flex: 1.0,
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.primary,
            borderRadius: getScaleSize(12),
            paddingVertical: getScaleSize(18),
            backgroundColor: theme.primary,
            marginLeft: getScaleSize(8),
        },
        securityItemContainer: {
            paddingVertical: getScaleSize(8),
            paddingHorizontal: getScaleSize(12),
            borderRadius: getScaleSize(12),
            borderColor: '#D5D5D5',
            borderWidth: 1,
            marginTop: getScaleSize(16),
        },
        devider: {
            backgroundColor: '#E6E6E6',
            height: 1,
            marginTop: getScaleSize(18),
        },
        dotView: {
            // flex:1.0,
            borderStyle: 'dashed',
            borderColor: theme.primary,
            borderWidth: 1,
            marginTop: getScaleSize(8),
        },
        informationContainer: {
            marginTop: getScaleSize(24),
            borderWidth: 1,
            borderColor: '#D5D5D5',
            borderRadius: getScaleSize(16),
            paddingHorizontal: getScaleSize(24),
            paddingVertical: getScaleSize(24),
        },
        newHorizontalView: {
            flexDirection: 'row',
            marginTop: getScaleSize(8),
        },
    });
