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
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';

//COMPONENT
import {
  AcceptBottomPopup,
  BottomSheet,
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


  console.log('userType==>', userType);
  const [isLoading, setLoading] = useState(false);
  const [notification, setNotification] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<any>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const PAGE_SIZE = 10;

  const mapViewRef = useRef<any>(null);

  useEffect(() => {
    if (selectedItem) {
      console.log('selectedItem==>', selectedItem);
      mapViewRef.current?.open();
    }
  }, [selectedItem]);

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

  async function onConfirmStart() {
    try {
      setLoading(true);
      const result = await API.Instance.post(API.API_ROUTES.onConfirmStart + `/${selectedItem?.service_id}`);
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success');
        mapViewRef.current?.close();
        setSelectedItem(null);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
        mapViewRef.current?.close();
        setSelectedItem(null);
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
      mapViewRef.current?.close();
      setSelectedItem(null);
    } finally {
      setLoading(false);
    }
  }

  async function onNotArrived() {
    try {
      setLoading(true);
      const result = await API.Instance.post(API.API_ROUTES.onNotArrived + `/${selectedItem?.service_id}`);
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success');
        mapViewRef.current?.close();
        setSelectedItem(null);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
        mapViewRef.current?.close();
        setSelectedItem(null);
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
      mapViewRef.current?.close();
      setSelectedItem(null);
    } finally {
      setLoading(false);
    }
  }

  const elderDetailsRoutes = [
    'SERVICE_PROVIDER_ON_THE_WAY',
    'SERVICE_REQUEST_MADE',
    'SEVICES PAYMENT DONE',
    'SERVICE_REQUEST_MADE',
    'SERVICE_COMPLETED'
  ];

  const ProfessionalDetailsRoutes = [
    'SERVICE_RENEGOTIATION_ACCEPTED',
    'SERVICE_COMPLETED',
    'QUOTE_ACCEPTED',
  ]

  function renderItem() {
    if (notification?.length > 0) {
      return (
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
            if (item?.data?.event === 'SERVICE_STARTED') {
              return (
                <View style={styles(theme).notificationContainer}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image
                      style={styles(theme).codeIcon}
                      source={IMAGES.ic_code}
                    />
                    <View style={{ flex: 1.0 }}>
                      <Text
                        style={{ marginLeft: getScaleSize(16) }}
                        size={getScaleSize(18)}
                        font={FONTS.Lato.Bold}
                        color={theme._424242}>
                        {item?.title ?? ''}
                      </Text>
                      <Text
                        style={{ marginLeft: getScaleSize(16), marginTop: getScaleSize(3), marginBottom: getScaleSize(6) }}
                        size={getScaleSize(12)}
                        font={FONTS.Lato.Regular}
                        color={'#818285'}>
                        {moment(item?.sent_at).format('ddd, DD MMM YYYY - hh:mm A') ?? ''}
                      </Text>
                      <Text
                        style={{ marginLeft: getScaleSize(16) }}
                        size={getScaleSize(12)}
                        font={FONTS.Lato.Regular}
                        color={theme._737373}>
                        {STRING.please_keep_this_security_code_safe_it_will_be_required_to_confirm_completion_and_release_payment ?? ''}
                      </Text>
                    </View>
                  </View>
                  <View style={styles(theme).codeContainer}>
                    <Text
                      size={getScaleSize(16)}
                      font={FONTS.Lato.Medium}
                      color={theme._2C6587}>
                      {STRING.SecurityCode}
                    </Text>
                    <View style={styles(theme).securityItemContainer}>
                      {'123'.split('').map((item: any, index: number) => {
                        return (
                          <Text
                            style={{ flex: 1.0 }}
                            size={getScaleSize(27)}
                            font={FONTS.Lato.Bold}
                            align="center"
                            color={theme._2C6587}>
                            {item}
                          </Text>

                        );
                      })}
                    </View>
                  </View>
                </View>
              )
            } else {
              return (
                <View style={styles(theme).notificationContainer}>
                  <View style={{ flexDirection: 'row' }}>
                    {item?.data?.sender_profile_photo_url
                      ? <Image
                        style={styles(theme).profilePic}
                        source={{ uri: item?.data?.sender_profile_photo_url }}
                      />
                      : <Image
                        style={styles(theme).profilePic}
                        source={IMAGES.user_placeholder}
                      />

                    }
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
                  {userType === 'elderly_user' && (
                    <>
                      {item?.title === 'Provider reached on location' && (
                        <View style={styles(theme).buttonContainer}>
                          <TouchableOpacity
                            style={styles(theme).nextButtonContainer}
                            activeOpacity={1}
                            onPress={() => {
                              setSelectedItem(item?.data);
                            }}>
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
                            onPress={() => {
                              setSelectedItem(item?.data ?? '');
                            }}>
                            <Text
                              size={getScaleSize(14)}
                              font={FONTS.Lato.Medium}
                              color={'#ACADAD'}
                              style={{ alignSelf: 'center' }}>
                              {STRING.decline}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}
                  {userType === 'elderly_user' && (
                    <>
                      {elderDetailsRoutes.includes(item?.data?.event) && (
                        <View style={styles(theme).buttonContainer}>
                          <TouchableOpacity
                            style={styles(theme).nextButtonContainer}
                            activeOpacity={1}
                            onPress={() => {
                              props.navigation.navigate(SCREENS.RequestDetails.identifier, {
                                serviceId: item?.data?.service_id,
                              });
                            }}>
                            <Text
                              size={getScaleSize(14)}
                              font={FONTS.Lato.Medium}
                              color={theme.white}
                              style={{ alignSelf: 'center' }}>
                              {STRING.task_details}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}
                  {userType === 'service_provider' && (
                    <>
                      {ProfessionalDetailsRoutes.includes(item?.data?.event) && (
                        <View style={styles(theme).buttonContainer}>
                          <TouchableOpacity
                            style={styles(theme).nextButtonContainer}
                            activeOpacity={1}
                            onPress={() => {
                              props.navigation.navigate(SCREENS.ProfessionalTaskDetails.identifier, {
                                item: item?.data?.service_id,
                              });
                            }}>
                            <Text
                              size={getScaleSize(14)}
                              font={FONTS.Lato.Medium}
                              color={theme.white}
                              style={{ alignSelf: 'center' }}>
                              {STRING.task_details}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}
                </View>
              );
            }
          }}
        />
      )
    } else if (isLoading) {
      return (
        <View style={styles(theme).emptyContainer}>
          <ActivityIndicator size="large" color={theme.primary} style={{ margin: 20 }} />
        </View>
      )
    } else {
      return (
        <View style={styles(theme).emptyContainer}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.Medium}
            align="center"
            color={theme._939393}>
            {STRING.no_data_found}
          </Text>
        </View>
      )
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
      {renderItem()}
      <BottomSheet
        type='map_view'
        icon={IMAGES.location_map}
        isNotCloseable={true}
        bottomSheetRef={mapViewRef}
        height={getScaleSize(450)}
        // description={STRING.please_confirm_that_the_expert_has_arrived_at_the_service_location_Do_you_acknowledge_their_arrival}
        title={STRING.please_confirm_that_the_expert_has_arrived_at_the_service_location_Do_you_acknowledge_their_arrival}
        buttonTitle={STRING.yes_i_confirm}
        secondButtonTitle={STRING.not_arrived}
        security_Code={selectedItem?.service_code?.replace(/\*/g, '') ?? '0'}
        onPressSecondButton={() => {
          onNotArrived()
        }}
        onPressButton={() => {
          onConfirmStart()
        }}
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
      flex: 1.0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    codeIcon: {
      height: getScaleSize(42),
      width: getScaleSize(42),
    },
    codeContainer: {
      marginLeft: getScaleSize(56),
      marginTop: getScaleSize(12),
      marginBottom: getScaleSize(6),
      borderColor: theme._E6E6E6,
      borderWidth: 1,
      borderRadius: getScaleSize(12),
      paddingHorizontal: getScaleSize(12),
      paddingVertical: getScaleSize(8),
    },
    securityItemContainer: {
      flex: 1.0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      marginHorizontal: getScaleSize(30),
      marginTop: getScaleSize(12),
      marginBottom: getScaleSize(15),
    },
  });
