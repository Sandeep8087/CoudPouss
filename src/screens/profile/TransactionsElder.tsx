import {
    Image,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
    SectionList,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';

// CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

// COMPONENTS
import { Header, DateRangeModal, TransactionItem, Text, ProgressView } from '../../components';

// CONSTANT
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';
import { FONTS, IMAGES } from '../../assets';

// API
import { API } from '../../api';

// PACKAGES
import Tooltip from 'react-native-walkthrough-tooltip';
import moment from 'moment';

const PAGE_SIZE = 10;

export default function TransactionsElder(props: any) {
    const { theme } = useContext<any>(ThemeContext);
    const STRING = useString();

    const [visible, setVisible] = useState(false);
    const [open, setOpen] = useState(false);

    const [requestData, setRequestData] = useState<any>({
        transactionsData: [],
        page: 1,
        hasMore: true,
        isLoading: false,

        selectedStatus: { id: '1', title: 'All', value: '' },
        startDate: null,
        endDate: null,
    });

    type FetchParams = {
        reset?: boolean;
        customStatus?: any;
        customStartDate?: any;
        customEndDate?: any;
        customPage?: number;
    };

    const fetchTransactions = async ({
        reset = false,
        customStatus,
        customStartDate,
        customEndDate,
        customPage,
    }: FetchParams = {}) => {

        if (requestData.isLoading) return;

        setRequestData((prev: any) => ({ ...prev, isLoading: true }));

        try {
            const page = customPage ?? 1;
            const startDate = customStartDate ?? requestData.startDate;
            const endDate = customEndDate ?? requestData.endDate;
            const selectedStatus = customStatus ?? requestData.selectedStatus;

            console.log('selectedStatus==>', selectedStatus);

            const result: any = await API.Instance.get(
                API.API_ROUTES.fetchTransactions +
                `?section=transactions` +
                `&start_date=${startDate ? moment(startDate).format('YYYY-MM-DD') : ''}` +
                `&end_date=${endDate ? moment(endDate).format('YYYY-MM-DD') : ''}` +
                `&status=${selectedStatus?.value ?? ''}` +
                `&page=${page}` +
                `&limit=${PAGE_SIZE}`
            );

            if (result?.status) {
                const apiMonths = result?.data?.data?.months ?? [];

                const formattedSections = apiMonths.map((item: any) => ({
                    title: {
                        year: item.year,
                        month: item.month,
                        total: item.amount,
                    },
                    data: item.transactions ?? [],
                }));

                setRequestData((prev: any) => ({
                    ...prev,
                    transactions: reset
                        ? formattedSections
                        : [...prev.transactions, ...formattedSections],
                    page,
                    hasMore: apiMonths.length > 0,
                    isLoading: false,
                }));
            } else {
                SHOW_TOAST(result?.data?.message, 'error');
                setRequestData((prev: any) => ({ ...prev, isLoading: false }));
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
            setRequestData((prev: any) => ({ ...prev, isLoading: false }));
        }
    };



    useEffect(() => {
        fetchTransactions({
            reset: true,
            customStatus: requestData.selectedStatus,
            customStartDate: requestData.startDate,
            customEndDate: requestData.endDate,
            customPage: 1,
        });
    }, [
        requestData.selectedStatus,
        requestData.startDate,
        requestData.endDate,
    ]);

    useEffect(() => {
        fetchTransactions({ reset: true, customPage: 1 });
    }, []);

    useEffect(() => {
        if (requestData.page > 1) {
            fetchTransactions({
                customPage: requestData.page,
            });
        }
    }, [requestData.page]);

    const loadMore = () => {
        if (!requestData.isLoading && requestData.hasMore) {
            setRequestData((prev: any) => ({
                ...prev,
                page: prev.page + 1,
            }));
        }
    };

    const onStatusChange = (status: any) => {
        setVisible(false);

        setRequestData((prev: any) => ({
            ...prev,
            selectedStatus: status,
            page: 1,
            hasMore: true,
            transactions: [],
        }));

        fetchTransactions({
            reset: true,
            customStatus: status,
            customPage: 1,
        });
    };


    const onDateApply = (start: any, end: any) => {
        setOpen(false);

        setRequestData((prev: any) => ({
            ...prev,
            startDate: start,
            endDate: end,
            page: 1,
            hasMore: true,
            transactions: [],
        }));

        fetchTransactions({
            reset: true,
            customStartDate: start,
            customEndDate: end,
            customPage: 1,
        });
    };

    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => props.navigation.goBack()}
                screenName={STRING.transactions}
            />

            <View style={styles(theme).headerStyle}>
                <View style={styles(theme).filterView}>
                    <Text size={14} font={FONTS.Lato.Medium} color={theme._2B2B2B}>
                        {requestData.selectedStatus.title == 'All' ? 'Status' : requestData.selectedStatus.title}
                    </Text>
                    <Tooltip
                        isVisible={visible}
                        placement="bottom"
                        backgroundColor="transparent"
                        disableShadow
                        topAdjustment={-(StatusBar.currentHeight ?? 0)}
                        contentStyle={styles(theme).tooltipContent}
                        onClose={() => setVisible(false)}
                        content={
                            <View>'success', 'failed', 'pending'
                                {[
                                    { id: '1', title: 'All', value: '' },
                                    { id: '2', title: 'Success', value: 'success' },
                                    { id: '3', title: 'Failed', value: 'failed' },
                                    { id: '4', title: 'Pending', value: 'pending' },
                                ].map(item => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles(theme).dropdownItem}
                                        onPress={() => {
                                            onStatusChange(item);
                                            setVisible(false);
                                        }}
                                    >
                                        <View style={styles(theme).dropdownItemContainer}>
                                            <Text
                                                style={{ flex: 1 }}
                                                size={14}
                                                font={FONTS.Lato.SemiBold}
                                                color={requestData.selectedStatus.id == item.id ? theme.primary : theme._555555}
                                            >
                                                {item.title}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        }
                    >
                        <TouchableOpacity onPress={() => setVisible(true)}>
                            <Image source={IMAGES.ic_down} style={styles(theme).downIcon} />
                        </TouchableOpacity>
                    </Tooltip>
                </View>

                <View style={styles(theme).filterView}>
                    <Text size={14} font={FONTS.Lato.Medium} color={theme._2B2B2B}>
                        {`${requestData.startDate
                            ? new Date(requestData.startDate).toLocaleDateString()
                            : 'date'}${requestData.endDate
                                ? ' - ' + new Date(requestData.endDate).toLocaleDateString()
                                : ''
                            }`}
                    </Text>

                    <TouchableOpacity onPress={() => setOpen(true)}>
                        <Image source={IMAGES.ic_down} style={styles(theme).downIcon} />
                    </TouchableOpacity>
                </View>
            </View>

            <SectionList
                sections={requestData?.transactions ?? []}
                keyExtractor={(item, index) => index.toString()}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                renderSectionHeader={({ section }: any) => {
                    console.log('section==>', section);
                    return (
                        <View style={styles(theme).sectionHeaderContainer}>
                            <View style={{ flex: 1 }}>
                                <Text size={16} font={FONTS.Lato.Medium} color={theme._2C6587}>
                                    {section.title.year}
                                </Text>
                                <Text size={24} font={FONTS.Lato.Bold} color={theme._2C6587}>
                                    {section.title.month}
                                </Text>
                            </View>
                            <Text size={24} font={FONTS.Lato.Bold} color={theme._2C6587}>
                                {section.title.total}
                            </Text>
                        </View>
                    )
                }}
                renderItem={({ item }) => {
                    return (
                        <TransactionItem
                            item={item}
                            itemContainer={styles(theme).itemContainer}
                        />
                    )
                }}
            />

            <DateRangeModal
                visible={open}
                onClose={() => setOpen(false)}
                onApply={(start: any, end: any) => {
                    const startUTC = start
                        ? moment.utc(start).startOf('day').toISOString()
                        : null;
                    const endUTC = end
                        ? moment.utc(end).endOf('day').toISOString()
                        : null;

                    onDateApply(startUTC, endUTC);
                }}
            />
            {requestData?.isLoading && <ProgressView />}
        </View>
    );
}


const styles = (theme: ThemeContextType['theme']) => StyleSheet.create({
    container: {
        flex: 1.0,
        backgroundColor: theme.white,
    },
    headerStyle: {
        flexDirection: 'row',
        paddingLeft: getScaleSize(10),
        paddingRight: getScaleSize(22),
        marginTop: getScaleSize(11),
        marginBottom: getScaleSize(16),
    },
    filterView: {
        borderRadius: getScaleSize(4),
        borderWidth: 1,
        borderColor: theme._DCDDDD,
        paddingHorizontal: getScaleSize(16),
        paddingVertical: getScaleSize(10),
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: getScaleSize(12),
    },
    downIcon: {
        width: getScaleSize(18),
        height: getScaleSize(18),
        marginLeft: getScaleSize(10),
    },
    mainContainer: {
        flex: 1.0,
    },
    sectionHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme._EAF0F3,
        paddingVertical: getScaleSize(13),
        paddingHorizontal: getScaleSize(22),
        marginTop: getScaleSize(20),
        marginBottom: getScaleSize(12),
    },
    dateContainer: {
        flex: 1.0
    },
    itemContainer: {
        marginHorizontal: getScaleSize(22),
        marginVertical: getScaleSize(12),
    },
    tooltipContent: {
        width: getScaleSize(130),
        paddingVertical: getScaleSize(12),
        paddingHorizontal: getScaleSize(13),
        backgroundColor: '#fff',
        borderRadius: getScaleSize(6),
        elevation: getScaleSize(5),
        shadowColor: theme.black,
        shadowOffset: { width: 0, height: getScaleSize(2) },
        shadowOpacity: 0.2,
        shadowRadius: getScaleSize(4),
    },
    dropdownItem: {
        paddingVertical: getScaleSize(5),
    },
    dropdownItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',

    },
    itemIcon: {
        width: getScaleSize(20),
        height: getScaleSize(20),
        marginLeft: getScaleSize(10),
    },
    iconContainer: {

    }
})