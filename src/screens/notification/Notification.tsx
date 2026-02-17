import React, { useContext, useEffect, useRef, useState } from 'react';
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
  Platform,
  ActivityIndicator,
} from 'react-native';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { getScaleSize, useString } from '../../constant';

//COMPONENT
import {
  AcceptBottomPopup,
  Header,
  PaymentBottomPopup,
  RejectBottomPopup,
  RequestItem,
  SearchComponent,
  Text,
} from '../../components';

//PACKAGES
import { useFocusEffect } from '@react-navigation/native';
import { SCREENS } from '..';
import { API } from '../../api';
import moment from 'moment';

export default function Notification(props: any) {
  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  const { userType } = useContext<any>(AuthContext);

  const list = ['accept', 'service_started', 'task_status', 'task_details'];

  const [isLoading, setLoading] = useState(false);
  const [notification, setNotification] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<any>(null)
  const PAGE_SIZE = 10;

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(theme.white);
        StatusBar.setBarStyle('dark-content');
      }
    }, []),
  );

  useEffect(() => {
    getNotification();
  }, [page]);

  async function getNotification() {
    try {
      setLoading(true);
      const result = await API.Instance.get(API.API_ROUTES.getNotifications + `?page=${page}&limit=${PAGE_SIZE}`);
      if (result.status) {
        console.log('notifications==>', result?.data?.data?.notifications)
        const newData = result?.data?.data?.notifications ?? [];
        if (newData?.length < PAGE_SIZE) {
          setHasMore(false);
          setNotification((prev: any[]) => [...prev, ...newData]);
          setError(newData?.length === 0 ? 'No Data Found' : '')
        }
        else {
          setNotification((prev: any[]) => [...prev, ...newData]);
        }
      } else {
        setHasMore(false);
        console.log('error==>', result?.data?.message);
      }
    } catch (error) {
      setHasMore(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const loadMore = () => {
    if (hasMore) {
      setPage(page + 1);
    }
  }

  return (
    <View style={styles(theme).container}>
      <Header
        onBack={() => {
          props.navigation.goBack();
        }}
        screenName={'Notifications'}
      />
      <FlatList
        data={notification}
        keyExtractor={(item: any, index: number) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: getScaleSize(50) }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isLoading ? <ActivityIndicator size="large" color={theme.primary} style={{ margin: 20 }} /> : null
        }
        renderItem={({ item, index }) => {
          return (
            <View style={styles(theme).notificationContainer}>
              <View style={{ flexDirection: 'row' }}>
                <Image
                  style={styles(theme).profilePic}
                  source={IMAGES.user_placeholder}
                />
                <View style={{ flex: 1.0 }}>
                  {/* <Text
                    style={{ marginLeft: getScaleSize(16) }}
                    size={getScaleSize(18)}
                    font={FONTS.Lato.Bold}
                    color={theme._424242}>
                    {item?.title ?? ''}
                  </Text> */}
                  <Text
                    style={{ marginLeft: getScaleSize(16) }}
                    size={getScaleSize(16)}
                    font={FONTS.Lato.Medium}
                    color={'#595959'}>
                    {item?.body ?? ''}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginLeft: getScaleSize(16),
                      marginTop: getScaleSize(4),
                    }}>
                    <Text
                      style={{ flex: 1.0 }}
                      size={getScaleSize(12)}
                      font={FONTS.Lato.Regular}
                      color={'#818285'}>
                      {moment(item?.sent_at).format('ddd, DD MMM YYYY - hh:mm A') ?? ''}
                    </Text>
                    <Text
                      size={getScaleSize(12)}
                      font={FONTS.Lato.Regular}
                      color={'#818285'}>
                      {moment(item?.sent_at).fromNow() ?? ''}
                    </Text>
                  </View>
                </View>
              </View>
              {item?.item === 'accept' && (
                <View style={styles(theme).buttonContainer}>
                  <TouchableOpacity
                    style={styles(theme).nextButtonContainer}
                    activeOpacity={1}
                    onPress={() => { }}>
                    <Text
                      size={getScaleSize(14)}
                      font={FONTS.Lato.Medium}
                      color={theme.white}
                      style={{ alignSelf: 'center' }}>
                      {STRING.Accept}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles(theme).backButtonContainer}
                    activeOpacity={1}
                    onPress={() => { }}>
                    <Text
                      size={getScaleSize(14)}
                      font={FONTS.Lato.Medium}
                      color={'#ACADAD'}
                      style={{ alignSelf: 'center' }}>
                      {'Decline'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {item?.item === 'task_status' && (
                <View style={styles(theme).buttonContainer}>
                  <TouchableOpacity
                    style={styles(theme).nextButtonContainer}
                    activeOpacity={1}
                    onPress={() => {
                      if (userType === 'service_provider') {
                        props.navigation.navigate(SCREENS.ProfessionalTaskStatus.identifier);
                      } else {
                        props.navigation.navigate(
                          SCREENS.TaskStatus.identifier,
                        );
                      }
                    }}>
                    <Text
                      size={getScaleSize(14)}
                      font={FONTS.Lato.Medium}
                      color={theme.white}
                      style={{ alignSelf: 'center' }}>
                      {'Check Task Status'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {item?.data?.event === 'SERVICE_RENEGOTIATION_ACCEPTED'
                || item?.data?.event === 'SERVICE_COMPLETED'
                || item?.data?.event === 'QUOTE_ACCEPTED'
                && (
                  <View style={styles(theme).buttonContainer}>
                    <TouchableOpacity
                      style={styles(theme).nextButtonContainer}
                      activeOpacity={1}
                      onPress={() => {

                      }}>
                      <Text
                        size={getScaleSize(14)}
                        font={FONTS.Lato.Medium}
                        color={theme.white}
                        style={{ alignSelf: 'center' }}>
                        {'Task Details'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
            </View>
          );
        }}
        ListEmptyComponent={() =>
          !isLoading ? (
            <View style={styles(theme).emptyContainer}>
              <Text
                size={getScaleSize(16)}
                font={FONTS.Lato.Regular}
                color={theme._565656}
              >
                {error}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.white },
    notificationContainer: {
      marginHorizontal: getScaleSize(24),
      marginTop: getScaleSize(16),
      flex: 1.0,
    },
    profilePic: {
      height: getScaleSize(42),
      width: getScaleSize(42),
      borderRadius: getScaleSize(21),
    },
    buttonContainer: {
      flexDirection: 'row',
      marginHorizontal: getScaleSize(55),
      marginBottom: getScaleSize(17),
      marginTop: getScaleSize(16),
    },
    backButtonContainer: {
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#ACADAD',
      borderRadius: getScaleSize(12),
      paddingVertical: getScaleSize(8),
      backgroundColor: theme.white,
      marginLeft: getScaleSize(8),
      paddingHorizontal: getScaleSize(10),
    },
    nextButtonContainer: {
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: getScaleSize(12),
      paddingVertical: getScaleSize(8),
      backgroundColor: theme.primary,
      marginRight: getScaleSize(8),
      paddingHorizontal: getScaleSize(10),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
