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

    const [isLoading, setLoading] = useState<boolean>(false);

    const inputHeight = Platform.OS == 'ios' ? getScaleSize(56) : getScaleSize(56)

    const [address, setAddress] = useState<string>('');
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


    useEffect(() => {
        if (addressData) {
            setAddress(addressData.banglo);
            setCity(addressData.city);
            setState(addressData.state);
            setCountry(addressData.country);
            setPostalCode(addressData.postal_code);
            setMyLocation({ latitude: addressData.latitude, longitude: addressData.longitude });
        }
    }, []);

    useEffect(() => {
        if (isFromAddressMap) {
            setCity('Surat')
            setState('Gujrat')
            setCountry('India')
            setPostalCode('123456')
            setMyLocation({latitude: myLocationData.latitude, longitude: myLocationData.longitude});
        }
    }, [isFromAddressMap]);

    async function onUpdateAddress() {
        if (!address) {
            setAddressError('Please enter address');
            return;
        }
        setLoading(true);
        try {
            const params = {
                "banglo": address,
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
            }else{
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
                const params = {
                    "banglo": address,
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
                        placeholder={STRING.enter_address}
                        placeholderTextColor={theme._939393}
                        inputTitle={STRING.address_line_1}
                        inputColor={true}
                        value={address}
                        maxLength={250}
                        multiline={true}
                        numberOfLines={10}
                        onContentSizeChange={(e) => {
                            const newHeight = e.nativeEvent.contentSize.height;
                            setAddressHeight(
                                Math.min(getScaleSize(200), Math.max(inputHeight, newHeight))
                            );
                        }}
                        inputContainer={{
                            maxHeight: getScaleSize(200),
                            height: addressHeight,
                            minHeight: inputHeight,
                        }}
                        continerStyle={{ marginBottom: getScaleSize(16) }}
                        onChangeText={text => {
                            setAddress(text);
                            setAddressError('');
                        }}
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
                    if (addressData) {
                        onUpdateAddress();
                    }
                    else {
                        onEditAddress();
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
