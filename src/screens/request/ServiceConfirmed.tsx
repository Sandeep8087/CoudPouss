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

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

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
  Text,
} from '../../components';

//PACKAGES
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { SCREENS } from '..';
import { API } from '../../api';
import moment from 'moment';

export default function ServiceConfirmed(props: any) {

  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  const item = props?.route?.params?.item ?? {};
  const serviceId = props?.route?.params?.serviceId ?? '';

  const [isLoading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>({});

  useEffect(() => {
    getServiceAmount()
  }, []);

  async function getServiceAmount() {
    try {
      const params = {
        service_id: serviceId ? serviceId : item?.service_id,
      }
      setLoading(true);
      const result = await API.Instance.post(API.API_ROUTES.getServicePaymentDetails, params);
      if (result.status) {
        console.log('servicePaymentDetails==>', result?.data?.data)
        setPaymentDetails(result?.data?.data ?? {});
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error')
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
        screenName={STRING.ServiceConfirmed}
      />
      <ScrollView
        style={styles(theme).scrolledContainer}
        showsVerticalScrollIndicator={false}>
        <Image style={styles(theme).doneIcon} source={IMAGES.confirmed_icon} />
        <Text
          style={{ marginTop: getScaleSize(24) }}
          size={getScaleSize(19)}
          align="center"
          font={FONTS.Lato.Medium}
          color={theme._424242}>
          {STRING.service_confirmed_message}
        </Text>
        <View style={styles(theme).informationContainer}>
          <Text
            style={{}}
            size={getScaleSize(16)}
            font={FONTS.Lato.Bold}
            color={theme.primary}>
            {paymentDetails?.subcategory_name ?? ''}
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
                  {paymentDetails?.chosen_datetime ? moment.utc(paymentDetails?.chosen_datetime).local().format('DD MMM, YYYY') : '-'}
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
                  {paymentDetails?.chosen_datetime ? moment.utc(paymentDetails?.chosen_datetime).local().format('hh:mm A') : '-'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles(theme).horizontalView,
                { marginTop: getScaleSize(12) },
              ]}>
              <View style={styles(theme).itemView}>
                {paymentDetails?.category_name ?
                  <Image
                    style={[styles(theme).informationIcon, { tintColor: theme._1A3D51 }]}
                    source={arrayIcons[paymentDetails?.category_name?.toLowerCase() as keyof typeof arrayIcons] ?? arrayIcons['diy'] as any}
                    resizeMode='cover'
                  />
                  :
                  <View style={styles(theme).informationIcon} />
                }
                <Text
                  style={{
                    marginHorizontal: getScaleSize(8),
                    alignSelf: 'center',
                  }}
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={theme.primary}>
                  {paymentDetails?.category_name ?? ''}
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
                  {paymentDetails?.service_address ?? '-'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles(theme).informationContainer}>
          <Text
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={theme._323232}>
            {STRING.FinalPaymentBreakdown}
          </Text>
          <View style={styles(theme).newhorizontalView}>
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
              {`€${paymentDetails?.finalize_quote_amount ?? 0}`}
            </Text>
          </View>
          <View style={styles(theme).newhorizontalView}>
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
              {`€${paymentDetails?.platform_fees ?? 0}`}
            </Text>
          </View>
          <View style={styles(theme).newhorizontalView}>
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
              {`€${paymentDetails?.tax ?? 0}`}
            </Text>
          </View>
          <View style={styles(theme).dotView} />
          <View style={styles(theme).newhorizontalView}>
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
              {`€${paymentDetails?.total_renegotiated ?? 0}`}
            </Text>
          </View>
        </View>
        <View style={styles(theme).informationContainer}>
          <Text
            style={{}}
            size={getScaleSize(16)}
            font={FONTS.Lato.Bold}
            color={theme.primary}>
            {STRING.Aboutprofessional}
          </Text>
          <View
            style={[
              styles(theme).horizontalView,
              { marginTop: getScaleSize(16) },
            ]}>
            {paymentDetails?.provider_profile_url ?
              <Image
                style={styles(theme).profilePicView}
                source={{ uri: paymentDetails?.provider_profile_url }}
              />
              :
              <Image
                style={styles(theme).profilePicView}
                source={IMAGES.user_placeholder}
              />
            }
            <View style={{ flex: 1.0, }}>
              <View style={[styles(theme).flexRow, { flex: 1.0, maxWidth: '85%' }]}>
                <Text
                  style={{ alignSelf: 'center', }}
                  size={getScaleSize(18)}
                  numberOfLines={1}
                  font={FONTS.Lato.SemiBold}
                  color={'#0F232F'}>
                  {paymentDetails?.provider_name ?? '-'}
                </Text>
                {paymentDetails?.provider_is_verified &&
                  <Image
                    style={{
                      height: getScaleSize(20),
                      width: getScaleSize(20),
                      marginLeft: getScaleSize(4),
                    }}
                    source={IMAGES.verify}
                  />
                }
              </View>
              <View style={[styles(theme).flexRow, { marginTop: getScaleSize(4) }]}>
                <Image source={IMAGES.ic_phone} style={styles(theme).phoneIcon} />
                <Text
                  style={{}}
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={theme._595959}>
                  {paymentDetails?.provider_phone ?? '-'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={1}
              style={[styles(theme).newButton, { marginLeft: getScaleSize(6) }]}
              onPress={() => {
                props.navigation.goBack();
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
        <View style={{ height: getScaleSize(32) }}></View>
      </ScrollView>
      <Button
        title={STRING.Trackservice}
        style={{ marginHorizontal: getScaleSize(22), marginBottom: getScaleSize(16) }}
        onPress={() => {
          props.navigation.navigate(SCREENS.RequestDetails.identifier,
            { serviceId: serviceId ? serviceId : item?.service_id });
        }}
      />
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
    doneIcon: {
      height: getScaleSize(58),
      width: getScaleSize(58),
      alignSelf: 'center',
      resizeMode: 'contain',
    },
    informationContainer: {
      marginTop: getScaleSize(20),
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(16),
      paddingVertical: getScaleSize(20),
    },
    informationView: {
      paddingVertical: getScaleSize(16),
      backgroundColor: '#EAF0F3',
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(16),
      marginTop: getScaleSize(16),
    },
    horizontalView: {
      flexDirection: 'row',
      alignItems: 'center',
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
    dotView: {
      // flex:1.0,
      borderStyle: 'dashed',
      borderColor: theme.primary,
      borderWidth: 1,
      marginTop: getScaleSize(8),
    },
    newhorizontalView: {
      flexDirection: 'row',
      marginTop: getScaleSize(16),
    },
    profilePicView: {
      height: getScaleSize(56),
      width: getScaleSize(56),
      borderRadius: getScaleSize(28),
      marginRight: getScaleSize(12)
    },
    newButton: {
      // flex: 1.0,
      backgroundColor: theme.primary,
      borderRadius: 8,
      paddingVertical: getScaleSize(10),
      // height: getScaleSize(38),
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: getScaleSize(14),
    },
    flexRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    phoneIcon: {
      height: getScaleSize(20),
      width: getScaleSize(20),
      marginRight: getScaleSize(6),
    }
  });
