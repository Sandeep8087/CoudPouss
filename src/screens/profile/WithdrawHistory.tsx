import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//COMPONENTS
import { Header, Text } from '../../components';

//CONSTANT
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';
import { FONTS } from '../../assets';
import { API } from '../../api';
import moment from 'moment';

export default function WithdrawHistory(props: any) {
    const { theme } = useContext<any>(ThemeContext);
    const STRING = useString();

    const [isLoading, setLoading] = useState(true);
    const [withdrawHistory, setWithdrawHistory] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 10;

    useEffect(() => {
        fetchWithdrawHistory();
    }, [page]);

    async function fetchWithdrawHistory() {
        try {
            setLoading(true);
            const result: any = await API.Instance.get(API.API_ROUTES.getWithdrawHistory + `?page=${page}&limit=${PAGE_SIZE}`);
            if (result?.status) {
                const newData = result?.data?.data?.withdraw_requests ?? [];
                console.log('newData=====', newData);
                if (newData?.length < PAGE_SIZE) {
                    setHasMore(false);
                    setWithdrawHistory((prev: any) => [...prev, ...newData]);
                }
                else {
                    setWithdrawHistory((prev: any) => [...prev, ...newData]);
                }
            }
            else {
                SHOW_TOAST(result?.data?.message, 'error');
            }
        }
        catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
        } finally {
            setLoading(false);
        }
    }

    const loadMore = () => {
        if (!isLoading && hasMore) {
            setPage(page + 1);
            fetchWithdrawHistory();
        }
    }

    const getStatusColor = (status: string) => {
        if (status === 'completed') {
            return theme._00B500;
        } else if (status === 'pending') {
            return theme._FFBB4E;
        } else if (status === 'failed') {
            return theme._D32F2F;
        } else if (status === 'requested') {
            return theme._2C6587;
        } else {
            return theme._FFBB4E;
        }
    }

    const renderItem = () => {
        if (withdrawHistory?.length > 0) {
            return (
                <FlatList
                    data={withdrawHistory}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={
                        isLoading ? <ActivityIndicator size="large" color={theme.primary} style={{ margin: 20 }} /> : null
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ marginVertical: getScaleSize(24) }}
                    keyExtractor={(item: any, index: number) => index.toString()}
                    renderItem={({ item }) => {
                        return (
                            <View style={styles(theme).itemContainer}>
                                <View style={{ flex: 1.0 }}>
                                    <Text
                                        size={getScaleSize(16)}
                                        font={FONTS.Lato.Medium}
                                        color={theme._2B2B2B}
                                        style={{ marginBottom: getScaleSize(6) }}>
                                        {`€${item.amount}`}
                                    </Text>
                                    <Text
                                        size={getScaleSize(14)}
                                        font={FONTS.Lato.Medium}
                                        color={theme._818285}>
                                        {`Requested on ${moment(item.created_at).format('DD MMMM YYYY')}`}
                                    </Text>
                                </View>
                                <Text
                                    size={getScaleSize(12)}
                                    font={FONTS.Lato.Medium}
                                    color={getStatusColor(item.status)}>
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </Text>
                            </View>
                        )
                    }}
                />
            )
        } else if (isLoading) {
            return (
                <ActivityIndicator size="large" color={theme.primary} style={{ margin: 20 }} />
            )
        } else {
            return (
                <Text
                    style={{ marginTop: getScaleSize(24) }}
                    align='center'
                    size={getScaleSize(16)}
                    font={FONTS.Lato.Medium}
                    color={theme._818285}>
                    {STRING.no_data_found}
                </Text>
            )
        }
    }

    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
                screenName={STRING.withdraw_history}
            />
            {renderItem()}
        </View>
    )
}

const styles = (theme: ThemeContextType['theme']) => StyleSheet.create({
    container: {
        flex: 1.0,
        backgroundColor: theme.white,
    },
    itemContainer: {
        flexDirection: 'row',
        marginHorizontal: getScaleSize(24),
        marginBottom: getScaleSize(24),
        flex: 1.0,
    }
})