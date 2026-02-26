import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';

//ASSETS
import {FONTS, IMAGES} from '../../assets';

//CONTEXT
import {ThemeContext, ThemeContextType} from '../../context';

//CONSTANT
import {getScaleSize, SHOW_TOAST, useString} from '../../constant';

//COMPONENT
import {Header, TaskItem, Text} from '../../components';

//PACKAGES

import {buildThreadId} from '../../services/chat';
import {SCREENS} from '..';
import {API} from '../../api';
import {useIsFocused} from '@react-navigation/native';

export default function Task(props: any) {
  const STRING = useString();
  const {theme} = useContext<any>(ThemeContext);
  const requestIdRef = useRef(0);
  const PAGE_SIZE = 5;

  const [quateList, setQuateList] = useState<any>({
    allQuateList: [],
    selectedIndex: 0,
    page: 1,
    hasMore: true,
    isLoading: true,
    hasMoreLoading: false,
  });

  function getStatus() {
    if (quateList?.selectedIndex === 0) {
      return 'send';
    } else if (quateList?.selectedIndex === 1) {
      return 'accepted';
    } else if (quateList?.selectedIndex === 2) {
      return 'complete';
    }
  }

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getQuateList();
    }
  }, [quateList?.selectedIndex, quateList?.page, isFocused]);

  function getStatusByIndex(index: number) {
    if (index === 0) return 'send';
    if (index === 1) return 'accepted';
    if (index === 2) return 'complete';
  }

  async function getQuateList() {
    if (!quateList.hasMore) return;

    const currentRequestId = ++requestIdRef.current;
    const status =
      quateList.selectedIndex === 0
        ? 'send'
        : quateList.selectedIndex === 1
          ? 'accepted'
          : 'complete';

    try {
      const result = await API.Instance.get(
        API.API_ROUTES.getQuateList +
          `?status=${status}&page=${quateList.page}&limit=${PAGE_SIZE}`,
      );

      // ❌ Agar ye latest request nahi hai → ignore
      if (currentRequestId !== requestIdRef.current) return;

      if (result.status) {
        const newData = result?.data?.data?.results ?? [];

        setQuateList((prev: any) => ({
          ...prev,
          allQuateList:
            prev?.page === 1 ? newData : [...prev.allQuateList, ...newData],
          hasMore: newData.length === PAGE_SIZE,
          isLoading: false,
          hasMoreLoading: false,
        }));
      }
    } catch (error: any) {
      if (currentRequestId === requestIdRef.current) {
        SHOW_TOAST(error?.message ?? '', 'error');
        setQuateList((prev: any) => ({
          ...prev,
          isLoading: false,
          hasMoreLoading: false,
        }));
      }
    }
  }

  const loadMore = () => {
    if (
      !quateList?.isLoading &&
      !quateList?.hasMoreLoading &&
      quateList?.hasMore
    ) {
      setQuateList((prev: any) => ({
        ...prev,
        page: prev?.page + 1,
        hasMore: true,
        isLoading: true,
        hasMoreLoading: true,
      }));
    }
  };

  const onTabChange = (index: number) => {
    requestIdRef.current++; // 🔥 old requests invalid

    setQuateList({
      allQuateList: [],
      selectedIndex: index,
      page: 1,
      hasMore: true,
      isLoading: true,
      hasMoreLoading: false,
    });
  };

  async function getServiceDetails(serviceRequestId: string) {
    try {
      const result = await API.Instance.get(
        API.API_ROUTES.getTsakDetails + `/quotes/${serviceRequestId}`,
      );
      if (result.status) {
        const conversationId = buildThreadId(
          result?.data?.data?.elderly_user?.id,
          result?.data?.data?.provider?.id,
        );
        props.navigation.navigate(SCREENS.ChatDetails.identifier, {
          conversationId: conversationId,
          peerUser: {
            user_id: result?.data?.data?.provider?.id,
            name: result?.data?.data?.provider?.full_name,
            email: result?.data?.data?.provider?.email,
            avatarUrl: result?.data?.data?.provider?.profile_photo_url,
          },
        });
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
      console.log(error?.message);
    } finally {
    }
  }

  function renderFlatList() {
    if (quateList?.allQuateList?.length > 0) {
      return (
        <FlatList
          data={quateList?.allQuateList}
          contentContainerStyle={{
            paddingBottom: getScaleSize(50),
            marginHorizontal: getScaleSize(22),
          }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item: any, index: number) => index.toString()}
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            quateList?.hasMoreLoading ? (
              <ActivityIndicator
                size="large"
                color={theme.primary}
                style={{margin: 20}}
              />
            ) : null
          }
          renderItem={({item, index}) => {
            return (
              <TaskItem
                key={index}
                item={item}
                onPressItem={() => {
                  props.navigation.navigate(
                    SCREENS.ProfessionalTaskDetails.identifier,
                    {
                      item: item,
                    },
                  );
                }}
                onPressStatus={() => {
                  props.navigation.navigate(SCREENS.TaskStatus.identifier, {
                    item: item,
                  });
                }}
                onPressChat={() => {
                  getServiceDetails(item?.service_request_id);
                }}
              />
            );
          }}
        />
      );
    } else if (quateList?.isLoading) {
      return (
        <ActivityIndicator
          size="large"
          color={theme.primary}
          style={{margin: 20}}
        />
      );
    } else {
      return (
        <View style={styles(theme).emptyView}>
          <Image style={styles(theme).emptyImage} source={IMAGES.empty} />
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.SemiBold}
            align="center"
            color={theme._939393}
            style={{
              marginTop: getScaleSize(20),
            }}>
            {
              STRING.you_have_not_sent_any_quote_please_sent_a_quotes_to_the_service_request
            }
          </Text>
        </View>
      );
    }
    return null;
  }

  return (
    <View style={styles(theme).container}>
      <Header />
      <Text
        size={getScaleSize(24)}
        font={FONTS.Lato.Bold}
        color={theme.primary}
        style={{
          marginHorizontal: getScaleSize(22),
        }}>
        {'Task Management'}
      </Text>
      <View style={styles(theme).tabContainer}>
        <TouchableOpacity
          style={styles(theme).tabItem}
          activeOpacity={1}
          onPress={() => {
            onTabChange(0);
          }}>
          <View
            style={[
              styles(theme).tabItemContainer,
              {borderBottomWidth: quateList?.selectedIndex === 0 ? 2 : 0},
            ]}>
            <Text
              size={getScaleSize(14)}
              font={FONTS.Lato.Medium}
              color={
                quateList?.selectedIndex === 0 ? theme._2C6587 : theme._595959
              }
              style={{}}>
              {'Quote Sent'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles(theme).tabItem}
          activeOpacity={1}
          onPress={() => {
            onTabChange(1);
          }}>
          <View
            style={[
              styles(theme).tabItemContainer,
              {borderBottomWidth: quateList?.selectedIndex === 1 ? 2 : 0},
            ]}>
            <Text
              size={getScaleSize(14)}
              font={FONTS.Lato.Medium}
              color={
                quateList?.selectedIndex === 1 ? theme._2C6587 : theme._595959
              }
              style={{}}>
              {'Accepted'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles(theme).tabItem}
          activeOpacity={1}
          onPress={() => {
            onTabChange(2);
          }}>
          <View
            style={[
              styles(theme).tabItemContainer,
              {borderBottomWidth: quateList?.selectedIndex === 2 ? 2 : 0},
            ]}>
            <Text
              size={getScaleSize(14)}
              font={FONTS.Lato.Medium}
              color={
                quateList?.selectedIndex === 2 ? theme._2C6587 : theme._595959
              }
              style={{}}>
              {'Completed'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      {renderFlatList()}
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: theme.white},
    tabView: {
      marginTop: getScaleSize(24),
      flex: 1.0,
      flexDirection: 'row',
      marginHorizontal: getScaleSize(22),
    },
    itemView: {
      flex: 1.0,
      alignSelf: 'center',
    },
    tabContainer: {
      marginTop: getScaleSize(25),
      flexDirection: 'row',
      borderBottomColor: '#EAF0F3',
      borderBottomWidth: 1,
    },
    tabItem: {
      flex: 1.0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabItemContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomColor: theme._2C6587,
      paddingBottom: getScaleSize(14),
    },
    emptyView: {
      flex: 1.0,
      alignSelf: 'center',
      justifyContent: 'center',
      marginTop: getScaleSize(26),
    },
    emptyImage: {
      height: getScaleSize(217),
      width: getScaleSize(184),
      alignSelf: 'center',
    },
  });
