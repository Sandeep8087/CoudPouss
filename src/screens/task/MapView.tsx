import { Image, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'

// CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

// CONSTANT
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';

// COMPONENTS
import { BottomSheet, Button, Header, Text } from '../../components';

// PACKAGES
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { IMAGES } from '../../assets';
import { API } from '../../api';

export default function MapViewScreen(props: any) {

    const item = props?.route?.params?.item ?? {};
    const { theme } = useContext<any>(ThemeContext);
    const STRING = useString();
    const bottomSheetRef = useRef<any>(null);
    const mapViewRef = useRef<any>(null);
    const mapRef = useRef<MapView>(null);
    const prevStageRef = useRef<string | null>(null);
    const rejectedBottomSheetRef = useRef<any>(null);

    const confirmStartBottomSheetRef = useRef<any>(null);
    const [myLocation, setMyLocation] = useState<any>(null);
    const [isReachedClient, setIsReachedClient] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [taskStatusLastItem, setTaskStatusLastItem] = useState<any>(null);
    const [taskStatusData, setTaskStatusData] = useState<any>({});
    const [clientLocation, setClientLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    useEffect(() => {
        getTaskStatus();
    }, []);

    const intervalRef = useRef<any>(null);

    useEffect(() => {
        if (taskStatusLastItem && (taskStatusLastItem?.stage == "pending")) {
            intervalRef.current = setInterval(() => {
                getTaskStatus();
            }, 10000);
        }
        else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    }, [taskStatusLastItem]);

    useEffect(() => {
        if (!taskStatusLastItem?.stage) return;

        const currentStage = taskStatusLastItem.stage;
        const prevStage = prevStageRef.current;

        console.log('currentStage==>', currentStage);
        console.log('prevStage==>', prevStage);

        // pending ➜ accepted
        if (prevStage === 'pending' && currentStage === 'accepted') {
            confirmStartBottomSheetRef.current?.open();
        }

        if (prevStage === 'accepted' && currentStage === 'accepted') {
            confirmStartBottomSheetRef.current?.open();
        }

        // pending ➜ rejected
        if (prevStage === 'pending' && currentStage === 'rejected') {
            rejectedBottomSheetRef.current?.open();
        }

        if (prevStage === 'rejected' && currentStage === 'rejected') {
            rejectedBottomSheetRef.current?.open();
        }

        prevStageRef.current = currentStage;
    }, [taskStatusLastItem]);

    async function getTaskStatus() {
        try {
            setLoading(true);
            const result = await API.Instance.get(API.API_ROUTES.getTaskStatus + `/${item?.service_request_id}`);
            if (result.status) {
                const item = result?.data?.data ?? {}
                setTaskStatusData(item);
                console.log('getTaskStatus==>', item);
                let array = item?.task_status_timeline ?? [];
                let finalArray = array.pop();
                if (item?.lat && item?.lng) {
                    setClientLocation({
                        latitude: Number(item.lat),
                        longitude: Number(item.lng),
                    });
                }
                // ✅ IMPORTANT: initialize previous stage ONCE
                if (!prevStageRef.current && finalArray?.stage) {
                    prevStageRef.current = finalArray.stage;
                }
                setTaskStatusLastItem(finalArray);
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error');
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!mapRef.current || !myLocation || !clientLocation) return;

        mapRef.current.fitToCoordinates(
            [myLocation, clientLocation],
            {
                edgePadding: {
                    top: 80,
                    right: 80,
                    bottom: 80,
                    left: 80,
                },
                animated: true,
            }
        );
    }, [myLocation, clientLocation]);

    useEffect(() => {
        const watchId = Geolocation.watchPosition(
            position => {
                const { latitude, longitude } = position.coords;
                setMyLocation({ latitude, longitude });
            },
            error => console.log('Location error:', error),
            {
                enableHighAccuracy: true,
                distanceFilter: 5, // har 5 meter par update
            }
        );

        return () => {
            Geolocation.clearWatch(watchId);
        };
    }, []);

    useEffect(() => {
        if (!myLocation || !clientLocation || isReachedClient) return;

        const distance = getDistanceInMeters(
            myLocation.latitude,
            myLocation.longitude,
            clientLocation.latitude,
            clientLocation.longitude,
        );

        console.log('Client distance:', distance);

        if (distance <= 400000000) { // ✅ 40 meters (recommended)
            setIsReachedClient(true);
        }
    }, [myLocation, clientLocation]);

    const getDistanceInMeters = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ) => {
        const toRad = (value: number) => (value * Math.PI) / 180;

        const R = 6371000; // meters
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const onProceedFurther = async (isRejected: boolean = false) => {
        try {
            setLoading(true);
            const result = await API.Instance.post(API.API_ROUTES.onProceedFurther + `/${item?.service_request_id}`);
            if (result.status) {
                SHOW_TOAST(result?.data?.message ?? '', 'success')
                getTaskStatus();
                if (isRejected) {
                    rejectedBottomSheetRef?.current?.close();
                } else {
                    bottomSheetRef.current?.close();
                }
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error')
            }
        } catch (error: any) {
            console.log('error', error)
            SHOW_TOAST(error?.message ?? '', 'error')
        } finally {
            setLoading(false);
        }
    }

    const onVerifySecurityCode = async () => {
        try {
            setLoading(true);
            const result = await API.Instance.post(API.API_ROUTES.onVerifySecurityCode + `/${item?.service_request_id}`);
            if (result.status) {
                mapViewRef.current?.open();
                props.navigation.goBack()
            }
        } catch (error: any) {
            console.log('error', error)
            SHOW_TOAST(error?.message ?? '', 'error')
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles(theme).container}>
            <View style={styles(theme).statusBarContainer}>
                <StatusBar
                    translucent={true}
                    backgroundColor={'transparent'}
                    barStyle={'dark-content'} />
            </View>
            <SafeAreaView />
            <View style={styles(theme).mapViewContainer}>
                <TouchableOpacity style={styles(theme).backContainer} onPress={() => props.navigation.goBack()}>
                    <Image
                        source={IMAGES.ic_back}
                        style={styles(theme).backIcon}
                    />
                </TouchableOpacity>
                <MapView
                    ref={mapRef}
                    zoomEnabled={true}
                    zoomTapEnabled={true}
                    zoomControlEnabled={true}
                    scrollEnabled={true}
                    pitchEnabled={true}
                    rotateEnabled={true}
                    showsUserLocation={true}
                    showsCompass={true}
                    showsScale={true}
                    provider={PROVIDER_GOOGLE}
                    style={{ flex: 1, width: '100%', height: '100%' }}
                    initialRegion={
                        myLocation
                            ? {
                                latitude: myLocation.latitude,
                                longitude: myLocation.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }
                            : undefined
                    } >
                    {/* Client Location */}
                    {clientLocation && (
                        <Marker
                            coordinate={clientLocation}
                            title="Client Location"
                            pinColor="red"
                        />
                    )}

                    {/* My Location */}
                    {myLocation && (
                        <Marker
                            coordinate={myLocation}
                            title="My Location"
                            pinColor="blue"
                        />
                    )}

                    {/* Optional: Line between both */}
                    {/* {myLocation && (
                        <Polyline
                            coordinates={[myLocation, CLIENT_LOCATION]}
                            strokeWidth={4}
                            strokeColor="#2F80ED"
                        />
                    )} */}
                </MapView>

            </View>
            {isReachedClient && (
                <Button
                    style={{ position: 'absolute', bottom: getScaleSize(16), left: getScaleSize(24), right: getScaleSize(100) }}
                    title={taskStatusLastItem?.stage == "accepted" ? STRING.show_security_code : STRING.reached_client_location}
                    onPress={() => {
                        if (taskStatusLastItem?.stage == "accepted") {
                            mapViewRef.current?.open();
                        } else {
                            bottomSheetRef.current?.open();
                        }
                    }}
                />
            )
            }
            <BottomSheet
                type='out_of_service'
                bottomSheetRef={bottomSheetRef}
                height={getScaleSize(330)}
                image={IMAGES.location_map}
                title={STRING.we_have_detected_that_you_are_at_your_clients_address_do_you_confirm_the_start_of_the_service}
                buttonTitle={STRING.proceed}
                onPressButton={() => {
                    onProceedFurther()
                }}
            />
            <BottomSheet
                type='out_of_service'
                // isNotCloseable={true}
                image={IMAGES.ic_alart}
                bottomSheetRef={rejectedBottomSheetRef}
                height={getScaleSize(330)}
                title={STRING.the_client_has_rejected_your_initial_request_please_resend_it_or_check_your_map_for_accurate_location_detection}
                secondButtonTitle={STRING.detect}
                buttonTitle={STRING.resend_request}
                onPressSecondButton={() => {
                    rejectedBottomSheetRef?.current?.close();
                }}
                onPressButton={() => {
                    onProceedFurther(true)
                }}
            />
            <BottomSheet
                type='out_of_service'
                isNotCloseable={true}
                image={IMAGES.ic_like}
                bottomSheetRef={confirmStartBottomSheetRef}
                height={getScaleSize(330)}
                title={STRING.the_client_has_confirmed_your_arrival_you_can_now_proceed_to_start_the_service_at_the_specified_location}
                buttonTitle={STRING.proceed}
                onPressButton={() => {
                    mapViewRef?.current?.open();
                }}
            />
            <BottomSheet
                type='map_view'
                icon={IMAGES.pinIcon}
                isNotCloseable={true}
                bottomSheetRef={mapViewRef}
                height={getScaleSize(560)}
                description={STRING.security_code_text}
                title={STRING.we_have_detected_that_you_are_at_your_clients_address_do_you_confirm_the_start_of_the_service}
                buttonTitle={STRING.Yes}
                secondButtonTitle={STRING.No}
                security_Code={taskStatusData?.displayed_service_code?.replace(/\*/g, '') ?? '0'}
                onPressSecondButton={() => {
                    mapViewRef.current?.close();
                }}
                onPressButton={() => {
                    if (taskStatusLastItem?.stage == "accepted") {
                        onVerifySecurityCode()
                    }
                    else {
                        mapViewRef.current?.close();
                    }
                }}
            />
        </View >
    )
}

const styles = (theme: ThemeContextType['theme']) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.white
    },
    mapViewContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    statusBarContainer: {
        // paddingTop: StatusBar.currentHeight
    },
    backIcon: {
        width: getScaleSize(40),
        height: getScaleSize(40),
    },
    backContainer: {
        position: 'absolute',
        top: getScaleSize(16),
        left: getScaleSize(16),
        zIndex: 100000000000,
    },

})