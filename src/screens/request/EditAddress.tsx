import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, REGEX, SHOW_TOAST, Storage, useString } from '../../constant';

//SCREENS
import { SCREENS } from '..';

//COMPONENTS
import {
    Header,
    Input,
    Text,
    Button,
    ProgressView,
} from '../../components';
import { API } from '../../api';

export default function EditAddress(props: any) {

    const STRING = useString();
    const { theme } = useContext<any>(ThemeContext);

    const addressData = props?.route?.params?.addressData || {};
    const myLocationData = props?.route?.params?.myLocation ?? ''
    const isFromAddressMap = props?.route?.params?.isFromAddressMap ?? false;
    const selectedAddress = props?.route?.params?.selectedAddress ?? '';
    const selectedCity = props?.route?.params?.city ?? '';
    const selectedState = props?.route?.params?.state ?? '';
    const selectedCountry = props?.route?.params?.country ?? '';
    const selectedPostalCode = props?.route?.params?.postalCode ?? '';

    const [isLoading, setLoading] = useState<boolean>(false);

    const inputHeight = Platform.OS == 'ios' ? getScaleSize(56) : getScaleSize(56)

    const [address, setAddress] = useState<string>('');
    const [houseFlatNumber, setHouseFlatNumber] = useState<string>('');
    const [addressError, setAddressError] = useState<string>('');
    const [addressHeight, setAddressHeight] = useState(inputHeight);
    const [city, setCity] = useState<string>('Surat');
    const [cityError, setCityError] = useState<string>('');
    const [state, setState] = useState<string>('Gujrat');
    const [stateError, setStateError] = useState<string>('');
    const [country, setCountry] = useState<string>('India');
    const [countryError, setCountryError] = useState<string>('');
    const [postalCode, setPostalCode] = useState<string>('123456');
    const [postalCodeError, setPostalCodeError] = useState<string>('');
    const [myLocation, setMyLocation] = useState<any>(null);

    const splitBangloAddress = (fullAddress: string) => {
        const value = fullAddress?.trim() || '';
        if (!value) {
            return { houseFlat: '', line1: '' };
        }
        const parts = value.split(',').map((item) => item.trim()).filter(Boolean);
        if (parts.length <= 1) {
            return { houseFlat: '', line1: value };
        }
        return {
            houseFlat: (parts[0] || '').replace(/,/g, '').trim(),
            line1: parts.slice(1).join(', ')
        };
    };


    useEffect(() => {
        if (addressData) {
            const parsed = splitBangloAddress(addressData.banglo || '');
            setHouseFlatNumber(parsed.houseFlat);
            setAddress(parsed.line1);
            setCity(addressData.city);
            setState(addressData.state);
            setCountry(addressData.country);
            setPostalCode(addressData.postal_code);
            setMyLocation({ latitude: addressData.latitude, longitude: addressData.longitude });
        }
    }, []);

    useEffect(() => {
        if (isFromAddressMap) {
            setHouseFlatNumber('');
            setAddress(selectedAddress || '');
            setCity(selectedCity || 'Surat');
            setState(selectedState || 'Gujrat');
            setCountry(selectedCountry || 'India');
            setPostalCode(selectedPostalCode || '123456');
            if (myLocationData?.latitude && myLocationData?.longitude) {
                setMyLocation({ latitude: myLocationData.latitude, longitude: myLocationData.longitude });
            }
        }
    }, [isFromAddressMap, selectedAddress, selectedCity, selectedState, selectedCountry, selectedPostalCode, myLocationData]);

    useEffect(() => {
        const hasExplicitNewLine = address?.includes('\n');
        const shouldUseTwoLines = hasExplicitNewLine || (address?.trim()?.length ?? 0) > 45;
        setAddressHeight(shouldUseTwoLines ? getScaleSize(84) : inputHeight);
    }, [address]);

    const getBangloAddress = () => {
        const cleanHouseFlatNumber = (houseFlatNumber || '').replace(/,/g, '').trim();
        return [
            cleanHouseFlatNumber,
            address?.trim() || ''
        ].filter(Boolean).join(', ');
    };

    async function onUpdateAddress() {
        if (!address) {
            setAddressError('Please enter address');
            return;
        }
        setLoading(true);
        try {
            const bangloAddress = getBangloAddress();
            const params = {
                "banglo": bangloAddress,
                "city": city,
                "state": state,
                "country": country,
                "postal_code": postalCode,
                "latitude": myLocation.latitude,
                "longitude": myLocation.longitude
            }
            const result = await API.Instance.put(API.API_ROUTES.onUpdateAddress + '/' + addressData.id, params);
            if (result.status) {
                SHOW_TOAST(result?.data?.message, 'success');
                console.log('result', result);
                props.navigation.goBack();
            } else {
                SHOW_TOAST(result?.data?.message, 'error');
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
            return null;
        } finally {
            setLoading(false);
        }
    }

    async function onEditAddress() {
        if (!address) {
            setAddressError('Please enter address');
            return;
        } else {
            try {
                const bangloAddress = getBangloAddress();
                const params = {
                    "banglo": bangloAddress,
                    "city": city,
                    "state": state,
                    "country": country,
                    "postal_code": postalCode,
                    "latitude": myLocation.latitude,
                    "longitude": myLocation.longitude
                }

                setLoading(true);
                const result = await API.Instance.post(API.API_ROUTES.onCreateAddress, params);
                if (result.status) {
                    SHOW_TOAST(result?.data?.message, 'success');

                    props.navigation.goBack();
                    props.navigation.goBack();
                } else {
                    SHOW_TOAST(result?.data?.message, 'error');
                    console.log('ERR', result?.data?.message);
                }
            } catch (error: any) {
                SHOW_TOAST(error?.message ?? '', 'error');
                return null;
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
                screenName={STRING.edit_address}
            />
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={styles(theme).mainContainer}>
                    <Input
                        placeholder={STRING.house_flat_number}
                        placeholderTextColor={theme._939393}
                        inputTitle={STRING.house_flat_number}
                        inputColor={true}
                        value={houseFlatNumber}
                        continerStyle={{ marginBottom: getScaleSize(16) }}
                        onChangeText={text => {
                            setHouseFlatNumber((text || '').replace(/,/g, ''));
                        }}
                    />
                    <Input
                        placeholder={STRING.enter_address}
                        placeholderTextColor={theme._939393}
                        inputTitle={STRING.address_line_1}
                        inputColor={true}
                        value={address}
                        editable={false}
                        maxLength={250}
                        multiline={true}
                        numberOfLines={2}
                        onContentSizeChange={(e) => {
                            const newHeight = e.nativeEvent.contentSize.height;
                            setAddressHeight(
                                Math.min(getScaleSize(84), Math.max(inputHeight, newHeight))
                            );
                        }}
                        inputContainer={{
                            maxHeight: getScaleSize(84),
                            height: addressHeight,
                            minHeight: inputHeight,
                        }}
                        continerStyle={{ marginBottom: getScaleSize(16) }}
                        isError={addressError}
                    />
                    <Input
                        placeholder={STRING.city}
                        placeholderTextColor={theme._939393}
                        inputTitle={STRING.city}
                        inputColor={true}
                        editable={false}
                        continerStyle={{ marginBottom: getScaleSize(16) }}
                        value={city}
                        onChangeText={text => {
                            setCity(text);
                            setCityError('');
                        }}
                        isError={cityError}
                    />
                    <Input
                        placeholder={STRING.state}
                        placeholderTextColor={theme._939393}
                        inputTitle={STRING.state}
                        inputColor={true}
                        continerStyle={{ marginBottom: getScaleSize(16) }}
                        value={state}
                        editable={false}
                        onChangeText={text => {
                            setState(text);
                            setStateError('');
                        }}
                        isError={stateError}
                    />
                    <Input
                        placeholder={STRING.country}
                        placeholderTextColor={theme._939393}
                        inputTitle={STRING.country}
                        inputColor={true}
                        continerStyle={{ marginBottom: getScaleSize(16) }}
                        value={country}
                        editable={false}
                        onChangeText={text => {
                            setCountry(text);
                            setCountryError('');
                        }}
                        isError={countryError}
                    />
                    <Input
                        placeholder={STRING.postal_code}
                        placeholderTextColor={theme._939393}
                        inputTitle={STRING.postal_code}
                        inputColor={true}
                        continerStyle={{ marginBottom: getScaleSize(16) }}
                        value={postalCode}
                        editable={false}
                        onChangeText={text => {
                            setPostalCode(text);
                            setPostalCodeError('');
                        }}
                        isError={postalCodeError}
                    />

                </View>
            </ScrollView>
            <Button
                title={STRING.save_address}
                style={{
                    marginVertical: getScaleSize(24),
                    marginHorizontal: getScaleSize(24),  
                }}
                onPress={() => {
                    if (isFromAddressMap) {
                        onEditAddress();
                    }
                    else {
                        onUpdateAddress();
                    }
                }}
            />
            {/* <SafeAreaView /> */}
            {isLoading && <ProgressView />}
        </View>
    );
}

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.white,
            flex: 1.0,
        },
        mainContainer: {
            flex: 1.0,
            marginHorizontal: getScaleSize(24),
            marginVertical: getScaleSize(18),
            // justifyContent: 'center',
        },
        imageContainer: {
            alignItems: 'center',
            marginTop: getScaleSize(20),
            marginBottom: getScaleSize(16),
        },
        image: {
            backgroundColor: theme._F0EFF0,
            width: getScaleSize(126),
            height: getScaleSize(126),
            borderRadius: getScaleSize(126),
            marginBottom: getScaleSize(12),
            alignItems: 'center',
            justifyContent: 'center',
        },
    });
