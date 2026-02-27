import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';

//ASSETS
import {FONTS, IMAGES} from '../../assets';

//CONTEXT
import {AuthContext, ThemeContext, ThemeContextType} from '../../context';

//CONSTANT
import {arrayIcons, getScaleSize, SHOW_TOAST, useString} from '../../constant';

//COMPONENT
import {
  Button,
  CancelScheduledServicePopup,
  Header,
  ProgressView,
  StatusItem,
  Text,
} from '../../components';

//PACKAGES
import {SCREENS} from '..';
import {API} from '../../api';
import moment from 'moment';
import {buildThreadId} from '../../services/chat';

export default function CompletedTaskDetails(props: any) {
  const STRING = useString();
  const {theme} = useContext<any>(ThemeContext);

  const [isStatus, setIsStatus] = useState(false);
  const [visibleTaskDetails, setVisibleTaskDetails] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [serviceDetails, setServiceDetails] = useState<any>({});
  const [cancelServiceDetails, setCancelServiceDetails] = useState<any>(null);
  const {profile} = useContext<any>(AuthContext);
  const cancelScheduledServicePopupRef = useRef<any>(null);

  const item = props?.route?.params?.item ?? {};
  const serviceId = props?.route?.params?.serviceId ?? '';

  useEffect(() => {
    getServiceDetails();
  }, []);

  useEffect(() => {
    if (cancelServiceDetails) {
      cancelScheduledServicePopupRef.current.open();
    }
  }, [cancelServiceDetails]);

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
        setServiceDetails(result?.data?.data ?? {});
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      setLoading(false);
      SHOW_TOAST(error?.message ?? '', 'error');
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

  async function getCancelServiceDetails() {
    try {
      setLoading(true);
      const result = await API.Instance.get(
        API.API_ROUTES.getCancelServiceDetails +
          `/${serviceDetails?.service_id}`,
      );
      if (result.status) {
        console.log('result==>', result?.data);
        setCancelServiceDetails(result?.data ?? {});
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      console.log('error==>', error);
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function cancelService(serviceId: any) {
    try {
      setLoading(true);
      const result = await API.Instance.post(
        API.API_ROUTES.onCancelService + `/${serviceId}`,
      );
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success');
        cancelScheduledServicePopupRef.current.close();
        props?.navigation.navigate(SCREENS.ServiceCancelled.identifier, {
          item: result?.data?.data ?? null,
        });
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles(theme).container}>
      <Header
        onBack={() => {
          props.navigation.goBack();
        }}
        screenName={STRING.TaskDetails}
      />
      <ScrollView
        style={styles(theme).scrolledContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles(theme).imageContainer}>
          {serviceDetails?.sub_category_logo ? (
            <Image
              style={styles(theme).imageView}
              source={{
                uri: serviceDetails?.sub_category_logo,
              }}
            />
          ) : (
            <View
              style={[
                styles(theme).imageView,
                {backgroundColor: theme._D5D5D5},
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
            {serviceDetails?.sub_category_name ?? ''}
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
                    ? moment
                        .utc(serviceDetails?.chosen_datetime)
                        .local()
                        .format('DD MMM, YYYY')
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
                    ? moment
                        .utc(serviceDetails?.chosen_datetime)
                        .local()
                        .format('hh:mm A')
                    : '-'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles(theme).horizontalView,
                {marginTop: getScaleSize(12)},
              ]}>
              <View style={styles(theme).itemView}>
                {serviceDetails?.category_name ? (
                  <Image
                    style={[
                      styles(theme).informationIcon,
                      {tintColor: theme._1A3D51},
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
                  {serviceDetails?.category_name ?? ''}
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
                    alignSelf: 'center',
                  }}
                  size={getScaleSize(12)}
                  numberOfLines={4}
                  font={FONTS.Lato.Medium}
                  color={theme.primary}>
                  {serviceDetails?.elder_address ?? '-'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles(theme).amountContainer}>
          <Text
            style={{flex: 1.0}}
            size={getScaleSize(18)}
            font={FONTS.Lato.Medium}
            color={theme._323232}>
            {STRING.FinalizedQuoteAmount}
          </Text>
          <Text
            style={{flex: 1.0, marginTop: getScaleSize(8)}}
            size={getScaleSize(27)}
            font={FONTS.Lato.Bold}
            color={theme._323232}>
            {`€${serviceDetails?.total_renegotiated ?? 0}`}
          </Text>
        </View>
        {serviceDetails?.task_status === 'accepted' && (
          <View style={styles(theme).amountContainer}>
            <Text
              style={{flex: 1.0}}
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={theme._323232}>
              {STRING.SecurityCode}
            </Text>
            <FlatList
              data={['1', '2', '3', '4', '5', '6', '.', '.', '.']}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({item, index}) => {
                return (
                  <View
                    style={[
                      styles(theme).securityItemContainer,
                      {marginLeft: index === 0 ? 0 : 6},
                    ]}>
                    <Text
                      style={{flex: 1.0}}
                      size={getScaleSize(18)}
                      font={FONTS.Lato.Medium}
                      color={theme._323232}>
                      {item}
                    </Text>
                  </View>
                );
              }}
            />
            <Text
              style={{flex: 1.0, marginTop: getScaleSize(12)}}
              size={getScaleSize(11)}
              font={FONTS.Lato.Regular}
              color={'#424242'}>
              {STRING.security_note}
            </Text>
          </View>
        )}
        <View style={styles(theme).profileContainer}>
          <View style={styles(theme).horizontalView}>
            <Text
              style={{flex: 1.0}}
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
              {marginTop: getScaleSize(16)},
            ]}>
            {serviceDetails?.provider?.profile_photo_url ? (
              <Image
                style={styles(theme).profilePicView}
                resizeMode="cover"
                source={{uri: serviceDetails?.provider?.profile_photo_url}}
              />
            ) : (
              <Image
                style={styles(theme).profilePicView}
                source={IMAGES.user_placeholder}
              />
            )}
            <Text
              style={{alignSelf: 'center', marginLeft: getScaleSize(16)}}
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
              {marginTop: getScaleSize(16)},
            ]}>
            <TouchableOpacity
              activeOpacity={1}
              style={[styles(theme).newButton, {marginRight: getScaleSize(6)}]}
              onPress={() => {
                const conversationId = buildThreadId(
                  serviceDetails?.elderly_user?.id,
                  profile?.user?.id,
                );
                props.navigation.navigate(SCREENS.ChatDetails.identifier, {
                  conversationId: conversationId,
                  peerUser: {
                    user_id: serviceDetails?.elderly_user?.id,
                    name: serviceDetails?.elderly_user?.first_name,
                    email: serviceDetails?.elderly_user?.email,
                    avatarUrl: serviceDetails?.elderly_user?.profile_photo_url,
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
              style={[styles(theme).newButton, {marginLeft: getScaleSize(6)}]}
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
        <View
          style={[
            styles(theme).profileContainer,
            {paddingVertical: getScaleSize(26)},
          ]}>
          <TouchableOpacity
            style={{flexDirection: 'row'}}
            activeOpacity={1}
            onPress={() => {
              setIsStatus(!isStatus);
            }}>
            <Text
              style={{flex: 1.0}}
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={theme._323232}>
              {STRING.CheckStatus}
            </Text>
            <TouchableOpacity
              style={{height: getScaleSize(25), width: getScaleSize(24)}}
              activeOpacity={1}
              onPress={() => {
                setIsStatus(!isStatus);
              }}>
              <Image
                style={{height: getScaleSize(25), width: getScaleSize(24)}}
                source={isStatus ? IMAGES.up : IMAGES.down}
              />
            </TouchableOpacity>
          </TouchableOpacity>
          {isStatus && (
            <>
              <View style={styles(theme).devider}></View>
              <View style={{marginTop: getScaleSize(32)}}>
                {serviceDetails?.lifecycle?.map((item: any, index: number) => (
                  <StatusItem
                    key={index}
                    item={item}
                    index={index}
                    isLast={index === serviceDetails?.lifecycle?.length - 1}
                  />
                ))}
              </View>
            </>
          )}
        </View>
        <View
          style={[
            styles(theme).profileContainer,
            {paddingVertical: getScaleSize(26)},
          ]}>
          <TouchableOpacity
            style={{flexDirection: 'row'}}
            activeOpacity={1}
            onPress={() => {
              setVisibleTaskDetails(!visibleTaskDetails);
            }}>
            <Text
              style={{flex: 1.0}}
              size={getScaleSize(18)}
              font={FONTS.Lato.SemiBold}
              color={theme._323232}>
              {STRING.TaskDetails}
            </Text>
            <TouchableOpacity
              style={{height: getScaleSize(25), width: getScaleSize(24)}}
              activeOpacity={1}
              onPress={() => {
                setVisibleTaskDetails(!visibleTaskDetails);
              }}>
              <Image
                style={{height: getScaleSize(25), width: getScaleSize(24)}}
                source={visibleTaskDetails ? IMAGES.up : IMAGES.down}
              />
            </TouchableOpacity>
          </TouchableOpacity>
          {visibleTaskDetails && (
            <>
              <View style={styles(theme).devider}></View>
              <Text
                style={{flex: 1.0, marginTop: getScaleSize(20)}}
                size={getScaleSize(18)}
                font={FONTS.Lato.SemiBold}
                color={'#424242'}>
                {STRING.Servicedescription}
              </Text>
              <Text
                style={{flex: 1.0, marginTop: getScaleSize(16)}}
                size={getScaleSize(14)}
                font={FONTS.Lato.Medium}
                color={theme._939393}>
                {serviceDetails?.service_description ?? '-'}
              </Text>
              {serviceDetails?.media?.photos?.length > 0 && (
                <Text
                  style={{flex: 1.0, marginTop: getScaleSize(20)}}
                  size={getScaleSize(18)}
                  font={FONTS.Lato.SemiBold}
                  color={'#424242'}>
                  {STRING.Jobphotos}
                </Text>
              )}
              <FlatList
                data={serviceDetails?.media?.photos ?? []}
                horizontal
                keyExtractor={(item: any, index: number) => index.toString()}
                showsHorizontalScrollIndicator={false}
                renderItem={({item, index}) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        props.navigation.navigate(
                          SCREENS.WebViewScreen.identifier,
                          {
                            url: item,
                          },
                        );
                      }}>
                      <Image
                        style={[styles(theme).photosView]}
                        source={{uri: item}}
                      />
                    </TouchableOpacity>
                  );
                }}
              />
              <FlatList
                data={serviceDetails?.media?.videos ?? []}
                horizontal
                keyExtractor={(item: any, index: number) => index.toString()}
                showsHorizontalScrollIndicator={false}
                renderItem={({item, index}) => {
                  return (
                    <Image
                      style={[styles(theme).photosView]}
                      source={{uri: item}}
                    />
                  );
                }}
              />
            </>
          )}
        </View>
        <View style={styles(theme).informationContainer}>
          <Text
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={theme._323232}>
            {STRING.FinalPaymentBreakdown}
          </Text>
          <View style={styles(theme).newHorizontalView}>
            <Text
              style={{flex: 1.0}}
              size={getScaleSize(14)}
              font={FONTS.Lato.SemiBold}
              color={'#595959'}>
              {STRING.FinalizedQuoteAmount}
            </Text>
            <Text
              size={getScaleSize(14)}
              font={FONTS.Lato.SemiBold}
              color={'#595959'}>
              {`€${serviceDetails?.payment_breakdown?.total_amount ?? 0}`}
            </Text>
          </View>
          <View style={styles(theme).newHorizontalView}>
            <Text
              style={{flex: 1.0}}
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
              style={{flex: 1.0}}
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
              style={{flex: 1.0}}
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
        <View style={{height: getScaleSize(16)}} />
      </ScrollView>
      {serviceDetails?.task_status === 'completed' && (
        <Button
          title={STRING.WriteaReview}
          style={{
            marginHorizontal: getScaleSize(22),
            marginVertical: getScaleSize(24),
          }}
          onPress={() => {
            props.navigation.navigate(SCREENS.WriteReview.identifier, {
              serviceId: serviceDetails?.service_id,
            });
          }}
        />
      )}
      {serviceDetails?.task_status === 'accepted' && (
        <View style={styles(theme).buttonContainer}>
          <TouchableOpacity
            style={styles(theme).backButtonContainer}
            activeOpacity={1}
            onPress={() => {
              getCancelServiceDetails();
            }}>
            <Text
              size={getScaleSize(19)}
              font={FONTS.Lato.Bold}
              color={theme.primary}
              style={{alignSelf: 'center'}}>
              {STRING.Cancel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles(theme).nextButtonContainer}
            activeOpacity={1}
            onPress={() => {}}>
            <Text
              size={getScaleSize(19)}
              font={FONTS.Lato.Bold}
              color={theme.white}
              style={{alignSelf: 'center'}}>
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
          if (item) {
            cancelService(item);
          }
          setCancelServiceDetails(null);
        }}
      />
      {isLoading && <ProgressView />}
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: theme.white},
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
      marginTop: getScaleSize(32),
      paddingVertical: getScaleSize(9),
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(16),
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
      width: 86,
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
      marginTop: getScaleSize(12),
      flexDirection: 'row',
    },
    uploadButton: {
      flex: 1.0,
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
      width: getScaleSize(180),
      borderRadius: 8,
      resizeMode: 'cover',
      marginTop: getScaleSize(18),
    },
    buttonContainer: {
      flexDirection: 'row',
      marginHorizontal: getScaleSize(22),
      marginVertical: getScaleSize(24),
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
    securityItemContainer: {
      paddingVertical: getScaleSize(8),
      paddingHorizontal: getScaleSize(12),
      borderRadius: getScaleSize(12),
      borderColor: '#D5D5D5',
      borderWidth: 1,
      marginTop: getScaleSize(16),
    },
    devider: {
      backgroundColor: '#E6E6E6',
      height: 1,
      marginTop: getScaleSize(18),
    },
    dotView: {
      // flex:1.0,
      borderStyle: 'dashed',
      borderColor: theme.primary,
      borderWidth: 1,
      marginTop: getScaleSize(8),
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
    likeIconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      height: getScaleSize(28),
      width: getScaleSize(28),
      backgroundColor: theme._F5F5F5,
      borderRadius: getScaleSize(14),
    },
  });
