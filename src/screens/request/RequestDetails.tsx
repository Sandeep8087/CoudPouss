import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Linking,
  Platform,
} from 'react-native';

//ASSETS & CONSTANT
import { FONTS, IMAGES } from '../../assets';
import {
  arrayIcons,
  getScaleSize,
  openStripeCheckout,
  SHOW_TOAST,
  useString,
} from '../../constant';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//COMPONENT
import {
  AcceptBottomPopup,
  Button,
  CancelScheduledServicePopup,
  Header,
  PaymentBottomPopup,
  ProgressView,
  RejectBottomPopup,
  RequestItem,
  SearchComponent,
  StatusItem,
  Text,
} from '../../components';

//SCREENS
import { SCREENS } from '..';

//API
import { API } from '../../api';

//PACKAGES
import moment from 'moment';
import { EventRegister } from 'react-native-event-listeners';
import { CommonActions } from '@react-navigation/native';
import Video from 'react-native-video';
import { buildThreadId } from '../../services/chat';
import {
  getNegotiationFieldData,
  userNegotiationMessage,
} from '../../services/negotiationchat';


export default function RequestDetails(props: any) {

  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);
  const item = props.route.params?.item ?? {};
  const serviceId = props.route.params?.serviceId ?? '';

  const rejectRef = useRef<any>(null);
  const acceptRef = useRef<any>(null);
  const paymentRef = useRef<any>(null);
  const cancelScheduledServicePopupRef = useRef<any>(null);

  const [isLoading, setLoading] = useState(false);
  const [serviceDetails, setServiceDetails] = useState<any>({});
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<any>('');
  const [isStatus, setIsStatus] = useState(false);
  const [visibleTaskDetails, setVisibleTaskDetails] = useState(false);
  const [serviceAmount, setServiceAmount] = useState<any>({});
  const [paymentDetails, setPaymentDetails] = useState<any>({});
  const [cancelServiceDetails, setCancelServiceDetails] = useState<any>(null);
  const [visibleModelWebView, setVisibleModelWebView] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<any>([]);

  // const [paymentDetails, setPaymentDetails] = useState<any>({});
  // const [visibleModelWebView, setVisibleModelWebView] =
  //   useState<boolean>(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [newQuoteAmount, setNewQuoteAmount] = useState('');
  const [newQuoteAmountError, setNewQuoteAmountError] = useState('');
  const { profile } = useContext<any>(AuthContext);
  useEffect(() => {
    if (item) {
      getServiceDetails();
    }
  }, []);

  useEffect(() => {
    if (cancelServiceDetails) {
      cancelScheduledServicePopupRef.current.open();
    }
  }, [cancelServiceDetails]);

  useEffect(() => {
    EventRegister.addEventListener('onPaymentCancel', (data: any) => {
      SHOW_TOAST(data?.message ?? '', 'error');
    });
    return () => {
      EventRegister.removeEventListener('onPaymentCancel');
    };
  }, []);

  async function getServiceDetails() {
    try {
      const params = {
        service_id: serviceId ? serviceId : item?.id,
      };
      setLoading(true);
      const result = await API.Instance.post(
        API.API_ROUTES.getServiceDetails,
        params,
      );
      setLoading(false);
      if (result.status) {
        setStatus(result?.data?.data?.task_status ?? '');
        setServiceDetails(result?.data?.data ?? {});
        setAttachments(normalizeAttachments(result?.data?.data?.media));
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      setLoading(false);
      SHOW_TOAST(error?.message ?? '', 'error');
      console.log(error?.message);
    } finally {
      setLoading(false);
    }
  }

  async function addFavoriteProfessional() {
    try {
      setLoading(true);
      const result = await API.Instance.post(
        API.API_ROUTES.addFavoriteProfessional +
        `/${serviceDetails?.provider?.id}`,
      );
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success');
        getServiceDetails();
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }
  async function removeFavoriteProfessional() {
    try {
      setLoading(true);
      const result = await API.Instance.delete(
        API.API_ROUTES.removeFavoriteProfessional +
        `/${serviceDetails?.provider?.id}`,
      );
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success');
        getServiceDetails();
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function onRejectReason() {
    if (selectedCategory == 0) {
      SHOW_TOAST('Please select a reason', 'error');
      return;
    }
    if (selectedCategory == 3) {
      if (reason == '') {
        SHOW_TOAST('Please enter a reason', 'error');
        return;
      }
    }

    try {
      const params = {
        failure_reason: reason,
        service_id: serviceDetails?.service_id,
        quote_id: serviceDetails?.quote_id,
      };
      setLoading(true);
      const result = await API.Instance.put(
        API.API_ROUTES.onServiceReject,
        params,
      );
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success');
        rejectRef.current.close();
        props?.navigation?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: SCREENS.BottomBar.identifier,
                params: { isValidationService: true },
              },
            ],
          }),
        );
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function onAcceptService() {
    try {
      const params = {
        service_id: serviceDetails?.service_id,
        quote_id: serviceDetails?.quote_id,
      };
      setLoading(true);
      const result = await API.Instance.put(
        API.API_ROUTES.onAcceptService + `?platform=app`,
        params,
      );
      if (result.status) {
        const STRIPE_URL = result?.data?.data?.checkout_url ?? '';
        paymentRef.current.close();
        openStripeCheckout(STRIPE_URL);
        // props.navigation.navigate(SCREENS.ServiceConfirmed.identifier, {
        //   serviceId: serviceDetails?.service_id,
        // });
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function getServiceAmount() {
    try {
      setLoading(true);
      const result = await API.Instance.get(
        API.API_ROUTES.getServiceAmount + `/${serviceDetails?.service_id}`,
      );
      if (result.status) {
        console.log('serviceAmount==>', result?.data?.data);
        setServiceAmount(result?.data?.data ?? {});
        acceptRef.current.close();
        setTimeout(() => {
          paymentRef.current.open();
        }, 500);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function getCancelServiceDetails() {
    try {
      setLoading(true);
      const result = await API.Instance.get(API.API_ROUTES.getCancelServiceDetails + `/${serviceDetails?.service_id}`);
      if (result.status) {
        console.log('result==>', result?.data)
        setCancelServiceDetails(result?.data ?? {});
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error')
      }
    } catch (error: any) {
      console.log('error==>', error)
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function cancelService(serviceId: any) {
    try {
      setLoading(true);
      const result = await API.Instance.post(API.API_ROUTES.onCancelService + `/${serviceId}`);
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success')
        setCancelServiceDetails(null);
        cancelScheduledServicePopupRef.current.close();
        props?.navigation.navigate(SCREENS.ServiceCancelled.identifier, {
          item: serviceDetails
        });
      } else {
        SHOW_TOAST(result?.data?.detail ?? '', 'error')
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  const normalizeAttachments = (data: any) => {
    const photos = (data?.photos || []).map((url: any) => ({
      id: url,
      type: 'photo',
      url,
    }));

    const videos = (data?.videos || []).map((url: any) => ({
      id: url,
      type: 'video',
      url,
    }));
    console.log('photos==>', photos);
    console.log('videos==>', videos);
    return [...photos, ...videos];
  };

  const AttachmentItem = ({ item, isfromDocumant }: any) => {
    switch (item.type) {
      case 'photo':
        return (
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate(SCREENS.WebViewScreen.identifier, {
                url: item?.url ?? '',
              });
            }}>
            <Image
              style={[isfromDocumant ? styles(theme).photosVieDocumant : styles(theme).photosView]}
              source={{ uri: item?.url ?? '' }}
            />
          </TouchableOpacity>
        );

      case 'video':
        return (
          <View style={[isfromDocumant ? styles(theme).photosVieDocumant : styles(theme).photosView]}>
            <Video
              source={{ uri: item.url }}
              resizeMode="cover"
              pointerEvents="none"
              controls
              paused={true}
              fullscreen={false}
              playInBackground={false}
              playWhenInactive={false}
              style={{ width: '100%', height: '100%' }}
            />
          </View>
        );
      default:
        return null;
    }
  };

  console.log('serviceDetails', JSON.stringify(serviceDetails))
  const handleStartNegotiation = async () => {
    if (!serviceDetails?.provider?.id) return;
    if (!newQuoteAmount || Number(newQuoteAmount) <= 0) return;

    const conversationId = buildThreadId(
      profile?.user?.id,
      serviceDetails?.service_id,
    );
    console;
    try {
      const currentUserId = profile?.user?.id;
      const currentUserName = profile?.user?.first_name;
      const providerId = serviceDetails?.provider?.id;
      const providerName = serviceDetails?.provider?.full_name;

      const baseValuation = Number(serviceDetails?.validation_amount ?? 0);
      const providerQuote = Number(
        (serviceDetails?.total_renegotiated?.[0] ||
          serviceDetails?.total_renegotiated) ??
        0,
      );

      const now = Date.now();

      const negotiationPayload = {
        serviceId: serviceDetails?.service_id,
        serviceName:
          serviceDetails?.sub_category_name || serviceDetails?.category_name,
        status: 'PENDING',
        currentTurn: '',
        currentAmount: newQuoteAmount,
        initialQuote: providerQuote,
        originalValuation: baseValuation,
        createdBy: currentUserId,
        createdAt: now,
        latestMessageId: '1',
        offers: [
          // 1️⃣ Elder valuation (original)
          {
            amount: baseValuation.toString(),
            by: currentUserId, // or serviceDetail.created_by if available
            label: 'ORIGINAL_VALUATION',
            createdAt: now - 2000,
          },

          // 2️⃣ Provider quote
          {
            amount: providerQuote.toString(),
            by: providerId,
            label: 'PROVIDER_QUOTE',
            createdAt: now - 1000,
          },

          // 3️⃣ Current user's counter offer
          {
            amount: newQuoteAmount,
            by: currentUserId,
            label: 'COUNTER',
            createdAt: now,
            userName: currentUserName,
          },
        ],
      };

      await userNegotiationMessage(
        serviceDetails?.service_id,
        serviceDetails?.sub_category_name || serviceDetails?.category_name,
        serviceDetails?.sub_category_logo ?? '',
        currentUserId,
        currentUserName,
        providerId,
        providerName,
        conversationId,
        {
          type: 'NEGOTIATION',
          text: 'hi',
          negotiation: negotiationPayload,
        },
        profile?.user?.profile_photo_url || '',
        serviceDetails?.provider?.profile_photo_url ?? '',
      );
      props.navigation.navigate(SCREENS.NegotiationDetails.identifier, {
        conversationId: conversationId,
        peerUser: {
          user_id: serviceDetails?.provider?.id,
          name: serviceDetails?.provider?.full_name,
          email: serviceDetails?.provider?.email,
          avatarUrl: serviceDetails?.provider?.profile_photo_url,
        },
      });
    } catch (error: any) {
      console.error('Negotiation error:', error?.message);
    }
  };


  return (
    <View style={[styles(theme).container,
    ]}>
      <Header
        onBack={() => {
          props.navigation.goBack();
        }}
        screenName={STRING.ViewQuote}
      />
      <ScrollView
        style={styles(theme).scrolledContainer}
        contentContainerStyle={{
          paddingBottom: status === 'pending' || status === 'accepted'
            ? getScaleSize(140)
            : getScaleSize(40),
        }}
        showsVerticalScrollIndicator={false}>
        <View style={styles(theme).imageContainer}>
          {serviceDetails?.sub_category_logo ? (
            <Image
              style={styles(theme).imageView}
              resizeMode="cover"
              source={{ uri: serviceDetails?.sub_category_logo }}
            />
          ) : (
            <View
              style={[
                styles(theme).imageView,
                { backgroundColor: theme._D5D5D5 },
              ]}
            />
          )}
          <Text
            style={{
              marginVertical: getScaleSize(12),
              marginLeft: getScaleSize(4),
            }}
            size={getScaleSize(24)}
            font={FONTS.Lato.Bold}
            color={theme.primary}>
            {serviceDetails?.sub_category_name}
          </Text>
          <View style={styles(theme).informationView}>
            <View style={styles(theme).horizontalView}>
              <View style={styles(theme).itemView}>
                <Image
                  style={styles(theme).informationIcon}
                  source={IMAGES.calender}
                />
                <Text
                  style={{
                    marginHorizontal: getScaleSize(8),
                    alignSelf: 'center',
                  }}
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={theme.primary}>
                  {serviceDetails?.chosen_datetime
                    ? moment.utc(serviceDetails?.chosen_datetime).local().format(
                      'DD MMM, YYYY',
                    )
                    : '-'}
                </Text>
              </View>
              <View style={styles(theme).itemView}>
                <Image
                  style={styles(theme).informationIcon}
                  source={IMAGES.clock}
                />
                <Text
                  style={{
                    marginHorizontal: getScaleSize(8),
                    alignSelf: 'center',
                  }}
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={theme.primary}>
                  {serviceDetails?.chosen_datetime
                    ? moment.utc(serviceDetails?.chosen_datetime).local().format('hh:mm A')
                    : '-'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles(theme).horizontalView,
                { marginTop: getScaleSize(12) },
              ]}>
              <View style={styles(theme).itemView}>
                {serviceDetails?.category_name ? (
                  <Image
                    style={[
                      styles(theme).informationIcon,
                      { tintColor: theme._1A3D51 },
                    ]}
                    source={
                      arrayIcons[
                      serviceDetails?.category_name?.toLowerCase() as keyof typeof arrayIcons
                      ] ?? (arrayIcons['diy'] as any)
                    }
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles(theme).informationIcon]} />
                )}
                <Text
                  style={{
                    marginHorizontal: getScaleSize(8),
                    alignSelf: 'center',
                  }}
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={theme.primary}>
                  {serviceDetails?.category_name}
                </Text>
              </View>
              <View style={styles(theme).itemView}>
                <Image
                  style={styles(theme).informationIcon}
                  source={IMAGES.pin}
                />
                <Text
                  style={{
                    marginHorizontal: getScaleSize(8),
                  }}
                  size={getScaleSize(12)}
                  numberOfLines={4}
                  font={FONTS.Lato.Medium}
                  color={theme.primary}>
                  {serviceDetails?.service_address ?? '-'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {(status === 'accepted' || status === 'completed' || status === 'cancelled') && (
          <View style={styles(theme).amountContainerCompleted}>
            <Text
              style={{ flex: 1.0 }}
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={theme._323232}>
              {STRING.FinalizedQuoteAmount}
            </Text>
            <Text
              style={{ flex: 1.0, marginTop: getScaleSize(8) }}
              size={getScaleSize(27)}
              font={FONTS.Lato.Bold}
              color={theme._323232}>
              {`€${serviceDetails?.total_renegotiated ?? 0}`}
            </Text>
          </View>
        )}
        {(status === 'accepted') && (
          <View style={styles(theme).amountContainerCompleted}>
            <Text
              style={{ flex: 1.0 }}
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={theme._323232}>
              {STRING.SecurityCode}
            </Text>
            {/* <FlatList
              data={serviceDetails?.service_code?.split('')}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => {
                return (
                  <View
                    style={[
                      styles(theme).securityItemContainer,
                      { marginLeft: index === 0 ? 0 : 6 },
                    ]}>
                    <Text
                      style={{ flex: 1.0 }}
                      size={getScaleSize(18)}
                      font={FONTS.Lato.Medium}
                      color={theme._323232}>
                      {item}
                    </Text>
                  </View>
                );
              }}
            /> */}
            <View style={styles(theme).codeViewDirection}>
              {serviceDetails?.service_code
                ?.toString()
                ?.split('')
                ?.map((digit: string, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles(theme).securityItemContainer,
                      { marginLeft: index === 0 ? 0 : 3 },
                    ]}>
                    <Text
                      size={getScaleSize(18)}
                      font={FONTS.Lato.Medium}
                      color={theme._323232}>
                      {digit}
                    </Text>
                  </View>
                ))}
            </View>
            <Text
              style={{ flex: 1.0, marginTop: getScaleSize(12) }}
              size={getScaleSize(11)}
              font={FONTS.Lato.Regular}
              color={'#424242'}>
              {STRING.security_note}
            </Text>
          </View>
        )}
        {status === 'pending' && (
          <View>
            <Text
              style={{ marginTop: getScaleSize(24) }}
              size={getScaleSize(18)}
              font={FONTS.Lato.SemiBold}
              color={theme._323232}>
              {STRING.QuoteAmount}
            </Text>
            <View style={styles(theme).amountContainerQuoteAmount}>
              <Text
                style={{ flex: 1.0, alignSelf: 'center' }}
                size={getScaleSize(27)}
                font={FONTS.Lato.Bold}
                color={theme._323232}>
                {`€${serviceDetails?.total_renegotiated ?? 0}`}
              </Text>
              <TouchableOpacity
                style={styles(theme).negociateButton}
                activeOpacity={1}
                onPress={async () => {
                  const conversationId = buildThreadId(
                    profile?.user?.id,
                    serviceDetails?.service_id,
                  );
                  const negotiationFieldData = await getNegotiationFieldData(
                    conversationId,
                  );
                  if (negotiationFieldData) {
                    props.navigation.navigate(
                      SCREENS.NegotiationDetails.identifier,
                      {
                        conversationId: conversationId,
                        peerUser: {
                          user_id: serviceDetails?.provider?.id,
                          name: serviceDetails?.provider?.full_name,
                          email: serviceDetails?.provider?.email,
                          avatarUrl: serviceDetails?.provider?.profile_photo_url,
                        },
                      },
                    );
                  } else {
                    setNewQuoteAmount('');
                    setNewQuoteAmountError('');
                    setShowOfferModal(true);
                  }
                }}>
                <Text
                  size={getScaleSize(14)}
                  font={FONTS.Lato.Medium}
                  color={theme.white}>
                  {STRING.Negotiate}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {status != 'open' && (
          <View style={styles(theme).profileContainer}>
            <View style={styles(theme).horizontalView}>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(18)}
                font={FONTS.Lato.SemiBold}
                color={theme._323232}>
                {STRING.Aboutprofessional}
              </Text>
              <TouchableOpacity
                activeOpacity={1}
                style={styles(theme).likeIconContainer}
                onPress={() => {
                  if (serviceDetails?.provider?.is_favorate) {
                    removeFavoriteProfessional();
                  } else {
                    addFavoriteProfessional();
                  }
                }}>
                <Image
                  style={styles(theme).likeIcon}
                  source={
                    serviceDetails?.provider?.is_favorate
                      ? IMAGES.like
                      : IMAGES.like_unfill
                  }
                />
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles(theme).horizontalView,
                { marginTop: getScaleSize(16) },
              ]}>
              {serviceDetails?.provider?.profile_photo_url ? (
                <Image
                  style={styles(theme).profilePicView}
                  resizeMode="cover"
                  source={{ uri: serviceDetails?.provider?.profile_photo_url }}
                />
              ) : (
                <Image
                  style={styles(theme).profilePicView}
                  source={IMAGES.user_placeholder}
                />
              )}
              <Text
                style={{ alignSelf: 'center', marginLeft: getScaleSize(16) }}
                size={getScaleSize(20)}
                font={FONTS.Lato.SemiBold}
                color={'#0F232F'}>
                {serviceDetails?.provider?.full_name ?? ''}
              </Text>
              {serviceDetails?.provider?.is_verified && (
                <Image
                  style={{
                    height: getScaleSize(25),
                    width: getScaleSize(25),
                    alignSelf: 'center',
                    marginLeft: getScaleSize(6),
                  }}
                  source={IMAGES.verify}
                />
              )}
            </View>
            <View
              style={[
                styles(theme).horizontalView,
                { marginTop: getScaleSize(16) },
              ]}>
              <TouchableOpacity
                activeOpacity={1}
                style={[styles(theme).newButton, { marginRight: getScaleSize(6) }]}
                onPress={() => {
                  const conversationId = buildThreadId(
                    profile?.user?.id,
                    serviceDetails?.provider?.id,
                  );
                  props.navigation.navigate(SCREENS.ChatDetails.identifier, {
                    conversationId: conversationId,
                    peerUser: {
                      user_id: serviceDetails?.provider?.id,
                      name: serviceDetails?.provider?.full_name,
                      email: serviceDetails?.provider?.email,
                      avatarUrl: serviceDetails?.provider?.profile_photo_url,
                    },
                  });
                }}>
                <Text
                  size={getScaleSize(14)}
                  font={FONTS.Lato.Medium}
                  color={theme.white}>
                  {STRING.Chat}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                style={[styles(theme).newButton, { marginLeft: getScaleSize(6) }]}
                onPress={() => {
                  props.navigation.navigate(SCREENS.OtherUserProfile.identifier, {
                    item: serviceDetails?.provider,
                  });
                }}>
                <Text
                  size={getScaleSize(14)}
                  font={FONTS.Lato.Medium}
                  color={theme.white}>
                  {STRING.ViewProfile}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {status === 'pending' && (
          <>
            <Text
              style={{ marginTop: getScaleSize(24) }}
              size={getScaleSize(18)}
              font={FONTS.Lato.SemiBold}
              color={theme._323232}>
              {STRING.Personalizedshortmessage}
            </Text>
            <View style={styles(theme).serviceDescriptionView}>
              <Text
                size={getScaleSize(18)}
                font={FONTS.Lato.Regular}
                color={theme._555555}>
                {serviceDetails?.personilized_short_message ?? '-'}
              </Text>
            </View>
            <Text
              style={{ marginTop: getScaleSize(24) }}
              size={getScaleSize(18)}
              font={FONTS.Lato.SemiBold}
              color={theme._323232}>
              {STRING.Supportingdocuments}
            </Text>
            <FlatList
              data={serviceDetails?.media?.supporting_docs ?? []}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: getScaleSize(16),
                marginTop: getScaleSize(12),
              }}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    style={[styles(theme).uploadButton]}
                    activeOpacity={1}
                    onPress={() => {
                      props.navigation.navigate(SCREENS.WebViewScreen.identifier, {
                        url: item,
                      });
                    }}>
                    <Image
                      style={styles(theme).attachmentIcon}
                      source={IMAGES.pdf_icon}
                    />
                    <Text
                      style={{ marginTop: getScaleSize(8) }}
                      size={getScaleSize(15)}
                      font={FONTS.Lato.Regular}
                      color={theme._818285}>
                      {STRING.ViewDocument}
                    </Text>
                  </TouchableOpacity>

                );
              }}
            />
            <Text
              style={{ marginTop: getScaleSize(24), marginBottom: getScaleSize(12) }}
              size={getScaleSize(18)}
              font={FONTS.Lato.SemiBold}
              color={theme._323232}>
              {STRING.Shortvideos}
            </Text>
            <FlatList
              data={attachments ?? []}
              numColumns={2}
              columnWrapperStyle={{ gap: getScaleSize(12) }}
              contentContainerStyle={{ gap: getScaleSize(12) }}
              keyExtractor={(item: any, index: number) => index.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <AttachmentItem isfromDocumant={true} item={item} />}
            />
          </>
        )}
        {status !== 'pending' && (
          <View
            style={[
              styles(theme).profileContainer,
              { paddingVertical: getScaleSize(26) },
            ]}>
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
              activeOpacity={1}
              onPress={() => {
                setIsStatus(!isStatus);
              }}>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(18)}
                font={FONTS.Lato.Medium}
                color={theme._323232}>
                {STRING.CheckStatus}
              </Text>
              <TouchableOpacity
                style={{ height: getScaleSize(25), width: getScaleSize(24) }}
                activeOpacity={1}
                onPress={() => {
                  setIsStatus(!isStatus);
                }}>
                <Image
                  style={{ height: getScaleSize(25), width: getScaleSize(24) }}
                  source={isStatus ? IMAGES.up : IMAGES.down}
                />
              </TouchableOpacity>
            </TouchableOpacity>
            {isStatus && (
              <>
                <View style={styles(theme).devider}></View>
                <View style={{ marginTop: getScaleSize(32) }}>
                  {serviceDetails?.lifecycle?.map((item: any, index: number) => (
                    <StatusItem
                      key={index}
                      item={item}
                      index={index}
                      securityCode={serviceDetails?.security_code ?? ''}
                      isLast={index === serviceDetails?.lifecycle?.length - 1}
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        )}
        {status !== 'pending' && (
          <View
            style={[
              styles(theme).profileContainer,
              { paddingVertical: getScaleSize(26) },
            ]}>
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
              activeOpacity={1}
              onPress={() => {
                setVisibleTaskDetails(!visibleTaskDetails);
              }}>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(18)}
                font={FONTS.Lato.SemiBold}
                color={theme._323232}>
                {STRING.TaskDetails}
              </Text>
              <TouchableOpacity
                style={{ height: getScaleSize(25), width: getScaleSize(24) }}
                activeOpacity={1}
                onPress={() => {
                  setVisibleTaskDetails(!visibleTaskDetails);
                }}>
                <Image
                  style={{ height: getScaleSize(25), width: getScaleSize(24) }}
                  source={visibleTaskDetails ? IMAGES.up : IMAGES.down}
                />
              </TouchableOpacity>
            </TouchableOpacity>
            {visibleTaskDetails && (
              <>
                <View style={styles(theme).devider}></View>
                <Text
                  style={{ flex: 1.0, marginTop: getScaleSize(20) }}
                  size={getScaleSize(18)}
                  font={FONTS.Lato.SemiBold}
                  color={'#424242'}>
                  {STRING.Servicedescription}
                </Text>
                <Text
                  style={{ flex: 1.0, marginTop: getScaleSize(16) }}
                  size={getScaleSize(14)}
                  font={FONTS.Lato.Medium}
                  color={theme._939393}>
                  {serviceDetails?.service_description ?? '-'}
                </Text>
                <Text
                  style={{ flex: 1.0, marginTop: getScaleSize(20), marginBottom: getScaleSize(8) }}
                  size={getScaleSize(18)}
                  font={FONTS.Lato.SemiBold}
                  color={'#424242'}>
                  {STRING.Jobphotos}
                </Text>
                <FlatList
                  data={attachments ?? []}
                  numColumns={2}
                  columnWrapperStyle={{ gap: getScaleSize(12) }}
                  contentContainerStyle={{ gap: getScaleSize(12) }}
                  keyExtractor={(item: any, index: number) => index.toString()}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => <AttachmentItem item={item} />}
                />
              </>
            )}
          </View>
        )}
        {(status === 'accepted' || status === 'completed' || status === 'cancelled') && (
          <View style={styles(theme).informationContainer}>
            <Text
              size={getScaleSize(18)}
              font={FONTS.Lato.SemiBold}
              color={theme._323232}>
              {STRING.FinalPaymentBreakdown}
            </Text>
            <View style={styles(theme).newHorizontalView}>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(14)}
                font={FONTS.Lato.SemiBold}
                color={'#595959'}>
                {STRING.FinalizedQuoteAmount}
              </Text>
              <Text
                size={getScaleSize(14)}
                font={FONTS.Lato.SemiBold}
                color={'#595959'}>
                {`€${serviceDetails?.payment_breakdown?.finalize_quote_amount ?? 0}`}
              </Text>
            </View>
            <View style={styles(theme).newHorizontalView}>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(14)}
                font={FONTS.Lato.SemiBold}
                color={'#595959'}>
                {STRING.PlatformFee}
              </Text>
              <Text
                size={getScaleSize(14)}
                font={FONTS.Lato.SemiBold}
                color={'#595959'}>
                {`€${serviceDetails?.payment_breakdown?.platform_fees ?? 0}`}
              </Text>
            </View>
            <View style={styles(theme).newHorizontalView}>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(14)}
                font={FONTS.Lato.SemiBold}
                color={'#595959'}>
                {STRING.Taxes}
              </Text>
              <Text
                size={getScaleSize(14)}
                font={FONTS.Lato.SemiBold}
                color={'#595959'}>
                {`€${serviceDetails?.payment_breakdown?.tax ?? 0}`}
              </Text>
            </View>
            <View style={styles(theme).dotView} />
            <View style={styles(theme).newHorizontalView}>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(20)}
                font={FONTS.Lato.SemiBold}
                color={'#0F232F'}>
                {STRING.Total}
              </Text>
              <Text
                size={getScaleSize(20)}
                font={FONTS.Lato.SemiBold}
                color={theme.primary}>
                {`€${serviceDetails?.payment_breakdown?.total_renegotiated ?? 0}`}
              </Text>
            </View>
          </View>
        )}
        {/* <View style={{ height: getScaleSize(50) }} /> */}
      </ScrollView>
      {status === 'pending' && (
        <View style={styles(theme).buttonContainer}>
          <TouchableOpacity
            style={styles(theme).backButtonContainer}
            activeOpacity={1}
            onPress={() => {
              rejectRef.current.open();
            }}>
            <Text
              size={getScaleSize(19)}
              font={FONTS.Lato.Bold}
              color={theme.primary}
              style={{ alignSelf: 'center' }}>
              {STRING.Reject}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles(theme).nextButtonContainer}
            activeOpacity={1}
            onPress={() => {
              acceptRef.current.open();
            }}>
            <Text
              size={getScaleSize(19)}
              font={FONTS.Lato.Bold}
              color={theme.white}
              style={{ alignSelf: 'center' }}>
              {STRING.Accept}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {status === 'pending' && (
        <RejectBottomPopup
          rejectRef={rejectRef}
          selectedCategory={selectedCategory}
          reason={reason}
          setSelectedCategory={setSelectedCategory}
          setReason={setReason}
          onClose={() => {
            rejectRef.current.close();
          }}
          onReject={() => {
            onRejectReason();
          }}
        />
      )}
      {status === 'pending' && (
        <AcceptBottomPopup
          onRef={acceptRef}
          title={`You are about to confirm a service at the rate of €${serviceDetails?.total_renegotiated ?? 0} with the Provider ${serviceDetails?.provider?.full_name ?? ''}, Are you sure you want to continue? `}
          onClose={() => {
            acceptRef.current.close();
          }}
          onNavigate={() => {
            getServiceAmount();
          }}
        />
      )}
      {status === 'pending' && (
        <PaymentBottomPopup
          onRef={paymentRef}
          serviceAmount={serviceAmount}
          onClose={() => {
            paymentRef.current.close();
          }}
          proceedToPay={() => {
            onAcceptService();
          }}
        />
      )}
      {status === 'completed' && (
        <Button
          title={STRING.WriteaReview}
          style={{
            marginHorizontal: getScaleSize(22),
            marginVertical: getScaleSize(24),
          }}
          onPress={() => {
            props.navigation.navigate(SCREENS.WriteReview.identifier, { serviceId: serviceDetails?.service_id });
          }}
        />
      )}
      {status === 'accepted' && (
        <View style={styles(theme).buttonContainer}>
          <TouchableOpacity
            style={styles(theme).backButtonContainer}
            activeOpacity={1}
            onPress={() => {
              getCancelServiceDetails()
            }}>
            <Text
              size={getScaleSize(19)}
              font={FONTS.Lato.Bold}
              color={theme.primary}
              style={{ alignSelf: 'center' }}>
              {STRING.Cancel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles(theme).nextButtonContainer}
            activeOpacity={1}
            onPress={() => {
              props.navigation.navigate(SCREENS.ChatDetails.identifier, {
                conversationId: profile?.user?.id,
                peerUser: {
                  user_id: serviceDetails?.provider?.id,
                  name: serviceDetails?.provider?.full_name,
                  email: serviceDetails?.provider?.email,
                  avatarUrl: serviceDetails?.provider?.profile_photo_url,
                },
              });
            }}>
            <Text
              size={getScaleSize(19)}
              font={FONTS.Lato.Bold}
              color={theme.white}
              style={{ alignSelf: 'center' }}>
              {STRING.Chat}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <CancelScheduledServicePopup
        onRef={cancelScheduledServicePopupRef}
        height={getScaleSize(530)}
        cancelServiceDetails={cancelServiceDetails}
        onClose={() => {
          cancelScheduledServicePopupRef.current.close();
          setCancelServiceDetails(null);
        }}
        onCancel={(item: any) => {
          console.log('item==>', item)
          if (item) {
            cancelService(item)
          }
        }}
      />
      <AcceptBottomPopup
        onRef={acceptRef}
        title={`You are about to confirm a service at the rate of €${serviceDetails?.total_renegotiated ?? 0
          } with the Provider ${serviceDetails?.provider?.full_name ?? ''}, Are you sure you want to continue? `}
        onClose={() => {
          acceptRef.current.close();
        }}
        onNavigate={() => {
          getServiceAmount();
        }}
      />
      <PaymentBottomPopup
        onRef={paymentRef}
        serviceAmount={serviceAmount}
        onClose={() => {
          paymentRef.current.close();
        }}
        proceedToPay={() => {
          onAcceptService();
        }}
      />
      <Modal
        visible={showOfferModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOfferModal(false)}>
        <View style={styles(theme).modalOverlay}>
          <View style={styles(theme).modalContent}>
            <Text
              size={getScaleSize(18)}
              font={FONTS.Lato.SemiBold}
              color={theme._323232}
              style={{ marginBottom: getScaleSize(16) }}>
              Enter Your Offer Amount
            </Text>
            <View
              style={[
                styles(theme).inputContainer,
                {
                  borderColor: newQuoteAmountError
                    ? theme._EF5350
                    : theme._D5D5D5,
                },
              ]}>
              <TextInput
                style={styles(theme).offerInput}
                placeholder={'€0.00'}
                placeholderTextColor={theme._818285}
                value={newQuoteAmount ? `€${newQuoteAmount}` : ''}
                keyboardType="decimal-pad"
                onChangeText={(text: string) => {
                  setNewQuoteAmount(text.replace('€', ''));
                  if (text.replace('€', '').trim() === '') {
                    setNewQuoteAmountError('Please enter an offer amount');
                  } else {
                    setNewQuoteAmountError('');
                  }
                }}
              />
            </View>
            {newQuoteAmountError ? (
              <Text
                style={{ marginTop: getScaleSize(8) }}
                size={getScaleSize(12)}
                font={FONTS.Lato.Regular}
                color={theme._EF5350}>
                {newQuoteAmountError}
              </Text>
            ) : null}
            <View style={styles(theme).modalButtonContainer}>
              <TouchableOpacity
                style={styles(theme).modalCancelButton}
                activeOpacity={0.8}
                onPress={() => setShowOfferModal(false)}>
                <Text
                  size={getScaleSize(16)}
                  font={FONTS.Lato.Medium}
                  color={theme.primary}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles(theme).modalSubmitButton}
                activeOpacity={0.8}
                onPress={async () => {
                  if (!newQuoteAmount || newQuoteAmount.trim() === '') {
                    setNewQuoteAmountError('Please enter an offer amount');
                    return;
                  }

                  await handleStartNegotiation();

                  setShowOfferModal(false);
                }}>
                <Text
                  size={getScaleSize(16)}
                  font={FONTS.Lato.Medium}
                  color={theme.white}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* <ModelWebView
        visible={visibleModelWebView}
        onRequestClose={() => {
          setVisibleModelWebView(false);
        }}
        item={paymentDetails}
      /> */}
      {isLoading && <ProgressView />}
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.white },
    scrolledContainer: {
      marginTop: getScaleSize(19),
      marginHorizontal: getScaleSize(24),
    },
    imageContainer: {
      paddingVertical: getScaleSize(12),
      paddingHorizontal: getScaleSize(12),
      borderRadius: getScaleSize(20),
      backgroundColor: '#EAF0F3',
    },
    imageView: {
      height: getScaleSize(172),
      borderRadius: getScaleSize(20),
      overflow: 'hidden',
      flex: 1.0,
    },
    informationView: {
      paddingVertical: getScaleSize(16),
      backgroundColor: theme.white,
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(16),
    },
    horizontalView: {
      flexDirection: 'row',
    },
    itemView: {
      flexDirection: 'row',
      flex: 1.0,
    },
    informationIcon: {
      height: getScaleSize(25),
      width: getScaleSize(25),
      alignSelf: 'center',
    },
    amountContainer: {
      marginTop: getScaleSize(24),
      paddingVertical: getScaleSize(9),
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(16),
      flexDirection: 'row',
      paddingHorizontal: getScaleSize(16),
    },
    amountContainerCompleted: {
      marginTop: getScaleSize(24),
      paddingVertical: getScaleSize(9),
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(16),
    },
    amountContainerQuoteAmount: {
      marginTop: getScaleSize(12),
      paddingVertical: getScaleSize(9),
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(16),
      flexDirection: 'row',
      paddingHorizontal: getScaleSize(16),
    },
    negociateButton: {
      paddingVertical: getScaleSize(10),
      paddingHorizontal: getScaleSize(20),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: getScaleSize(8),
      backgroundColor: theme.primary,
    },
    profileContainer: {
      borderColor: '#D5D5D5',
      paddingVertical: getScaleSize(13),
      paddingHorizontal: getScaleSize(16),
      borderWidth: 1,
      borderRadius: getScaleSize(16),
      marginTop: getScaleSize(24),
    },
    likeIcon: {
      height: getScaleSize(16),
      width: getScaleSize(16),
      alignSelf: 'center',
    },
    likeIconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      height: getScaleSize(28),
      width: getScaleSize(28),
      backgroundColor: theme._F5F5F5,
      borderRadius: getScaleSize(14),
    },
    profilePicView: {
      height: getScaleSize(56),
      width: getScaleSize(56),
      borderRadius: getScaleSize(28),
    },
    newButton: {
      flex: 1.0,
      backgroundColor: theme.primary,
      borderRadius: 8,
      height: getScaleSize(38),
      justifyContent: 'center',
      alignItems: 'center',
    },
    serviceDescriptionView: {
      marginTop: getScaleSize(12),
      borderWidth: 1,
      borderColor: theme._D5D5D5,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    imageUploadContent: {
      flexDirection: 'row',
    },
    uploadButton: {
      width: (Dimensions.get('window').width - getScaleSize(66)) / 2,
      borderWidth: 1,
      borderColor: theme._818285,
      borderStyle: 'dashed',
      borderRadius: getScaleSize(8),
      justifyContent: 'center',
      alignItems: 'center',
      height: getScaleSize(160),
    },
    attachmentIcon: {
      height: getScaleSize(40),
      width: getScaleSize(40),
      alignSelf: 'center',
    },
    photosView: {
      height: getScaleSize(144),
      width: (Dimensions.get('window').width - getScaleSize(96)) / 2,
      borderRadius: getScaleSize(8),
      overflow: 'hidden',
      backgroundColor: theme._EAF0F3,
    },
    photosVieDocumant: {
      height: getScaleSize(144),
      width: (Dimensions.get('window').width - getScaleSize(60)) / 2,
      borderRadius: getScaleSize(8),
      overflow: 'hidden',
      backgroundColor: theme._EAF0F3,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      paddingHorizontal: getScaleSize(22),
      paddingTop: getScaleSize(12),
      backgroundColor: theme.white,
      borderTopWidth: 1,
      borderTopColor: '#E6E6E6',
    },
    backButtonContainer: {
      flex: 1.0,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: getScaleSize(12),
      paddingVertical: getScaleSize(18),
      backgroundColor: theme.white,
      marginRight: getScaleSize(8),
    },
    nextButtonContainer: {
      flex: 1.0,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: getScaleSize(12),
      paddingVertical: getScaleSize(18),
      backgroundColor: theme.primary,
      marginLeft: getScaleSize(8),
    },
    devider: {
      backgroundColor: '#E6E6E6',
      height: 1,
      marginTop: getScaleSize(18),
    },
    securityItemContainer: {
      paddingVertical: getScaleSize(5),
      paddingHorizontal: getScaleSize(11.11),
      borderRadius: getScaleSize(12),
      borderColor: '#D5D5D5',
      borderWidth: 1,
      marginTop: getScaleSize(16),
    },
    informationContainer: {
      marginTop: getScaleSize(24),
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(24),
      paddingVertical: getScaleSize(24),
    },
    newHorizontalView: {
      flexDirection: 'row',
      marginTop: getScaleSize(8),
    },
    dotView: {
      // flex:1.0,
      borderStyle: 'dashed',
      borderColor: theme.primary,
      borderWidth: 1,
      marginTop: getScaleSize(8),
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.white,
      borderRadius: getScaleSize(16),
      padding: getScaleSize(24),
      width: '85%',
      maxWidth: getScaleSize(350),
    },
    inputContainer: {
      borderWidth: 1,
      borderRadius: getScaleSize(12),
      paddingHorizontal: getScaleSize(16),
      height: getScaleSize(56),
      justifyContent: 'center',
    },
    offerInput: {
      fontSize: getScaleSize(16),
      color: theme._323232,
      padding: 0,
    },
    modalButtonContainer: {
      flexDirection: 'row',
      marginTop: getScaleSize(24),
      gap: getScaleSize(12),
    },
    modalCancelButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: getScaleSize(8),
      paddingVertical: getScaleSize(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalSubmitButton: {
      flex: 1,
      backgroundColor: theme.primary,
      borderRadius: getScaleSize(8),
      paddingVertical: getScaleSize(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    codeViewDirection: {
      flexDirection: 'row',
      marginTop: getScaleSize(16)
    }
  });
