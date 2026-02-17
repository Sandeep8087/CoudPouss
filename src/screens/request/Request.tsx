import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Alert,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';

//COMPONENT
import { Header, RequestItem, SearchComponent, Text } from '../../components';

//PACKAGES
import { SCREENS } from '..';
import { API } from '../../api';
import { debounce } from 'lodash';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

const PAGE_SIZE = 10;
export default function Request(props: any) {
  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  const flatListRef = useRef<FlatList>(null);

  const [requestData, setRequestData] = useState<any>({
    selectedFilter: { id: '1', title: 'All', filter: 'all' },
    allRequests: [],
    page: 1,
    hasMore: true,
    isLoading: true,
    isMoreLoading: false,
    searchValue: '',
    searchDebouncedText: '',
  });

  const data = [
    { id: '1', title: 'All', filter: 'all' },
    { id: '2', title: 'Open Proposal', filter: 'open' },
    { id: '3', title: 'Responses', filter: 'pending' },
    { id: '4', title: 'Validation', filter: 'accepted' },
    { id: '5', title: 'Completed', filter: 'completed' },
    { id: '6', title: 'Cancelled', filter: 'cancelled' },
  ];

  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getAllRequests();
    }
  }, [
    isFocused,
    requestData.page,
    requestData.selectedFilter,
    requestData.searchDebouncedText,
  ]);

  const debouncedSearch = useCallback(debounce((text: string) => {
    setRequestData((prev: any) => ({
      ...prev,
      searchDebouncedText: text,
      page: 1,
      hasMore: true,
      allRequests: [],
      isLoading: true,
      isMoreLoading: false,
    }));
  }, 500), []);

  async function getAllRequests() {
    if (!requestData?.hasMore) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const result: any = await API.Instance.get(API.API_ROUTES.getAllRequests + `?page=${requestData?.page}&limit=${PAGE_SIZE}&status=${requestData?.selectedFilter?.filter}&search=${requestData?.searchDebouncedText}`);
      if (result.status) {
        const newData: any = result?.data?.data?.recent_requests?.items ?? []
        console.log('newData', newData);
        if (newData.length < PAGE_SIZE) {
          setRequestData((prev: any) => ({
            ...prev,
            hasMore: false,
            allRequests: [...(prev?.allRequests ?? []), ...newData],
            isLoading: false,
          }));
        }
        else {
          setRequestData((prev: any) => ({
            ...prev,
            allRequests: [...(prev?.allRequests ?? []), ...newData],
            isLoading: false,
          }));
        }
      } else {
        if (result?.message === 'Request canceled') return;
        SHOW_TOAST(result?.data?.message ?? '', 'error')
        console.log('error==>', result?.data?.message)
      }
    } catch (error: any) {
      console.log('error', error);
      if (error?.message === 'canceled') return;
      SHOW_TOAST(error?.message ?? '', 'error');
      console.log(error?.message)
    } finally {
      setRequestData((prev: any) => ({
        ...prev,
        isLoading: false,
        isMoreLoading: false,
      }));
    }
  }

  const loadMore = () => {
    if (!requestData?.isLoading && requestData?.hasMore) {
      setRequestData((prev: any) => ({
        ...prev,
        page: prev?.page + 1,
        hasMore: true,
        isLoading: false,
        isMoreLoading: true,
      }));
    }
  };

  function renderFlatList() {
    console.log('requestData?.isLoading', requestData?.isLoading);
    if (requestData?.allRequests?.length > 0) {
      return (
        <FlatList
          data={requestData?.allRequests}
          contentContainerStyle={{ paddingBottom: getScaleSize(50) }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item: any, index: number) => index.toString()}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            requestData?.isMoreLoading ? <ActivityIndicator size="large" color={theme.primary} style={{ margin: 20 }} /> : null
          }
          renderItem={({ item }) => (
            <RequestItem
              selectedFilter={requestData?.selectedFilter}
              onPress={() => {
                props.navigation.navigate(SCREENS.RequestDetails.identifier, {
                  item: item
                })
              }}
              item={item} />
          )}
        />
      )
    }
    else if (requestData?.isLoading) {
      return (
        <View style={styles(theme).emptyView}>
          <ActivityIndicator size="large" color={theme.primary} style={{ margin: 20 }} />
        </View>
      )
    }
    else {
      return (
        <View style={styles(theme).emptyView}>
          <Image style={styles(theme).emptyImage} source={IMAGES.empty} />
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.SemiBold}
            align="center"
            color={theme._939393}
            style={{
              marginTop: getScaleSize(42),
              textAlign: 'center',
              alignSelf: 'center',
            }}>
            {STRING.Youhavenotcreatedanyrequest}
          </Text>
          <TouchableOpacity
            style={styles(theme).btnRequestService}
            activeOpacity={1}
            onPress={() => {
              props.navigation.navigate(SCREENS.CreateRequest.identifier);
            }}>
            <Text
              size={getScaleSize(19)}
              font={FONTS.Lato.Bold}
              color={theme.white}>
              {STRING.Requestaservice}
            </Text>
          </TouchableOpacity>
        </View>
      )
    }
  }

  return (
    <View style={styles(theme).container}>
      <Header
        // type='profile'
        screenName={STRING.Request} />
      <View style={{ marginTop: getScaleSize(16), marginHorizontal: getScaleSize(22) }}>
        <SearchComponent
          value={requestData?.searchValue}
          onChangeText={(text: string) => {
            setRequestData((prev: any) => ({
              ...prev,
              searchValue: text,
            }));
            debouncedSearch(text);
          }}
        />
      </View>
      <View style={{ marginVertical: getScaleSize(18) }}>
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={item => item.id}
          ListHeaderComponent={() => {
            return <View style={{ width: getScaleSize(22) }} />;
          }}
          ListFooterComponent={() => {
            return <View style={{ width: getScaleSize(22) }} />;
          }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles(theme).unselectedContainer,
                {
                  marginLeft: index === 0 ? 0 : getScaleSize(16),
                  backgroundColor:
                    requestData?.selectedFilter?.id === item?.id ? theme.primary : '#F7F7F7',
                },
              ]}
              activeOpacity={1}
              onPress={() => {
                setRequestData((prev: any) => ({
                  ...prev,
                  selectedFilter: item,
                  page: 1,
                  hasMore: true,
                  allRequests: [],
                  isLoading: true,
                }));
                flatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                  viewPosition: 0.5, // 👈 centers item
                });
              }}>
              <Text
                size={getScaleSize(16)}
                font={FONTS.Lato.Regular}
                color={requestData?.selectedFilter?.id === item?.id ? theme.white : theme._818285}>
                {item?.title}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      {renderFlatList()}
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.white },
    scrolledContainer: {
      // marginHorizontal: getScaleSize(22),
      marginTop: getScaleSize(24),
      flex: 1.0,
    },
    unselectedContainer: {
      paddingVertical: getScaleSize(18),
      paddingHorizontal: getScaleSize(18),
      borderRadius: getScaleSize(10),
      backgroundColor: '#F7F7F7',
    },
    emptyView: {
      flex: 1.0,
      alignSelf: 'center',
      marginTop: getScaleSize(41),
    },
    emptyImage: {
      height: getScaleSize(217),
      width: getScaleSize(184),
      alignSelf: 'center',
    },
    btnRequestService: {
      marginTop: getScaleSize(40),
      paddingVertical: getScaleSize(18),
      paddingHorizontal: getScaleSize(20),
      backgroundColor: theme.primary,
      borderRadius: getScaleSize(12),
      alignItems: 'center',
      alignSelf: 'center',
    },
  });
