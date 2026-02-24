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
import { getScaleSize, openStripeCheckout, SHOW_TOAST, useString } from '../../constant';

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
  const [selectedRenegotiationItem, setSelectedRenegotiationItem] = useState<any>(null);
  const PAGE_SIZE = 10;

  const mapViewRef = useRef<any>(null);
  const renegotiationViewRef = useRef<any>(null);

  useEffect(() => {
    if (selectedItem) {
      console.log('selectedItem==>', selectedItem);
      mapViewRef.current?.open();
    }
  }, [selectedItem]);

  useEffect(() => {
    if (selectedRenegotiationItem) {
      console.log('selectedRenegotiationItem==>', selectedRenegotiationItem);
      renegotiationViewRef.current?.open();
    }
  }, [selectedRenegotiationItem]);

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

  async function onRenegotiationAccept() {
    try {
      setLoading(true);
      const params = {
        service_id: selectedRenegotiationItem?.service_id,
        renegotiation_id: selectedRenegotiationItem?.renegotiation_id,
      }
      const result = await API.Instance.post(API.API_ROUTES.onRenegotiationAccept + `?platform=app`, params);
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success');
        const STRIPE_URL = result?.data?.data?.checkout_url ?? '';
        openStripeCheckout(STRIPE_URL);
        setTimeout(() => {
          renegotiationViewRef.current?.close();
          setSelectedRenegotiationItem(null);
        }, 2000);
        console.log('result==>', result?.data?.data);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
        renegotiationViewRef.current?.close();
        setSelectedRenegotiationItem(null);
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
      renegotiationViewRef.current?.close();
      setSelectedRenegotiationItem(null);
    } finally {
      setLoading(false);
    }
  }

  async function onRenegotiationDecline() {
    try {
      setLoading(true);
      const params = {
        service_id: selectedRenegotiationItem?.service_id,
        renegotiation_id: selectedRenegotiationItem?.renegotiation_id,
      }
      const result = await API.Instance.post(API.API_ROUTES.onRenegotiationDecline + `?platform=app`, params);
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success');
        renegotiationViewRef.current?.close();
        setSelectedRenegotiationItem(null);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
        renegotiationViewRef.current?.close();
        setSelectedRenegotiationItem(null);
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
      renegotiationViewRef.current?.close();
      setSelectedRenegotiationItem(null);
    } finally {
      setLoading(false);
    }
  }

  const elderDetailsRoutes = [
    'SERVICE_PROVIDER_ON_THE_WAY',
    'SEVICES PAYMENT DONE',
    'SERVICE_COMPLETED',
    "SERVICE_REQUEST_MADE"
  ];

  const ProfessionalDetailsRoutes = [
    'SERVICE_RENEGOTIATION_ACCEPTED',
    'SERVICE_COMPLETED',
    'QUOTE_ACCEPTED',
    'SERVICE_NEGOTIATED',
    "SERVICE_MONEY_TRANSFERRED",
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
            const imageUrl = item?.data?.sender_profile_photo_url;
            const senderName = item?.data?.sender_name?.trim();
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
                        {moment.utc(item?.sent_at).local().format('ddd, DD MMM YYYY - hh:mm A') ?? ''}
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
                      {item?.data?.SECURITY_CODE?.split('').map((item: any, index: number) => {
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
                    {item?.data?.event === 'RENEGOTIATION_REQUEST' ? (
                      <Image
                        style={styles(theme).codeIcon}
                        source={IMAGES.ic_reNegotiation}
                      />
                    ) : (
                      <>
                        {(() => {
                          const imageUrl = item?.data?.sender_profile_photo_url;
                          const senderName = item?.data?.sender_name?.trim();

                          // If image exists
                          if (imageUrl && imageUrl.trim() !== '') {
                            return (
                              <Image
                                style={styles(theme).profilePic}
                                source={{ uri: imageUrl }}
                              />
                            );
                          }

                          //  If name exists show first letter
                          if (senderName && senderName.length > 0) {
                            return (
                              <View style={[styles(theme).profilePic, { backgroundColor: theme.primary }]}>
                                <Text
                                  size={getScaleSize(18)}
                                  font={FONTS.Lato.Bold}
                                  color={theme.white}
                                >
                                  {senderName.charAt(0).toUpperCase()}
                                </Text>
                              </View>
                            );
                          }

                          //  If both missing show default circle
                          return (
                            <Image style={styles(theme).profilePic}
                              resizeMode='contain'
                              source={IMAGES.user_placeholder}>
                            </Image>
                          );
                        })()}
                      </>
                    )}
                    <View style={{ flex: 1.0 }}>
                      {item?.data?.event === 'RENEGOTIATION_REQUEST' && (
                        <Text
                          style={{ marginLeft: getScaleSize(16) }}
                          size={getScaleSize(18)}
                          font={FONTS.Lato.Bold}
                          color={theme._424242}>
                          {item?.title ?? ''}
                        </Text>
                      )}
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
                          {moment.utc(item?.sent_at).local().format('ddd, DD MMM YYYY - hh:mm A') ?? ''}
                        </Text>
                        <Text
                          size={getScaleSize(12)}
                          font={FONTS.Lato.Regular}
                          color={'#818285'}>
                          {moment.utc(item?.sent_at).local().fromNow() ?? ''}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {userType === 'elderly_user' && (
                    <>
                      {item?.data?.event === 'RENEGOTIATION_REQUEST' && (
                        <View style={styles(theme).buttonContainer}>
                          <TouchableOpacity
                            style={styles(theme).nextButtonContainer}
                            activeOpacity={1}
                            onPress={() => {
                              setSelectedRenegotiationItem(item?.data);
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
                              setSelectedRenegotiationItem(item?.data ?? '');
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
                      {item?.data?.event === "PROVIDER_REACHED" && (
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
      <BottomSheet
        type='renegotiation_view'
        icon={IMAGES.renegotiationIcon}
        isNotCloseable={true}
        bottomSheetRef={renegotiationViewRef}
        height={getScaleSize(470)}
        description={STRING.by_approving_the_updated_amount_will_be_placed_in_escrow}
        title={STRING.new_budget_request}
        subTitle={STRING.the_provider_has_reviewed_the_task_and_proposed_a_revised_budget_the_new_agreed_service_fee_is}
        buttonTitle={STRING.confirm_pay}
        secondButtonTitle={STRING.decline}
        renegotiationAmount={selectedRenegotiationItem?.adjustment_amount ?? '0'}
        onPressSecondButton={() => {
          onRenegotiationDecline()
        }}
        onPressButton={() => {
          onRenegotiationAccept()
          // const STRIPE_URL = 'https://checkout.stripe.com/c/pay/cs_test_a1iW94fBqHKFW8a5uNFB39p0fQdVHXw6gBOQzOxBTZ6VDvzjlqI1Cs8Gm…'
          // openStripeCheckout(STRIPE_URL);
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
