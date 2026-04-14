import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { ThemeContext, ThemeContextType } from '../context';
import { getScaleSize, useString } from '../constant';
import { FONTS, IMAGES } from '../assets';
import Text from './Text';
import RBSheet from 'react-native-raw-bottom-sheet';
import Input from './Input';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const PaymentBottomPopup = (props: any) => {
  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);
  const { serviceAmount, couponCode, onChangeText, appliedCouponCode, couponCodeError, onPressViewAllCoupons, onPressApply } = props;
  const maxSheetHeight = Dimensions.get('screen').height * 0.9;
  const desiredHeight = couponCodeError ? getScaleSize(780) : getScaleSize(750);
  const sheetHeight = Math.min(desiredHeight, maxSheetHeight);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      setKeyboardHeight(e?.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <RBSheet
      ref={props.onRef}
      closeOnPressMask={true}
      onClose={() => Keyboard.dismiss()}
      customModalProps={{
        animationType: 'slide',
        statusBarTranslucent: true,
      }}
      customAvoidingViewProps={
        Platform.OS === 'android'
          ? { enabled: false }
          : { enabled: true, behavior: 'padding' }
      }
      customStyles={{
        wrapper: {
          backgroundColor: theme._77777733,
        },
        container: {
          backgroundColor: '#FFF',
          height: sheetHeight,
          borderTopLeftRadius: getScaleSize(20),
          borderTopRightRadius: getScaleSize(20),
        },
      }}>
      <View style={styles(theme).sheetContent}>
        <KeyboardAwareScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          enableOnAndroid={Platform.OS === 'android' && Number(Platform.Version) >= 35}
          enableAutomaticScroll={true}
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={getScaleSize(100)}
          contentContainerStyle={[
            styles(theme).scrollContent,
            { paddingBottom: keyboardHeight + getScaleSize(24) },
          ]}>
        <View style={styles(theme).content}>
          <Image style={styles(theme).icon} source={IMAGES.payment_icon} />
          <Text
            size={getScaleSize(22)}
            font={FONTS.Lato.Bold}
            color={theme.primary}
            style={{ alignSelf: 'center', marginTop: getScaleSize(16) }}>
            {STRING.Proceedtopayment}
          </Text>
          <Text
            size={getScaleSize(14)}
            font={FONTS.Lato.Medium}
            color={'#555555'}
            align="center"
            style={{
              alignSelf: 'center',
              marginTop: getScaleSize(16),
              marginHorizontal: getScaleSize(22),
            }}>
            {STRING.payment_message}
          </Text>
          <View style={styles(theme).informationContainer}>
            <Text
              size={getScaleSize(18)}
              font={FONTS.Lato.SemiBold}
              color={theme._323232}>
              {STRING.FinalPaymentBreakdown}
            </Text>
            <View style={styles(theme).horizontalView}>
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
                {`€${serviceAmount?.finalize_quote_amount ?? 0}`}
              </Text>
            </View>
            <View style={styles(theme).horizontalView}>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(14)}
                font={FONTS.Lato.SemiBold}
                color={'#595959'}>
                {STRING.PlatformFee + ' (10%)'}
              </Text>
              <Text
                size={getScaleSize(14)}
                font={FONTS.Lato.SemiBold}
                color={'#595959'}>
                {`€${serviceAmount?.platform_fees ?? 0}`}
              </Text>
            </View>
            <View style={styles(theme).horizontalView}>
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
                {`€${serviceAmount?.tax ?? 0}`}
              </Text>
            </View>
            {serviceAmount?.coupon_code && (
              <View style={styles(theme).horizontalView}>
                <Text
                  style={{ flex: 1.0 }}
                  size={getScaleSize(14)}
                  font={FONTS.Lato.SemiBold}
                  color={'#595959'}>
                  {STRING.discount}
                </Text>
                <Text
                  size={getScaleSize(14)}
                  font={FONTS.Lato.SemiBold}
                  color={'#595959'}>
                  {`-€${serviceAmount?.discount_amount ?? 0}`}
                </Text>
              </View>
            )}
            <View style={styles(theme).dotView} />
            <View style={styles(theme).horizontalView}>
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
                {`€${serviceAmount?.total_renegotiated ?? 0}`}
              </Text>
            </View>
          </View>
          <View style={styles(theme).inputContainer}>
            <Input
              inputTitle={STRING.enter_discount_coupon}
              placeholder={STRING.coupon_code}
              placeholderTextColor={theme._818285}
              inputColor={true}
              value={appliedCouponCode?.code_name ? appliedCouponCode?.code_name : appliedCouponCode?.coupon_code ? appliedCouponCode?.coupon_code : couponCode}
              couponCode={appliedCouponCode?.id ? STRING.applied : STRING.apply}
              onPressCouponCode={onPressApply}
              onChangeText={onChangeText}
              isError={couponCodeError}
            />
            <Text
              size={getScaleSize(14)}
              font={FONTS.Lato.SemiBold}
              align="right"
              style={{ marginTop: getScaleSize(8) }}
              color={theme.primary}
              onPress={() => {
                onPressViewAllCoupons()
              }}>
              {STRING.view_all_coupons}
            </Text>
          </View>
        </View>
        </KeyboardAwareScrollView>
        <View style={styles(theme).buttonContainer}>
          <TouchableOpacity
            style={styles(theme).backButtonContainer}
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              props?.onClose()
            }}>
            <Text
              size={getScaleSize(19)}
              font={FONTS.Lato.Bold}
              color={theme.primary}
              style={{ alignSelf: 'center' }}>
              {STRING.cancel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles(theme).nextButtonContainer}
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              props?.proceedToPay()
            }}>
            <Text
              size={getScaleSize(19)}
              font={FONTS.Lato.Bold}
              color={theme.white}
              style={{ alignSelf: 'center' }}>
              {STRING.proceed_to_pay}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </RBSheet>
  );
};

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      marginTop: getScaleSize(24),
    },
    content: {
      paddingTop: getScaleSize(24),
    },
    sheetContent: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: getScaleSize(12),
    },
    icon: {
      height: getScaleSize(60),
      width: getScaleSize(60),
      alignSelf: 'center',
    },
    radioButtonContainer: {
      marginTop: getScaleSize(20),
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: theme._D5D5D5,
      paddingVertical: getScaleSize(17),
      paddingHorizontal: getScaleSize(17),
      borderRadius: getScaleSize(12),
      marginHorizontal: getScaleSize(22),
    },
    radioButton: {
      height: getScaleSize(24),
      width: getScaleSize(24),
      alignSelf: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      marginHorizontal: getScaleSize(22),
      marginTop: getScaleSize(12),
      marginBottom: getScaleSize(20),
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
    informationContainer: {
      marginTop: getScaleSize(24),
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(24),
      paddingVertical: getScaleSize(24),
      marginHorizontal: getScaleSize(22),
    },
    horizontalView: {
      flexDirection: 'row',
      marginTop: getScaleSize(8),
    },
    dotView: {
      // flex:1.0,
      borderStyle: 'dashed',
      borderColor: theme.primary,
      borderWidth: 1,
      marginTop: getScaleSize(8)
    },
    inputContainer: {
      marginTop: getScaleSize(24),
      marginHorizontal: getScaleSize(24),
    },
  });

export default PaymentBottomPopup;
