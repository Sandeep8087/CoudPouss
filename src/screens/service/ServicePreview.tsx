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
} from 'react-native';

//API
import { API } from '../../api';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { arrayIcons, getScaleSize, SHOW_TOAST, useString } from '../../constant';

//COMPONENT
import {
  AcceptBottomPopup,
  Button,
  Header,
  PaymentBottomPopup,
  ProgressView,
  RejectBottomPopup,
  RequestItem,
  SearchComponent,
  StatusItem,
  Text,
} from '../../components';

//PACKAGES
import { useFocusEffect } from '@react-navigation/native'; import moment from 'moment';

//SCREENS
import { SCREENS } from '..';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ServicePreview(props: any) {

  const insets = useSafeAreaInsets();

  const STRING = useString();

  const { theme } = useContext<any>(ThemeContext);

  const { profile } = useContext(AuthContext)

  const serviceData = props?.route?.params?.serviceData
  const isFromHome = props?.route?.params?.isFromHome ?? false;

  const [isStatus, setIsStatus] = useState(false);
  const [visibleTaskDetails, setVisibleTaskDetails] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [serviceDetails, setServiceDetails] = useState<any>("")

  useEffect(() => {
    getServicesDetails()
  }, [])

  async function getServicesDetails() {
    try {
      setLoading(true)
      const result = await API.Instance.get(API.API_ROUTES.getProfessionalServiceDetails + `/${serviceData?.service_id}`);
      setLoading(false)

      if (result?.status) {
        setServiceDetails(result?.data)
      }
      else {
        SHOW_TOAST(result?.data?.message, 'error')
      }
    }
    catch (error: any) {
      setLoading(false);
      SHOW_TOAST(error?.message ?? '', 'error');
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(theme.white);
        StatusBar.setBarStyle('dark-content');
      }
    }, []),
  );

  return (
    <View style={[styles(theme).container,
    { paddingBottom: Platform.OS === 'android' ? insets.bottom : 0 }
    ]}>
      <Header
        onBack={() => {
          props.navigation.goBack();
        }}
        screenName={STRING.ServicePreview}
      />
      <ScrollView
        style={styles(theme).scrolledContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles(theme).imageContainer}>
          {serviceDetails?.subcategory_info?.sub_category_img_url === null ?
            <View style={[styles(theme).imageView, {
              backgroundColor: 'gray'
            }]}>
            </View>
            :
            <Image
              style={styles(theme).imageView}
              resizeMode='cover'
              source={{ uri: serviceDetails?.subcategory_info?.sub_category_img_url }}
            />
          }
          <Text
            style={{
              marginVertical: getScaleSize(12),
              marginLeft: getScaleSize(4),
            }}
            size={getScaleSize(24)}
            font={FONTS.Lato.Bold}
            color={theme.primary}>
            {serviceDetails?.subcategory_info?.sub_category_name ?? ''}
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
                  {moment.utc(serviceDetails?.date).local().format('DD MMM, YYYY')}
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
                  {moment.utc(serviceDetails?.time, "HH:mm").local().format("hh:mm A")}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles(theme).horizontalView,
                { marginTop: getScaleSize(12) },
              ]}>
              <View style={styles(theme).itemView}>
                {serviceDetails?.category_info?.category_name ?
                  <Image
                    style={[styles(theme).informationIcon, { tintColor: theme._1A3D51 }]}
                    source={arrayIcons[serviceDetails?.category_info?.category_name?.toLowerCase() as keyof typeof arrayIcons] ?? arrayIcons['diy'] as any}
                    resizeMode='cover'
                  />
                  :
                  <View style={[styles(theme).informationIcon]} />
                }
                <Text
                  style={{
                    marginHorizontal: getScaleSize(8),
                    alignSelf: 'center',
                  }}
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={theme.primary}>
                  {`${serviceDetails?.category_info?.category_name ?? 'No'} Service`}
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
                  font={FONTS.Lato.Medium}
                  numberOfLines={4}
                  color={theme.primary}>
                  {serviceDetails?.service_address ?? '-'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles(theme).profileContainer}>
          <View style={styles(theme).horizontalView}>
            <Text
              style={{ flex: 1.0 }}
              size={getScaleSize(18)}
              font={FONTS.Lato.SemiBold}
              color={theme._323232}>
              {STRING.Aboutclient}
            </Text>
          </View>
          <View
            style={[
              styles(theme).horizontalView,
              { marginTop: getScaleSize(16) },
            ]}>
            {serviceDetails?.about_client?.profile_photo ?
              <Image
                style={styles(theme).profilePicView}
                resizeMode='cover'
                source={{ uri: serviceDetails?.about_client?.profile_photo }}
              />
              :
              <Image
                style={styles(theme).profilePicView}
                source={IMAGES.user_placeholder}
              />
            }
            <Text
              style={{ alignSelf: 'center', marginLeft: getScaleSize(16) }}
              size={getScaleSize(20)}
              font={FONTS.Lato.SemiBold}
              color={'#0F232F'}>
              {serviceDetails?.about_client?.name}
            </Text>
          </View>
        </View>
        {profile?.user?.service_provider_type === 'non_professional' &&
          <View style={styles(theme).profileContainer}>
            <View>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(18)}
                font={FONTS.Lato.Medium}
                color={theme._555555}>
                {STRING.exchange_product}
              </Text>
              <Text
                style={styles(theme).exchangeProductView}
                size={getScaleSize(27)}
                font={FONTS.Lato.ExtraBold}
                color={theme._0F232F}>
                {serviceDetails?.barter_details?.product_name}
              </Text>
            </View>
          </View>
        }
        {profile?.user?.service_provider_type === 'non_professional' &&
          <View style={styles(theme).profileContainer}>
            <View>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(18)}
                font={FONTS.Lato.Medium}
                color={theme._555555}>
                {STRING.quantity}
              </Text>
              <Text
                style={styles(theme).exchangeProductView}
                size={getScaleSize(27)}
                font={FONTS.Lato.ExtraBold}
                color={theme._0F232F}>
                {serviceDetails?.barter_details?.quantity}
              </Text>
            </View>
          </View>
        }
        {profile?.user?.service_provider_type === 'non_professional' &&
          <View style={styles(theme).profileContainer}>
            <View>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(18)}
                font={FONTS.Lato.Medium}
                color={theme._555555}>
                {STRING.product_images}
              </Text>
              <FlatList
                data={serviceDetails?.barter_details?.product_photos}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => {
                  return (
                    <>
                      {item ?
                        <TouchableOpacity onPress={() => {
                          props.navigation.navigate(SCREENS.WebViewScreen.identifier, {
                            url: item,
                          })
                        }}>
                          <Image
                            style={styles(theme).photosView}
                            resizeMode='cover'
                            source={{ uri: item }}
                          />
                        </TouchableOpacity>

                        :
                        <View style={[styles(theme).photosView, {
                          backgroundColor: 'gray'
                        }]}></View>}
                    </>
                  );
                }}
              />
            </View>
          </View>
        }
        <Text
          style={{ marginTop: getScaleSize(24) }}
          size={getScaleSize(18)}
          font={FONTS.Lato.SemiBold}
          color={theme._323232}>
          {STRING.Servicedescription}
        </Text>
        <View style={styles(theme).serviceDescriptionView}>
          <Text
            size={getScaleSize(18)}
            font={FONTS.Lato.Regular}
            color={theme._555555}>
            {serviceDetails?.service_description}
          </Text>
        </View>
        <Text
          style={{ marginTop: getScaleSize(24) }}
          size={getScaleSize(18)}
          font={FONTS.Lato.SemiBold}
          color={theme._323232}>
          {STRING.Jobphotos}
        </Text>
        <FlatList
          data={serviceDetails?.job_photos}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: getScaleSize(16), marginBottom: getScaleSize(24) }}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity onPress={() => {
                props.navigation.navigate(SCREENS.WebViewScreen.identifier, {
                  url: item,
                })
              }}>
                <Image
                  style={styles(theme).photosView}
                  resizeMode='cover'
                  source={{ uri: item }}
                />
              </TouchableOpacity>

            );
          }}
        />
      </ScrollView>
      <View
        style={[
          styles(theme).horizontalView,
          { marginTop: getScaleSize(24), marginHorizontal: getScaleSize(22), marginBottom: getScaleSize(16) },
        ]}>
        <View style={{ flex: 1.0 }}>
          <Text
            size={getScaleSize(14)}
            font={FONTS.Lato.Medium}
            color={theme._2C6587}>
            {STRING.EstimatedCost}
          </Text>
          <Text
            style={{ marginTop: getScaleSize(2) }}
            size={getScaleSize(27)}
            font={FONTS.Lato.ExtraBold}
            color={theme._2C6587}>
            {`€${serviceDetails?.estimated_cost === null ? "" : serviceDetails?.estimated_cost}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles(theme).quateContainer}
          activeOpacity={1}
          onPress={() => {
            props.navigation.navigate(SCREENS.AddQuote.identifier, {
              item: serviceDetails,
              isFromHome: isFromHome,
            })
          }}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.SemiBold}
            color={theme.white}>
            {STRING.Quote}
          </Text>
        </TouchableOpacity>
      </View>
      {isLoading && <ProgressView />}
    </View >
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
      height: getScaleSize(28),
      width: getScaleSize(28),
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
      width: (Dimensions.get('window').width - getScaleSize(66)) / 2,
      borderRadius: 8,
      resizeMode: 'cover',
      marginTop: getScaleSize(18),
      backgroundColor: theme._EAF0F3,
    },
    buttonContainer: {
      flexDirection: 'row',
      marginHorizontal: getScaleSize(22),
      marginBottom: getScaleSize(17),
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
    quateContainer: {
      paddingVertical: getScaleSize(16),
      paddingHorizontal: getScaleSize(62),
      borderRadius: getScaleSize(12),
      backgroundColor: theme._214C65,
    },
    exchangeProductView: {
      flex: 1.0,
      marginTop: getScaleSize(15)
    }
  });
