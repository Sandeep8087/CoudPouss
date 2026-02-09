import { Image, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'

//COMPONENTS
import { Button, Header, Input, Text } from '../../components';

//CONSTANTS & ASSETS
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';
import { SCREENS } from '..';
import { API } from '../../api';

export default function MoneyWithdrawal(props: any) {

    const { theme } = useContext<any>(ThemeContext);
    const STRING = useString();

    const [amount, setAmount] = useState('');
    const [amountError, setAmountError] = useState('');
    const [visiblePaymentMethod, setVisiblePaymentMethod] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [myWalletBalance, setMyWalletBalance] = useState<any>(null);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyWalletBalance();
    }, []);

    async function fetchMyWalletBalance() {
        try {
            setLoading(true);
            const result: any = await API.Instance.get(API.API_ROUTES.getMyWalletBalance);
            if (result?.status) {
                console.log('result=====', result);
                setMyWalletBalance(result?.data?.data ?? '');
            }
            else {
                SHOW_TOAST(result?.data?.message, 'error');
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
                screenName={STRING.money_withdrawal}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles(theme).mainContainer}>
                    <Text
                        size={getScaleSize(16)}
                        font={FONTS.Lato.Medium}
                        color={theme._0E1B2780}
                        align="center"
                        style={{ marginBottom: getScaleSize(16) }}>
                        {STRING.available_balance}
                    </Text>
                    <Text
                        size={getScaleSize(37)}
                        font={FONTS.Lato.ExtraBold}
                        color={theme._0E1B27}
                        align="center"
                        style={{ marginBottom: getScaleSize(36) }}>
                        {myWalletBalance?.balance ? `€${myWalletBalance?.balance}` : '€0.00'}
                    </Text>
                    <Input
                        placeholder={STRING.specify_amount_to_transfer}
                        placeholderTextColor={theme._939393}
                        inputTitle={STRING.funds_transfer}
                        inputColor={true}
                        continerStyle={{ marginBottom: getScaleSize(16) }}
                        value={amount}
                        onChangeText={text => {
                            setAmount(text);
                            setAmountError('');
                        }}
                        isError={amountError}
                    />
                    {/* <Text
                        size={getScaleSize(17)}
                        font={FONTS.Lato.Medium}
                        color={theme._424242}
                        style={{ marginBottom: getScaleSize(8) }}>
                        {STRING.transfer_to}
                    </Text> */}
                    {/* <View style={[styles(theme).transferToContainer, { padding: visiblePaymentMethod ? getScaleSize(24) : getScaleSize(17) }]}>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => {
                                setVisiblePaymentMethod(!visiblePaymentMethod);
                            }}>
                            {selectedPaymentMethod ? (
                                <Text
                                    size={getScaleSize(16)}
                                    font={FONTS.Lato.Medium}
                                    color={theme._323232}
                                    style={{ flex: 1.0 }}>
                                    {selectedPaymentMethod}
                                </Text>
                            ) : (
                                <Text
                                    size={getScaleSize(16)}
                                    font={FONTS.Lato.Medium}
                                    color={theme._939393}
                                    style={{ flex: 1.0 }}>
                                    {STRING.select_payment_method}
                                </Text>
                            )}
                            <Image
                                source={visiblePaymentMethod ? IMAGES.ic_up : IMAGES.ic_down}
                                style={styles(theme).downIcon}
                                resizeMode={'contain'}
                            />
                        </TouchableOpacity>
                        {visiblePaymentMethod && (
                            <View style={styles(theme).selectedView}>
                                <View style={styles(theme).divider} />
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedPaymentMethod(STRING.savings_account);
                                    }}
                                    style={styles(theme).bankDetailsContainer}>
                                    <View style={[styles(theme).headerView, {
                                        borderBottomWidth: 1,
                                        borderColor: theme._E6E6E6,
                                        paddingBottom: getScaleSize(6),
                                    }]}>
                                        <Text
                                            size={getScaleSize(16)}
                                            font={FONTS.Lato.Medium}
                                            color={theme._2C6587}>
                                            {STRING.savings_account}
                                        </Text>
                                        <Image
                                            source={selectedPaymentMethod === STRING.savings_account ? IMAGES.ic_radio_select : IMAGES.ic_radio_unselect}
                                            style={styles(theme).selectedIcon} />
                                    </View>
                                    <View style={styles(theme).flexView}>
                                        <Text
                                            size={getScaleSize(14)}
                                            font={FONTS.Lato.Medium}
                                            color={theme._595959}>
                                            {STRING.account_holder_name}
                                        </Text>
                                        <Text
                                            size={getScaleSize(16)}
                                            font={FONTS.Lato.Medium}
                                            color={theme._595959}>
                                            {'John Doe'}
                                        </Text>
                                    </View>
                                    <View style={styles(theme).flexView}>
                                        <Text
                                            size={getScaleSize(14)}
                                            font={FONTS.Lato.Medium}
                                            color={theme._595959}>
                                            {STRING.account_number}
                                        </Text>
                                        <Text
                                            size={getScaleSize(16)}
                                            font={FONTS.Lato.Medium}
                                            color={theme._595959}>
                                            {'1234567890'}
                                        </Text>
                                    </View>
                                    <View style={styles(theme).flexView}>
                                        <Text
                                            size={getScaleSize(14)}
                                            font={FONTS.Lato.Medium}
                                            color={theme._595959}>
                                            {STRING.ifsc_code}
                                        </Text>
                                        <Text
                                            size={getScaleSize(16)}
                                            font={FONTS.Lato.Medium}
                                            color={theme._595959}>
                                            {'GB29 NW 9268 19'}
                                        </Text>
                                    </View>
                                    <View style={styles(theme).flexView}>
                                        <Text
                                            size={getScaleSize(14)}
                                            font={FONTS.Lato.Medium}
                                            color={theme._595959}>
                                            {STRING.bank_name}
                                        </Text>
                                        <Text
                                            size={getScaleSize(16)}
                                            font={FONTS.Lato.Medium}
                                            color={theme._595959}>
                                            {'Global Trust Bank'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedPaymentMethod(STRING.google_pay);
                                    }}
                                    style={[styles(theme).bankDetailsContainer, { marginTop: getScaleSize(20) }]}>
                                    <View style={styles(theme).headerView}>
                                        <Text
                                            size={getScaleSize(16)}
                                            font={FONTS.Lato.Medium}
                                            color={theme._2C6587}>
                                            {STRING.google_pay}
                                        </Text>
                                        <Image
                                            source={selectedPaymentMethod === STRING.google_pay ? IMAGES.ic_radio_select : IMAGES.ic_radio_unselect}
                                            style={styles(theme).selectedIcon} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View> */}
                    <Button
                        title={STRING.request_withdrawal}
                        style={{ marginTop: visiblePaymentMethod ? getScaleSize(24) : getScaleSize(40) }}
                        onPress={() => {
                            props.navigation.navigate(SCREENS.AccountCreatedSuccessfully.identifier,{
                                isWithdrawal: true,
                            });
                        }}
                    />
                </View>
            </ScrollView >
        </View >
    )
}

const styles = (theme: ThemeContextType['theme']) => StyleSheet.create({
    container: {
        flex: 1.0,
        backgroundColor: theme.white,
    },
    mainContainer: {
        flex: 1.0,
        marginHorizontal: getScaleSize(24),
        marginTop: getScaleSize(36),
    },
    transferToContainer: {
        borderWidth: 1,
        borderColor: theme._DBE0E5,
        borderRadius: getScaleSize(12),
    },
    flexView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: getScaleSize(16),
    },
    downIcon: {
        width: getScaleSize(24),
        height: getScaleSize(24),
        tintColor: theme._2C6587,
    },
    bankDetailsContainer: {
        borderWidth: 1,
        borderColor: theme._DBE0E5,
        borderRadius: getScaleSize(12),
        padding: getScaleSize(17),

    },
    selectedView: {
        marginTop: getScaleSize(16),
    },
    divider: {
        height: 1,
        backgroundColor: theme._E6E6E6,
        marginBottom: getScaleSize(20),
    },
    headerView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectedIcon: {
        width: getScaleSize(36),
        height: getScaleSize(36),
    }
})