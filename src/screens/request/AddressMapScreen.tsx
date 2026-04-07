import { ActivityIndicator, Alert, FlatList, Image, SafeAreaView, StatusBar, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native'
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
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [myLocation, setMyLocation] = useState<any>(null);
    const [searchText, setSearchText] = useState<string>('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [selectedPlaceObject, setSelectedPlaceObject] = useState<any>(null);
    const [selectedCoordinates, setSelectedCoordinates] = useState<any>(null);
    const GOOGLE_PLACES_API_KEY = 'AIzaSyA0izPHXGkAk0BtOqAiwNOv1mKbZSdM0xM';

    const baseAddress =
        selectedPlaceObject?.description ||
        selectedPlaceObject?.formatted_address ||
        selectedPlaceObject?.name ||
        '';

    const fetchAddressFromCoordinates = async (latitude: number, longitude: number) => {
        try {
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(geocodeUrl);
            const data = await response.json();
            const firstResult = data?.results?.[0];
            if (firstResult) {
                setSelectedPlaceObject({
                    ...firstResult,
                    description: firstResult?.formatted_address || '',
                });
                setSelectedCoordinates({ latitude, longitude });
                setSearchText(firstResult?.formatted_address || '');
            } else {
                const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                setSelectedPlaceObject({
                    description: fallbackAddress,
                    formatted_address: fallbackAddress,
                    geometry: { location: { lat: latitude, lng: longitude } },
                });
                setSelectedCoordinates({ latitude, longitude });
                setSearchText(fallbackAddress);
            }
        } catch (error) {
            console.log('Reverse geocode error:', error);
            const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setSelectedPlaceObject({
                description: fallbackAddress,
                formatted_address: fallbackAddress,
                geometry: { location: { lat: latitude, lng: longitude } },
            });
            setSelectedCoordinates({ latitude, longitude });
            setSearchText(fallbackAddress);
        }
    };

    useEffect(() => {
        Geolocation.getCurrentPosition(
            (position: any) => {
                const { latitude, longitude } = position.coords;
                setMyLocation({ latitude, longitude });
                fetchAddressFromCoordinates(latitude, longitude);
            },
            (error: any) => console.log('Location error:', error),
            {
                enableHighAccuracy: true,
            }
        );
    }, []);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const searchPlaces = async (query: string) => {
        if (query.trim().length < 2) {
            setSearchResults([]);
            setShowSearchModal(false);
            return;
        }

        try {
            setIsSearching(true);
            const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}&language=en`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            const predictions = Array.isArray(data?.predictions) ? data.predictions : [];
            setSearchResults(predictions);
            setShowSearchModal(predictions.length > 0);
        } catch (error) {
            console.log('Place search error:', error);
            setSearchResults([]);
            setShowSearchModal(false);
        } finally {
            setIsSearching(false);
        }
    };

    const onChangeSearch = (text: string) => {
        setSearchText(text);
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            searchPlaces(text);
        }, 300);
    };

    const onClearSearch = () => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        setSearchText('');
        setSearchResults([]);
        setShowSearchModal(false);
        setSelectedPlaceObject(null);
        setSelectedCoordinates(null);
    };

    const onPressSearchItem = async (item: any) => {
        try {
            setIsSearching(true);
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&key=${GOOGLE_PLACES_API_KEY}`;
            const response = await fetch(detailsUrl);
            const data = await response.json();
            const placeDetails = data?.result;
            console.log('placeDetails', placeDetails);
            if (placeDetails?.geometry?.location) {
                const { lat, lng } = placeDetails.geometry.location;
                const location = { latitude: lat, longitude: lng };
                setSelectedCoordinates(location);
                setMyLocation(location);
                mapRef.current?.animateToRegion({
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }, 500);
            }

            setSelectedPlaceObject({
                ...(placeDetails ?? {}),
                description: item?.description || placeDetails?.formatted_address || '',
                place_id: item?.place_id,
            });
            setSearchText(item?.description || '');
            setShowSearchModal(false);
        } catch (error) {
            console.log('Place details error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const openEditAddressScreen = () => {
        const addressComponents = selectedPlaceObject?.address_components || [];
        const getAddressPart = (types: string[]) =>
            addressComponents.find((component: any) =>
                types.every((type) => component.types?.includes(type))
            )?.long_name || '';

        const city =
            getAddressPart(['locality']) ||
            getAddressPart(['administrative_area_level_2']) ||
            '';
        const state = getAddressPart(['administrative_area_level_1']);
        const country = getAddressPart(['country']);
        const postalCode = getAddressPart(['postal_code']);
        const placeLat = selectedPlaceObject?.geometry?.location?.lat;
        const placeLng = selectedPlaceObject?.geometry?.location?.lng;
        const selectedLocation =
            placeLat && placeLng
                ? { latitude: placeLat, longitude: placeLng }
                : (selectedCoordinates || myLocation);

        props.navigation.navigate(SCREENS.EditAddress.identifier, {
            myLocation: selectedLocation,
            selectedPlaceObject: selectedPlaceObject,
            selectedAddress: baseAddress,
            city,
            state,
            country,
            postalCode,
            isFromAddressMap: true
        });
    };

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
                <View pointerEvents="box-none" style={styles(theme).backContainer}>
                    <TouchableOpacity style={{ marginRight: getScaleSize(12) }} onPress={() => props.navigation.goBack()}>
                        <Image
                            source={IMAGES.ic_back}
                            style={styles(theme).backIcon}
                        />
                    </TouchableOpacity>
                    <View pointerEvents="box-none" style={styles(theme).searchWrapper}>
                        <View style={styles(theme).searchContainer}>
                            <Image source={IMAGES.search} style={styles(theme).locationIcon} />
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    placeholder={STRING.search_an_area_or_address}
                                    placeholderTextColor={theme._939393}
                                    style={styles(theme).searchInput}
                                    value={searchText}
                                    onChangeText={(text) => {
                                        onChangeSearch(text);
                                    }}
                                />
                            </View>
                            {searchText?.trim()?.length > 0 && (
                                <TouchableOpacity
                                    style={styles(theme).clearIconButton}
                                    onPress={onClearSearch}>
                                    <Image source={IMAGES.ic_cancelled} style={styles(theme).clearIcon} />
                                </TouchableOpacity>
                            )}
                        </View>
                        {showSearchModal && (
                            <View
                                style={styles(theme).searchModalContainer}
                                onStartShouldSetResponder={() => true}
                                onMoveShouldSetResponder={() => true}>
                                <FlatList
                                    data={searchResults}
                                    keyExtractor={(item, index) => `${item?.place_id || index}`}
                                    keyboardShouldPersistTaps={'always'}
                                    scrollEnabled={false}
                                    nestedScrollEnabled={true}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles(theme).searchItemContainer}
                                            onPress={() => onPressSearchItem(item)}>
                                            <Text style={styles(theme).searchItemText}>
                                                {item?.description}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    ListFooterComponent={isSearching ? (
                                        <View style={styles(theme).searchLoader}>
                                            <ActivityIndicator color={theme.black} />
                                        </View>
                                    ) : null}
                                />
                            </View>
                        )}
                    </View>
                </View>

                <MapView
                    ref={mapRef}
                    pointerEvents={showSearchModal ? 'none' : 'auto'}
                    zoomEnabled={!showSearchModal}
                    zoomTapEnabled={true}
                    zoomControlEnabled={true}
                    scrollEnabled={!showSearchModal}
                    pitchEnabled={true}
                    rotateEnabled={true}
                    showsUserLocation={false}
                    showsCompass={true}
                    showsScale={true}
                    provider={PROVIDER_GOOGLE}
                    onPress={(e) => {
                        setShowSearchModal(false);
                        const { latitude, longitude } = e.nativeEvent.coordinate;
                        const next = { latitude, longitude };
                        setMyLocation(next);
                        setSelectedCoordinates(next);
                        mapRef.current?.animateToRegion(
                            {
                                ...next,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            },
                            350,
                        );
                        fetchAddressFromCoordinates(latitude, longitude);
                    }}
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
                        if (!selectedPlaceObject) {
                            Alert.alert(STRING.select_address, STRING.please_select_address);
                            return;
                        }
                        mapViewRef.current?.open();
                    }}
                />
            </View>
            <BottomSheet
                type='address_map_view'
                icon={IMAGES.pinIcon}
                bottomSheetRef={mapViewRef}
                height={getScaleSize(380)}
                description={
                    baseAddress ||
                    ''
                }
                title={STRING.confirm_your_address}
                buttonTitle={STRING.confirm_and_proceed}
                onPressButton={() => {
                    mapViewRef.current?.close();
                    setTimeout(() => {
                        openEditAddressScreen();
                    }, 200);
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
        // paddingTop: StatusBar.currentHeight
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.white,
        borderRadius: getScaleSize(24),
        paddingHorizontal: getScaleSize(12),
        borderWidth: 1,
        borderColor: theme._E6E6E6,
    },
    searchWrapper: {
        flex: 1,
        position: 'relative',
    },
    searchModalContainer: {
        position: 'absolute',
        top: getScaleSize(56),
        left: 0,
        right: 0,
        backgroundColor: theme.white,
        borderRadius: getScaleSize(16),
        borderWidth: 1,
        borderColor: theme._E6E6E6,
        zIndex: 10001,
        elevation: 9,
    },
    searchItemContainer: {
        paddingHorizontal: getScaleSize(14),
        paddingVertical: getScaleSize(12),
        borderBottomWidth: 1,
        borderBottomColor: theme._E6E6E6,
    },
    searchItemText: {
        color: theme.black,
        fontFamily: FONTS.Lato.Regular,
        fontSize: getScaleSize(14),
    },
    searchLoader: {
        paddingVertical: getScaleSize(12),
    },
    clearIconButton: {
        marginLeft: getScaleSize(8),
        padding: getScaleSize(4),
    },
    clearIcon: {
        width: getScaleSize(18),
        height: getScaleSize(18),
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