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
import { Header, DateRangeModal, TransactionItem, Text } from '../../components';

// CONSTANT
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';
import { FONTS, IMAGES } from '../../assets';

// API
import { API } from '../../api';

// PACKAGES
import Tooltip from 'react-native-walkthrough-tooltip';
import moment from 'moment';

const PAGE_SIZE = 10;

export default function Transactions(props: any) {
    const { theme } = useContext<any>(ThemeContext);
    const STRING = useString();

    const [visible, setVisible] = useState(false);
    const [open, setOpen] = useState(false);

    /** 🔥 SINGLE COMMON STATE */
    const [requestData, setRequestData] = useState<any>({
        transactions: [],
        page: 1,
        hasMore: true,
        isLoading: false,

        selectedStatus: { id: '1', title: 'All', value: '' },
        startDate: null,
        endDate: null,
    });

    /* ================= API ================= */

    const fetchTransactions = async ({ reset = false } = {}) => {
        if (requestData.isLoading) return;

        setRequestData((prev: any) => ({ ...prev, isLoading: true }));

        try {
            const { page, startDate, endDate, selectedStatus } = requestData;

            const result: any = await API.Instance.get(
                API.API_ROUTES.getProviderTransactions +
                `?start_date=${startDate ? moment(startDate).format('YYYY-MM-DD') : ''}` +
                `&end_date=${endDate ? moment(endDate).format('YYYY-MM-DD') : ''}` +
                `&status=${requestData?.selectedStatus?.value == 'all' ? '' : requestData?.selectedStatus?.value}` +
                `&page=${page}` +
                `&limit=${PAGE_SIZE}`
            );

            if (result?.status) {
                const newData = result?.data?.data?.months ?? [];

                setRequestData((prev: any) => ({
                    ...prev,
                    transactions: reset ? newData : [...prev.transactions, ...newData],
                    hasMore: newData.length === PAGE_SIZE,
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

    /* ============== INITIAL LOAD ============== */
    useEffect(() => {
        fetchTransactions({ reset: true });
    }, []);

    /* ============== PAGINATION ============== */
    useEffect(() => {
        if (requestData.page > 1) {
            fetchTransactions();
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

    /* ============== FILTER HANDLERS ============== */

    const onStatusChange = (status: any) => {
        setRequestData((prev: any) => ({
            ...prev,
            selectedStatus: status,
            page: 1,
            hasMore: true,
            transactions: [],
        }));

        setVisible(false);
        fetchTransactions({ reset: true });
    };

    const onDateApply = (start: any, end: any) => {
        setRequestData((prev: any) => ({
            ...prev,
            startDate: start,
            endDate: end,
            page: 1,
            hasMore: true,
            transactions: [],
        }));

        setOpen(false);
        fetchTransactions({ reset: true });
    };

    /* ================= UI ================= */

    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => props.navigation.goBack()}
                screenName={STRING.transactions}
            />

            {/* FILTER HEADER */}
            <View style={styles(theme).headerStyle}>
                {/* STATUS FILTER */}
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
                            <>
                                {[
                                    { id: '1', title: 'All', value: '' },
                                    { id: '2', title: 'Completed', value: 'completed' },
                                    { id: '3', title: 'Pending', value: 'pending'},
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
                            </>
                        }
                    >
                        <TouchableOpacity onPress={() => setVisible(true)}>
                            <Image source={IMAGES.ic_down} style={styles(theme).downIcon} />
                        </TouchableOpacity>
                    </Tooltip>
                </View>

                {/* DATE FILTER */}
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

            {/* LIST */}
            <SectionList
                sections={requestData.transactions}
                keyExtractor={(item, index) => index.toString()}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                renderSectionHeader={({ section }: any) => (
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
                )}
                renderItem={({ item }) => (
                    <TransactionItem
                        item={item}
                        itemContainer={styles(theme).itemContainer}
                    />
                )}
            />

            {/* DATE MODAL */}
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