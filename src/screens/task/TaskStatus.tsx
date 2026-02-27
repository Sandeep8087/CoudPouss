import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';

// ASSETS
import { FONTS, IMAGES } from '../../assets';

// CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

// CONSTANT
import { getScaleSize, SHOW_TOAST, useString, requestLocationPermission } from '../../constant';

// COMPONENT
import {
  BottomSheet,
  Button,
  EnterSecurityCodeSheet,
  Header,
  ProgressView,
  RenegotiationSheet,
  StatusItem,
  Text,
} from '../../components';

// PACKAGES
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

// API
import { API } from '../../api';
import BottomBar from '../Bottombar';
import Geolocation from 'react-native-geolocation-service';
import { } from '../../constant';
import { SCREENS } from '..';

export default function TaskStatus(props: any) {

  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  const item = props?.route?.params?.item ?? {};

  const [isLoading, setLoading] = useState(false);
  const [taskStatus, setTaskStatus] = useState<any>([]);
  const [taskStatusLastItem, setTaskStatusLastItem] = useState<any>(null);
  const [location, setLocation] = useState<any>({});
  const [taskStatusData, setTaskStatusData] = useState<any>({});
  const [newQuoteAmount, setNewQuoteAmount] = useState('');
  const [newQuoteAmountError, setNewQuoteAmountError] = useState('');
  const [renegotiationDetails, setRenegotiationDetails] = useState<any>({});
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [serviceFlags, setServiceFlags] = useState({
    isOutForService: false,
    isExpertConfirmed: false,
    isServiceCompleted: false,
    isServiceFinalized: false,
    isPaymentReceived: false,
  });
  const bottomSheetRef = useRef<any>(null);
  const mapViewRef = useRef<any>(null);
  const renegotiationSheetRef = useRef<any>(null);
  const renegotiatioAcceptSheetRef = useRef<any>(null);
  const isFocused = useIsFocused();
  const prevStageRef = useRef<string | null>(null);
  const enterSecurityCodeSheetRef = useRef<any>(null);
  const otpInput = useRef<any>(null);
  const successBottomSheetRef = useRef<any>(null);

  useEffect(() => {
    if (isFocused) {
      getTaskStatus();
    }
  }, [isFocused]);

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (serviceFlags.isServiceFinalized === false && taskStatusData?.is_renegotiated === "pending") {
      intervalRef.current = setInterval(() => {
        getTaskStatus();
      }, 10000);
    }
    else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [taskStatusData]);

  useEffect(() => {
    if (!taskStatusLastItem?.stage) return;

    const currentStage = taskStatusLastItem.stage;
    const prevStage = prevStageRef.current;

    // pending ➜ accepted
    if (prevStage === 'pending' && currentStage === 'accepted') {
      renegotiatioAcceptSheetRef.current?.open();
    }
    if (prevStage === 'accepted' && currentStage === 'accepted') {
      renegotiatioAcceptSheetRef.current?.open();
    }

    prevStageRef.current = currentStage;
  }, [taskStatusLastItem]);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(theme.white);
        StatusBar.setBarStyle('dark-content');
      }
    }, []),
  );

  async function getTaskStatus() {
    try {
      setLoading(true);
      const result = await API.Instance.get(API.API_ROUTES.getTaskStatus + `/${item?.service_request_id}`);
      if (result.status) {
        const item = result?.data?.data ?? {}
        setTaskStatusData(item);
        let array = item?.task_status_timeline ?? [];
        let finalArray = array.pop();
        setTaskStatusLastItem(finalArray);
        setTaskStatus(array);
        getServiceStatus(array);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  function getServiceStatus(timeline: any[]) {
    const accepted = timeline.find(
      i => i.name === 'Quote accepted' && i.completed,
    );

    const outForService = timeline.find(i => i.name === 'Out for service');
    const startedService = timeline.find(i => i.name === 'Started service');
    const serviceCompleted = timeline.find(i => i.name === 'Service completed');
    const paymentReceived = timeline.find(i => i.name === 'Payment received');

    console.log('serviceFlags.isOutForService ', serviceFlags.isOutForService)
    setServiceFlags({
      isOutForService: !!accepted && !outForService?.completed,
      isExpertConfirmed: !!outForService?.completed && !startedService?.completed,
      isServiceCompleted: (startedService?.completed === true && serviceCompleted?.completed === false),
      isServiceFinalized: (serviceCompleted?.completed === true && startedService?.completed === true && paymentReceived?.completed === false),
      isPaymentReceived: (paymentReceived?.completed === true && serviceCompleted?.completed === true && startedService?.completed === true)
    });
  };

  async function getCurrentLocation() {

    try {
      setLoading(true);
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        SHOW_TOAST('Location permission denied', 'error');
        setLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        (position: any) => {
          const { latitude, longitude } = position.coords;
          console.log('latitude', latitude);
          console.log('longitude', longitude);
          setLocation({ latitude, longitude });
          onProceedOutOfService()
          bottomSheetRef.current?.close();
        },
        (error: any) => {
          setLoading(false);
          SHOW_TOAST(error.message, 'error');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    } catch (error: any) {
      setLoading(false);
      SHOW_TOAST(error?.message ?? '', 'error');
    }
  };

  async function onProceedOutOfService() {
    try {
      setLoading(true);
      const result = await API.Instance.post(API.API_ROUTES.onProceedOutOfService + `/${item?.service_request_id}`);
      if (result.status) {
        getTaskStatus()
        setTimeout(() => {
          mapViewRef.current?.open();
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

  async function getRenegotiationDetails() {
    try {
      setLoading(true);
      const result = await API.Instance.get(API.API_ROUTES.getRenegotiationDetails + `/${item?.service_request_id}`);
      if (result.status) {
        const item = result?.data?.data ?? {}
        setRenegotiationDetails(item);
        renegotiationSheetRef.current?.open();
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  const onProcessPress = () => {
    if (!newQuoteAmount || isNaN(Number(newQuoteAmount))) {
      setNewQuoteAmountError('Please enter a valid amount');
      return;
    }

    const finalAmount = Number(renegotiationDetails?.finalized_quote_amount);

    if (!finalAmount || finalAmount <= 0) {
      return;
    }

    const enteredAmount = Number(newQuoteAmount);

    if (enteredAmount <= 0) {
      setNewQuoteAmountError('Amount must be greater than zero');
      return;
    }

    const maxAllowedAmount = Math.round(finalAmount * 1.2);

    if (enteredAmount > maxAllowedAmount) {
      setNewQuoteAmountError(
        `Counter offer can only be increased up to 20% (Max ${maxAllowedAmount})`
      );
      return;
    }

    if (enteredAmount < finalAmount) {
      setNewQuoteAmountError(
        `Amount cannot be less than finalized amount (${finalAmount})`
      );
      return;
    }

    setNewQuoteAmountError('');
    onNext();
  };
  async function onNext() {
    try {
      setLoading(true);
      const params = {
        adjustment_amount: newQuoteAmount,
      }
      const result = await API.Instance.post(API.API_ROUTES.onProcessRenegotiation + `/${item?.service_request_id}/submit-adjustment`, params);
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success');
        renegotiationSheetRef.current?.close();
        getTaskStatus();
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function onMarkAsCompleted() {
    try {
      setLoading(true);
      const result = await API.Instance.post(API.API_ROUTES.onMarkAsCompleted + `/${item?.service_request_id}`);
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success');
        getTaskStatus();

      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function onVerifySecurityCode() {
    try {
      setLoading(true);
      const params = {
        entered_code: otp,
      }
      const result = await API.Instance.post(API.API_ROUTES.onValidateSecurityCode + `/${item?.service_request_id}`, params);
      if (result.status) {
        enterSecurityCodeSheetRef.current?.close();
        setTimeout(() => {
          successBottomSheetRef.current?.open();
        }, 500);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    }
    catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  console.log('serviceFlags.isServiceFinalized==>', serviceFlags.isServiceFinalized, taskStatusData?.is_otp_verifed?.status == 'false');

  return (
    <View style={styles(theme).container}>
      <Header
        onBack={() => {
          props.navigation.goBack();
        }}
        screenName={STRING.TaskStatus}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles(theme).scrolledContainer}>
        <View style={styles(theme).informationContainer}>
          <Text
            style={{ flex: 1 }}
            size={getScaleSize(16)}
            font={FONTS.Lato.Medium}
            color={theme.primary}>
            {STRING.TaskStatus}
          </Text>
          <View style={styles(theme).devider} />
          <View style={{ marginTop: getScaleSize(32) }}>
            {taskStatus?.map(
              (item: any, index: number) => (
                <StatusItem
                  key={index}
                  item={item}
                  index={index}
                  isLast={index === taskStatus?.length - 1}
                  isPaymentReceived={serviceFlags.isPaymentReceived}
                  taskStatusData={taskStatusData}
                />
              ),
            )}
          </View>
        </View>
        {taskStatusData?.is_otp_verifed?.status === true && (
          <View style={styles(theme).lastInformationContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: getScaleSize(10) }}>
              <Image source={IMAGES.ic_warning} style={styles(theme).infoIcon} />
              <Text
                size={getScaleSize(16)}
                font={FONTS.Lato.Medium}
                color={theme._2C6587}>
                {STRING.information_message}
              </Text>
            </View>
            <Text
              size={getScaleSize(12)}
              font={FONTS.Lato.Regular}
              color={theme._323232}>
              {STRING.information_message_text}
            </Text>
          </View>
        )}
      </ScrollView>
      {serviceFlags.isOutForService && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: getScaleSize(24), marginBottom: getScaleSize(24) }}>
          {/* <TouchableOpacity
            onPress={() => { }}
            style={[styles(theme).outForServiceContainer, { borderColor: theme._EF5350 }]}>
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.Bold}
              color={theme._EF5350}>
              {STRING.Cancel}
            </Text>
          </TouchableOpacity> */}
          {/* <View style={{ width: getScaleSize(16) }} /> */}
          <Button
            style={{ flex: 1 }}
            title={STRING.OutForService}
            onPress={() => {
              bottomSheetRef.current?.open();
            }}
          />
        </View>
      )}
      {serviceFlags.isExpertConfirmed && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: getScaleSize(24), marginBottom: getScaleSize(24) }}>
          <Button
            style={{ flex: 1 }}
            title={STRING.map_view}
            onPress={() => {
              props.navigation.navigate(SCREENS.MapView.identifier, { item: item });
            }}
          />
        </View>
      )}
      {serviceFlags.isServiceCompleted && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: getScaleSize(24), marginBottom: getScaleSize(24) }}>
          {taskStatusData?.is_renegotiated == 'no_record' &&
            <TouchableOpacity
              onPress={() => {
                getRenegotiationDetails()
              }}
              style={[styles(theme).outForServiceContainer, { borderColor: theme._214C65 }]}>
              <Text
                size={getScaleSize(16)}
                font={FONTS.Lato.Bold}
                color={theme._214C65}>
                {STRING.renegotiate}
              </Text>
            </TouchableOpacity>
          }
          {taskStatusData?.is_renegotiated == 'no_record' && <View style={{ width: getScaleSize(16) }} />}
          <Button
            style={{ flex: 1 }}
            title={STRING.mark_as_completed}
            onPress={() => {
              onMarkAsCompleted()
            }}
          />
        </View>
      )}
      {serviceFlags.isServiceFinalized && (
        <>
          {taskStatusData?.is_otp_verifed?.status === false && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: getScaleSize(24), marginBottom: getScaleSize(24) }}>
              <Button
                style={{ flex: 1 }}
                title={STRING.procced_to_payment}
                onPress={() => {
                  enterSecurityCodeSheetRef.current?.open();
                }}
              />
            </View>
          )}
        </>
      )}

      <BottomSheet
        type='out_of_service'
        bottomSheetRef={bottomSheetRef}
        image={IMAGES.location_map}
        height={getScaleSize(330)}
        title={STRING.out_for_service_message}
        secondButtonTitle={STRING.No}
        buttonTitle={STRING.Yes}
        onPressSecondButton={() => {
          bottomSheetRef.current?.close();
        }}
        onPressButton={() => {
          getCurrentLocation()
        }}
      />
      <BottomSheet
        type='out_of_service'
        bottomSheetRef={mapViewRef}
        height={getScaleSize(330)}
        image={IMAGES.location_map}
        title={STRING.location_permission}
        secondButtonTitle={STRING.task_status}
        buttonTitle={STRING.map_view}
        onPressSecondButton={() => {
          mapViewRef.current?.close();
        }}
        onPressButton={() => {
          mapViewRef.current?.close();
          props.navigation.navigate(SCREENS.MapView.identifier, { item: item });
        }}
      />
      <RenegotiationSheet
        onRef={renegotiationSheetRef}
        item={renegotiationDetails}
        height={getScaleSize(700)}
        newQuoteAmount={newQuoteAmount}
        newQuoteAmountError={newQuoteAmountError}
        onChangeNewQuoteAmount={(text: string) => {
          const numericValue = text.replace(/[^0-9]/g, '');
          setNewQuoteAmount(numericValue);
        }}
        onClose={() => {
          renegotiationSheetRef.current?.close();
        }}
        onProcessPress={() => {
          onProcessPress()
        }}
      />
      <RenegotiationSheet
        onRef={renegotiatioAcceptSheetRef}
        type='accept'
        height={getScaleSize(600)}
        item={renegotiationDetails}
        onClose={() => {
          renegotiatioAcceptSheetRef.current?.close();
        }}
        onProcessPress={() => {
          renegotiatioAcceptSheetRef.current?.close();
        }}
      />
      <EnterSecurityCodeSheet
        onRef={enterSecurityCodeSheetRef}
        otpInput={otpInput}
        onChangeOtp={(text: string) => {
          setOtp(text);
          setOtpError('');
        }}
        otpError={otpError}
        otp={otp}
        security_Code={taskStatusData?.displayed_service_code?.replace(/\*/g, '') ?? '0'}
        onClose={() => {
          enterSecurityCodeSheetRef.current?.close();
        }}
        onProcessPress={() => {
          if (!otp || otp.length !== 3) {
            setOtpError('Please enter Valid Code');
            return;
          } else {
            onVerifySecurityCode();
          }
        }}
      />
      <BottomSheet
        type='success'
        isNotCloseable={true}
        bottomSheetRef={successBottomSheetRef}
        height={getScaleSize(230)}
        image={IMAGES.ic_succes}
        title={STRING.security_code_validated_successfully}
        buttonTitle={STRING.proceed}
        onPressButton={() => {
          getTaskStatus();
          setTimeout(() => {
            successBottomSheetRef.current?.close();
          }, 500);
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
    informationContainer: {
      marginTop: getScaleSize(24),
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(24),
      paddingVertical: getScaleSize(24),
    },
    devider: {
      backgroundColor: '#E6E6E6',
      height: 1,
      marginTop: getScaleSize(18),
    },
    lastInformationContainer: {
      marginTop: getScaleSize(24),
      marginBottom: getScaleSize(30),
    },
    infoIcon: {
      width: getScaleSize(20),
      height: getScaleSize(20),
      marginRight: getScaleSize(8),
    },
    outForServiceContainer: {
      flex: 1,
      paddingVertical: getScaleSize(18),
      borderWidth: 1,
      borderRadius: getScaleSize(12),
      alignItems: 'center',
    },
  });
