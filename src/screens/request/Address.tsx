import { ActivityIndicator, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext, ThemeContextType } from '../../context/ThemeProvider';
import { getScaleSize } from '../../constant/scaleSize';
import { Button, Header, Text } from '../../components';
import { useString } from '../../constant/string';
import { API } from '../../api';
import { SHOW_TOAST } from '../../constant';
import { FONTS, IMAGES } from '../../assets';
import { AuthContext } from '../../context';
import { SCREENS } from '..';
import { useIsFocused } from '@react-navigation/native';

export default function Address(props: any) {
    const { theme } = useContext<any>(ThemeContext);
    const { profile, setSelectedAddress, selectedAddress } = useContext<any>(AuthContext);
    const STRING = useString();

    const [savedAddresses, setSavedAddresses] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            getSavedAddresses();
        }
    }, [isFocused]);

    async function getSavedAddresses() {
        try {
            setIsLoading(true);
            const result = await API.Instance.get(API.API_ROUTES.getSavedAddresses);
            if (result.status) {
                setSavedAddresses(result.data.data);
            } else {
                SHOW_TOAST(result.data.message, 'error');
            }
        } catch (error) {
            console.log('error', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
                screenName={STRING.saved_addresses}
            />
            <View style={{ height: getScaleSize(20) }} />
            {isLoading ? (
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                savedAddresses.length > 0 ? 
                <FlatList
                    data={savedAddresses}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles(theme).itemContainer}>
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => {
                                    setSelectedAddress(item);
                                }}
                            >
                                <Image source={selectedAddress?.id === item?.id ? IMAGES.ic_radio_select : IMAGES.ic_radio_unselect} style={styles(theme).radioSelectIcon} />
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                <Text
                                    size={getScaleSize(20)}
                                    font={FONTS.Lato.SemiBold}
                                    color={theme.black}>
                                    {profile?.user?.first_name} {profile?.user?.last_name ?? ''}
                                </Text>
                                <Text
                                    style={{ marginTop: getScaleSize(16), marginBottom: getScaleSize(12), }}
                                    size={getScaleSize(18)}
                                    font={FONTS.Lato.Regular}
                                    color={theme._555555}>
                                    {`${item.banglo}, ${item.city}, ${item.state}, ${item.postal_code}`}
                                </Text>
                                <Text
                                    size={getScaleSize(16)}
                                    font={FONTS.Lato.Bold}
                                    color={theme._2B2B2B}>
                                    {profile?.user?.phone_number}
                                </Text>
                            </View>
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => {
                                    props.navigation.navigate(SCREENS.EditAddress.identifier, {
                                        addressData: item
                                    });
                                }}
                            >
                                <Image source={IMAGES.edit} style={styles(theme).editIcon} />
                            </TouchableOpacity>
                        </View>
                    )}
                />
                :
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text size={getScaleSize(16)} font={FONTS.Lato.Regular} color={theme._555555}>No addresses found</Text>
                </View>
            )}
            <Button
                title={STRING.add_new_address}
                style={{ margin: getScaleSize(24) }}
                onPress={() => {
                    props.navigation.navigate(SCREENS.AddressMapScreen.identifier);
                }}
            />
        </View>
    )
}

const styles = (theme: ThemeContextType['theme']) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.white,
    },
    itemContainer: {
        borderWidth: 1,
        borderColor: theme._E6E6E6,
        flexDirection: 'row',
        marginHorizontal: getScaleSize(24),
        borderRadius: getScaleSize(12),
        marginBottom: getScaleSize(20),
        paddingRight: getScaleSize(12),
        paddingLeft: getScaleSize(10),
        paddingVertical: getScaleSize(12),
    },
    radioSelectIcon: {
        width: getScaleSize(40),
        height: getScaleSize(40),
        marginRight: getScaleSize(8),
    },
    editIcon: {
        width: getScaleSize(20),
        height: getScaleSize(20),
        marginLeft: getScaleSize(10),
    }
})