import { Dimensions, Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { ThemeContext, ThemeContextType } from '../../context'
import { Button, EarningsChart, Header, Text, TransactionItem } from '../../components'
import { getScaleSize, SHOW_TOAST, useString } from '../../constant'
import { FONTS, IMAGES } from '../../assets'
import { SCREENS } from '..'

//PACKAGES
import { API } from '../../api'
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function MyEarnings(props: any) {

    const insets = useSafeAreaInsets();

    const { theme } = useContext<any>(ThemeContext);
    const STRING = useString();

    const [activities, setActivities] = useState<any>([]);
    const [isLoading, setLoading] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [earningsData, setEarningsData] = useState<any>(null);

    const itemData = [
        { id: 1, title: 'Transaction Overview', onPress: SCREENS.Transactions.identifier },
        // { id: 2, title: 'Account Information', onPress: SCREENS.BankDetails.identifier },
        { id: 3, title: 'History of Withdrawals', onPress: SCREENS.WithdrawHistory.identifier },
    ]

    useEffect(() => {
        fetchActivities(new Date().toISOString().slice(0, 7));
    }, []);

    const onChange = (_: any, date?: Date) => {
        setShowPicker(false);
        if (date) {

            setSelectedDate(date);
            // Call API with new month
            const month = date.toISOString().slice(0, 7); // YYYY-MM
            fetchActivities(month);
        }
    };

    async function fetchActivities(month: string) {
        try {
            setLoading(true);
            const result: any = await API.Instance.get(API.API_ROUTES.getEarningsDashboard + `?month=${month}&transaction_page=1&transaction_limit=1`);
            if (result?.status) {
                setActivities(result?.data?.data?.activities ?? []);
                setEarningsData(result?.data?.data ?? null);
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
        <View style={[styles(theme).container,
        { paddingBottom: Platform.OS === 'android' ? insets.bottom : 0 }
        ]}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
                screenName={STRING.my_earnings}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles(theme).mainContainer}>
                    <Text
                        size={getScaleSize(17)}
                        font={FONTS.Lato.Medium}
                        align='center'
                        color={theme._0E1B2780}>
                        {STRING.available_balance}
                    </Text>
                    <Text
                        style={{ marginVertical: getScaleSize(16) }}
                        size={getScaleSize(37)}
                        font={FONTS.Lato.ExtraBold}
                        align='center'
                        color={theme._0E1B27}>
                        {`€ ${earningsData?.wallet?.total_balance ?? 0} USD`}
                    </Text>
                    <View style={styles(theme).flexView}>
                        <Image source={IMAGES.ic_increase} style={styles(theme).increaseImage} />
                        <Text
                            size={getScaleSize(16)}
                            font={FONTS.Lato.Medium}
                            color={theme._4CAF50}>
                            {`${earningsData?.increase_from_last_month?.percentage >= 0 ? '+' : '-'}${earningsData?.increase_from_last_month?.percentage ?? 0}% increase from last month`}
                        </Text>
                    </View>
                    <View style={styles(theme).chartContainer}>
                        <EarningsChart
                            data={activities}
                            onMonthPress={() => setShowPicker(true)}
                        />
                    </View>
                    <Text
                        size={getScaleSize(20)}
                        font={FONTS.Lato.SemiBold}
                        color={theme._323232}
                        style={{ marginBottom: getScaleSize(24) }}>
                        {STRING.latest_transactions}
                    </Text>
                    {earningsData?.latest_transactions?.items?.length > 0 ? (
                        <>
                            {earningsData?.latest_transactions?.items?.map((item: any, index: number) => (
                                <TransactionItem
                                    itemContainer={{ marginBottom: getScaleSize(16) }}
                                    key={index} item={item} />
                            ))}
                        </>
                    ) : (
                        <Text
                            style={{ marginBottom: getScaleSize(24) }}
                            size={getScaleSize(16)}
                            align='center'
                            font={FONTS.Lato.Medium}
                            color={theme._818285}>
                            {STRING.no_transactions_data_found ?? ''}
                        </Text>
                    )}
                    <View>
                        {itemData.map((item: any, index: number) => {
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles(theme).itemContainer}
                                    onPress={() => { props.navigation.navigate(item.onPress) }}>
                                    <Text
                                        size={getScaleSize(16)}
                                        font={FONTS.Lato.Medium}
                                        color={theme._2C6587}>
                                        {item.title}
                                    </Text>
                                    <Image source={IMAGES.ic_right} style={styles(theme).rightIcon} />
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>
            </ScrollView>
            <Button
                style={{ marginHorizontal: getScaleSize(24), marginVertical: getScaleSize(24) }}
                title={STRING.request_withdrawal}
                onPress={() => {
                    props.navigation.navigate(SCREENS.MoneyWithdrawal.identifier);
                }} />
            {showPicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode='date'
                    display='spinner'
                    onChange={onChange}
                />
            )}
        </View>
    )
}

const styles = (theme: ThemeContextType['theme']) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.white
    },
    mainContainer: {
        marginTop: getScaleSize(30),
        marginHorizontal: getScaleSize(24),
    },
    flexView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    increaseImage: {
        width: getScaleSize(19),
        height: getScaleSize(19),
        marginRight: getScaleSize(6),
    },
    chartContainer: {
        borderWidth: 1,
        borderColor: theme._DCDDDD,
        borderRadius: getScaleSize(12),
        marginVertical: getScaleSize(30),
        overflow: 'hidden',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: theme._E6E6E6,
        borderRadius: getScaleSize(12),
        padding: getScaleSize(16),
        marginVertical: getScaleSize(8),
    },
    rightIcon: {
        width: getScaleSize(24),
        height: getScaleSize(24),
        marginLeft: getScaleSize(12),
        tintColor: theme._2C6587,

    }
})