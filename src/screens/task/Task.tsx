import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';

//COMPONENT
import { TaskItem, Text } from '../../components';

//PACKAGES
import { SCREENS } from '..';
import { API } from '../../api';
import { useIsFocused } from '@react-navigation/native';

export default function Task(props: any) {
  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

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

  async function getQuateList() {
    if (!quateList?.hasMore) return;

    try {
      const result = await API.Instance.get(
        API.API_ROUTES.getQuateList +
        `?status=${getStatus()}&page=${quateList?.page}&limit=${PAGE_SIZE}`,
      );
      if (result.status) {
        const newData = result?.data?.data?.results ?? [];
        console.log('newData==>', newData);
        if (newData.length < PAGE_SIZE) {
          setQuateList((prev: any) => ({
            ...prev,
            hasMore: false,
            allQuateList: [...(prev?.allQuateList ?? []), ...newData],
            isLoading: false,
          }));
        } else {
          setQuateList((prev: any) => ({
            ...prev,
            allQuateList: [...(prev?.allQuateList ?? []), ...newData],
            isLoading: false,
          }));
        }
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setQuateList((prev: any) => ({
        ...prev,
        isLoading: false,
        hasMoreLoading: false,
      }));
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
                style={{ margin: 20 }}
              />
            ) : null
          }
          renderItem={({ item, index }) => {
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
                  props.navigation.navigate(SCREENS.ChatDetails.identifier);
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
          style={{ margin: 20 }}
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
      <Text
        size={getScaleSize(24)}
        font={FONTS.Lato.Bold}
        color={theme.primary}
        style={{
          marginTop: getScaleSize(14),
          marginHorizontal: getScaleSize(22),
        }}>
        {'Task Management'}
      </Text>
      <View style={styles(theme).tabContainer}>
        <TouchableOpacity
          style={styles(theme).tabItem}
          activeOpacity={1}
          onPress={() => {
            setQuateList((prev: any) => ({
              ...prev,
              allQuateList: [],
              selectedIndex: 0,
              page: 1,
              hasMore: true,
              isLoading: true,
              hasMoreLoading: false,
            }));
          }}>
          <View
            style={[
              styles(theme).tabItemContainer,
              { borderBottomWidth: quateList?.selectedIndex === 0 ? 2 : 0 },
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
            setQuateList((prev: any) => ({
              ...prev,
              allQuateList: [],
              selectedIndex: 1,
              page: 1,
              hasMore: true,
              isLoading: true,
              hasMoreLoading: false,
            }));
          }}>
          <View
            style={[
              styles(theme).tabItemContainer,
              { borderBottomWidth: quateList?.selectedIndex === 1 ? 2 : 0 },
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
            setQuateList((prev: any) => ({
              ...prev,
              allQuateList: [],
              selectedIndex: 2,
              page: 1,
              hasMore: true,
              isLoading: true,
              hasMoreLoading: false,
            }));
          }}>
          <View
            style={[
              styles(theme).tabItemContainer,
              { borderBottomWidth: quateList?.selectedIndex === 2 ? 2 : 0 },
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
    container: { flex: 1, backgroundColor: theme.white ,
       marginTop: StatusBar.currentHeight
        ? StatusBar.currentHeight + getScaleSize(10)
        : getScaleSize(20),
    },
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
