import { Image, SafeAreaView, StatusBar, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { ThemeContext, ThemeContextType } from '../../context/ThemeProvider';
import { useString } from '../../constant/string';
import { FONTS, IMAGES } from '../../assets';
// PACKAGES
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { getScaleSize } from '../../constant/scaleSize';
import { BottomSheet, Button } from '../../components';
import { SCREENS } from '..';

export default function AddressMapScreen(props: any) {
    const { theme } = useContext<any>(ThemeContext);
    const STRING = useString();
    const mapRef = useRef<MapView>(null);
    const mapViewRef = useRef<any>(null);

    const [myLocation, setMyLocation] = useState<any>(null);
    const [searchText, setSearchText] = useState<string>('');

    useEffect(() => {
        Geolocation.getCurrentPosition(
            (position: any) => {
                const { latitude, longitude } = position.coords;
                setMyLocation({ latitude, longitude });
            },
            (error: any) => console.log('Location error:', error),
            {
                enableHighAccuracy: true,
            }
        );
    }, []);

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
                <View style={styles(theme).backContainer}>
                    <TouchableOpacity style={{ marginRight: getScaleSize(12) }} onPress={() => props.navigation.goBack()}>
                        <Image
                            source={IMAGES.ic_back}
                            style={styles(theme).backIcon}
                        />
                    </TouchableOpacity>
                    <View style={styles(theme).searchContainer}>
                        <Image source={IMAGES.search} style={styles(theme).locationIcon} />
                        <View style={{ flex: 1 }}>
                            <TextInput
                                placeholder={STRING.search_an_area_or_address}
                                placeholderTextColor={theme._939393}
                                style={styles(theme).searchInput}
                                value={searchText}
                                onChangeText={(text) => {
                                    setSearchText(text);
                                }}
                            />
                        </View>
                    </View>
                </View>

                <MapView
                    ref={mapRef}
                    zoomEnabled={true}
                    zoomTapEnabled={true}
                    zoomControlEnabled={true}
                    scrollEnabled={true}
                    pitchEnabled={true}
                    rotateEnabled={true}
                    showsUserLocation={false}
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
                    {/* {clientLocation && (
                        <Marker
                            coordinate={clientLocation}
                            title="Client Location"
                            pinColor="red"
                        />
                    )} */}


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
                <Button
                    style={{ position: 'absolute', bottom: getScaleSize(16), left: getScaleSize(24), right: getScaleSize(100) }}
                    title={STRING.proceed}
                    onPress={() => {
                        mapViewRef.current?.open();
                    }}
                />
            </View>
            <BottomSheet
                type='address_map_view'
                icon={IMAGES.pinIcon}
                bottomSheetRef={mapViewRef}
                height={getScaleSize(350)}
                description={'4517 Washington Ave. Manchester, Kentucky 39495'}
                title={STRING.confirm_your_address}
                buttonTitle={STRING.confirm_and_proceed}
                secondButtonTitle={STRING.edit}
                onPressSecondButton={() => {
                    setTimeout(() => {
                        mapViewRef.current?.close();
                    }, 200);
                    props.navigation.navigate(SCREENS.EditAddress.identifier, {
                        myLocation: myLocation,
                        isFromAddressMap: true
                    });
                }}
                onPressButton={() => {
                    mapViewRef.current?.close();
                }}
            />
        </View>
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
        paddingTop: StatusBar.currentHeight
    },
    backIcon: {
        width: getScaleSize(48),
        height: getScaleSize(48),
    },
    backContainer: {
        position: 'absolute',
        top: getScaleSize(16),
        left: getScaleSize(16),
        right: getScaleSize(24),
        zIndex: 10000,
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    locationIcon: {
        width: getScaleSize(20),
        height: getScaleSize(20),
    },
    searchInput: {
        marginLeft: getScaleSize(12),
        fontSize: getScaleSize(20),
        fontFamily: FONTS.Lato.Regular,
        color: theme._939393,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.white,
        borderRadius: getScaleSize(24),
        paddingHorizontal: getScaleSize(12),
        borderWidth: 1,
        borderColor: theme._E6E6E6,
    },
    myLocationButton: {
        position: 'absolute',
        right: getScaleSize(16),
        left: getScaleSize(16),
        top: getScaleSize(16),
        bottom: getScaleSize(500),
        backgroundColor: theme.white,
        width: getScaleSize(48),
        height: getScaleSize(48),
        borderRadius: getScaleSize(24),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
})