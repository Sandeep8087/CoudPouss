import {
    Image,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
    SectionList,
    Platform,
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
  
  /* ================= HELPERS ================= */
  
  // API months → flat transactions
  const normalizeTransactions = (months: any[]) => {
    return months.flatMap((m: any) =>
      (m.transactions || []).map((t: any) => ({
        ...t,
        __year: m.year,
        __month: m.month,
      }))
    );
  };
  
  // flat → SectionList (month-wise)
  const groupByMonth = (transactions: any[]) => {
    const map = new Map();
  
    transactions.forEach(txn => {
      const key = `${txn.__year}-${txn.__month}`;
  
      if (!map.has(key)) {
        map.set(key, {
          title: {
            year: txn.__year,
            month: txn.__month,
            total: 0,
          },
          data: [],
        });
      }
  
      map.get(key).data.push(txn);
      map.get(key).title.total += Number(txn.amount || 0);
    });
  
    return Array.from(map.values());
  };
  
  export default function Transactions(props: any) {

    const { theme } = useContext<any>(ThemeContext);
    const STRING = useString();
  
    const [visible, setVisible] = useState(false);
    const [open, setOpen] = useState(false);
  
    const [requestData, setRequestData] = useState<any>({
      transactions: [],
      flatTransactions: [],
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
        const page = customPage ?? requestData.page;
        const startDate = customStartDate ?? requestData.startDate;
        const endDate = customEndDate ?? requestData.endDate;
        const selectedStatus = customStatus ?? requestData.selectedStatus;
  
        let url = API.API_ROUTES.getProviderTransactions;
        url += `?section=transactions&page=${page}&limit=${PAGE_SIZE}`;
  
        if (selectedStatus?.value) {
          url += `&status=${selectedStatus.value}`;
        }
        if (startDate) {
          url += `&start_date=${moment(startDate).format('YYYY-MM-DD')}`;
        }
        if (endDate) {
          url += `&end_date=${moment(endDate).format('YYYY-MM-DD')}`;
        }
  
        const result: any = await API.Instance.get(url);
  
        if (!result?.status) {
          SHOW_TOAST(result?.data?.message, 'error');
          setRequestData((prev: any) => ({ ...prev, isLoading: false }));
          return;
        }
  
        const apiMonths = result?.data?.data?.months ?? [];
        const newFlat = normalizeTransactions(apiMonths);
  
        setRequestData((prev: any) => {
          const allFlat = reset
            ? newFlat
            : [...prev.flatTransactions, ...newFlat];
  
          return {
            ...prev,
            flatTransactions: allFlat,
            transactions: groupByMonth(allFlat),
            page,
            hasMore: newFlat.length === PAGE_SIZE,
            isLoading: false,
          };
        });
  
      } catch (error: any) {
        SHOW_TOAST(error?.message ?? '', 'error');
        setRequestData((prev: any) => ({ ...prev, isLoading: false }));
      }
    };
  
    /* ================= EFFECTS ================= */
  
    useEffect(() => {
      fetchTransactions({ reset: true, customPage: 1 });
    }, []);
  
    useEffect(() => {
      fetchTransactions({
        reset: true,
        customStatus: requestData.selectedStatus,
        customStartDate: requestData.startDate,
        customEndDate: requestData.endDate,
        customPage: 1,
      });
    }, [requestData.selectedStatus, requestData.startDate, requestData.endDate]);
  
    useEffect(() => {
      if (requestData.page > 1) {
        fetchTransactions({ customPage: requestData.page });
      }
    }, [requestData.page]);
  
    /* ================= ACTIONS ================= */
  
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
        flatTransactions: [],
        transactions: [],
      }));
    };
  
    const onDateApply = (start: any, end: any) => {
      setOpen(false);
  
      setRequestData((prev: any) => ({
        ...prev,
        startDate: start,
        endDate: end,
        page: 1,
        hasMore: true,
        flatTransactions: [],
        transactions: [],
      }));
    };
  
    /* ================= UI ================= */
  
    return (
      <View style={styles(theme).container}>
        <Header
          onBack={() => props.navigation.goBack()}
          screenName={STRING.transactions}
        />
  
        {/* FILTERS */}
        <View style={styles(theme).headerStyle}>
          {/* STATUS */}
          <View style={styles(theme).filterView}>
            <Text size={14} font={FONTS.Lato.Medium} color={theme._2B2B2B}>
              {requestData.selectedStatus.title === 'All'
                ? 'Status'
                : requestData.selectedStatus.title}
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
                <View>
                  {[
                    { id: '1', title: 'All', value: '' },
                    { id: '2', title: 'Completed', value: 'completed' },
                    { id: '3', title: 'Pending', value: 'pending' },
                  ].map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles(theme).dropdownItem}
                      onPress={() => onStatusChange(item)}
                    >
                      <Text
                        size={14}
                        font={FONTS.Lato.SemiBold}
                        color={requestData.selectedStatus.id === item.id
                          ? theme.primary
                          : theme._555555}
                      >
                        {item.title}
                      </Text>
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
  
          {/* DATE */}
          <View style={styles(theme).filterView}>
            <Text size={14} font={FONTS.Lato.Medium} color={theme._2B2B2B}>
              {`${requestData.startDate
                ? new Date(requestData.startDate).toLocaleDateString()
                : 'date'}${requestData.endDate
                  ? ' - ' + new Date(requestData.endDate).toLocaleDateString()
                  : ''}`}
            </Text>
  
            <TouchableOpacity onPress={() => setOpen(true)}>
              <Image source={IMAGES.ic_down} style={styles(theme).downIcon} />
            </TouchableOpacity>
          </View>
        </View>
  
        {/* LIST */}
        <SectionList
          sections={requestData.transactions}
          keyExtractor={(item) => item.id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
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
                {section.title.total.toFixed(2)}
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
  
        {requestData.isLoading && <ProgressView />}
      </View>
    );
  }
  
  /* ================= STYLES ================= */
  
  const styles = (theme: ThemeContextType['theme']) => StyleSheet.create({
    container: {
      flex: 1,
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
    sectionHeaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme._EAF0F3,
      paddingVertical: getScaleSize(13),
      paddingHorizontal: getScaleSize(22),
      marginTop: getScaleSize(20),
      marginBottom: getScaleSize(12),
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
    },
    dropdownItem: {
      paddingVertical: getScaleSize(6),
    },
  });