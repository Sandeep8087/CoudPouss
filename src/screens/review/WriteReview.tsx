import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';

//COMPONENT
import {
  BottomSheet,
  Button,
  Header,
  ProgressView,
  Text,
} from '../../components';

//PACKAGES
import { CommonActions } from '@react-navigation/native';

import { SCREENS } from '..';
import { API } from '../../api';
import debounce from 'lodash/debounce';

export default function WriteReview(props: any) {

  const serviceId = props?.route?.params?.serviceId ?? '';
  const professionalName = props?.route?.params?.professionalName ?? '';

  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  const [overallRatting, setOverallRatting] = useState(0);
  const [reliabilityRatting, setReliabilityRatting] = useState(0);
  const [punctualityRatting, setPunctualityRatting] = useState(0);
  const [solutionRatting, setSolutionRatting] = useState(0);
  const [payoutRatting, setPayoutRatting] = useState(0);
  const [review, setReview] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [isLoadingRating, setIsLoadingRating] = useState(true);

  const successBottomSheetRef = useRef<any>(null);

  const normalizeRatingValue = (value: any) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return 0;
    }
    return Math.min(5, Math.max(0, Math.round(numericValue)));
  };

  const renderStars = (
    value: number,
    onChange: (rating: number) => void,
  ) => {
    return (
      <View style={styles(theme).starsRow}>
        {[1, 2, 3, 4, 5].map(star => {
          const isFilled = star <= value;
          return (
            <TouchableOpacity
              key={star}
              activeOpacity={0.8}
              onPress={() => onChange(star)}
              style={styles(theme).starTouchable}>
              <Text
                size={getScaleSize(34)}
                font={FONTS.Lato.Bold}
                color={isFilled ? '#F0B52C' : '#DADDE1'}>
                {'\u2605'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  useEffect(() => {
    setTimeout(() => {
      setIsLoadingRating(false);
    }, 500);
    getReviewData();
  }, [])


  const debouncedWriteReview = useCallback(
    debounce(() => {
      onWriteReview();
    }, 800),
    []
  );

  async function onWriteReview() {
    if (isLoading) return;
    if (overallRatting === 0 || reliabilityRatting === 0 || punctualityRatting === 0 || solutionRatting === 0 || payoutRatting === 0) {
      SHOW_TOAST('Please fill all fields', 'error');
      return;
    }
    try {
      let params = {};
      if (!review) {
        params = {
          rating: {
            service_id: serviceId,
            // work_quality: overallRatting,
            reliability: reliabilityRatting,
            punctuality: punctualityRatting,
            solution: solutionRatting,
            payout: payoutRatting,
            overall: overallRatting,
          }
        }
      } else {
        params = {
          rating: {
            service_id: serviceId,
            // work_quality: overallRatting,
            reliability: reliabilityRatting,
            punctuality: punctualityRatting,
            solution: solutionRatting,
            payout: payoutRatting,
            overall: overallRatting,
          },
          review: {
            service_id: serviceId,
            review_description: review,
          }
        }
      }
      setLoading(true);
      const result = await API.Instance.post(API.API_ROUTES.onWriteReview + `?type=${review ? `both` : `rating`}`, params);
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success')
        successBottomSheetRef.current?.open();
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function getReviewData() {
    try {
      const result: any = await API.Instance.get(API.API_ROUTES.getReviewData + `/${serviceId}?type=both`);
      if (result.status) {
        console.log('reviewData==>', result?.data?.data);
        const reviewData = result?.data?.data ?? '';
        setReview(reviewData?.review?.review_description ?? '');
        setOverallRatting(normalizeRatingValue(reviewData?.rating?.overall ?? 0));
        setReliabilityRatting(normalizeRatingValue(reviewData?.rating?.reliability ?? 0));
        setPunctualityRatting(normalizeRatingValue(reviewData?.rating?.punctuality ?? 0));
        setSolutionRatting(normalizeRatingValue(reviewData?.rating?.solution ?? 0));
        setPayoutRatting(normalizeRatingValue(reviewData?.rating?.payout ?? 0));
      } else {
        console.log('result==>', result);
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      console.log('error==>', error);
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
        screenName={STRING.LeaveaReview}
      />
      <ScrollView style={{ flex: 1.0 }}>
        <View style={styles(theme).serviceProviderCotainer}>
          <Text
            size={getScaleSize(22)}
            font={FONTS.Lato.SemiBold}
            color={theme.primary}>
            {STRING.reviewMessage}
          </Text>
          <Text
            style={{ marginTop: getScaleSize(8) }}
            size={getScaleSize(16)}
            font={FONTS.Lato.Medium}
            color={'#424242'}>
            {STRING.reviewQuestion}
          </Text>
          <View style={styles(theme).ratingContainer}>
            <Text
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={'#424242'}>
              {STRING.OverallService}
            </Text>
            {!isLoadingRating && renderStars(overallRatting, value => setOverallRatting(normalizeRatingValue(value)))}
          </View>
          <View style={styles(theme).ratingContainer}>
            <Text
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={'#424242'}>
              {STRING.Reliability}
            </Text>
            {!isLoadingRating && renderStars(reliabilityRatting, value => setReliabilityRatting(normalizeRatingValue(value)))}
          </View>
          <View style={styles(theme).ratingContainer}>
            <Text
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={'#424242'}>
              {STRING.Punctuality}
            </Text>
            {!isLoadingRating && renderStars(punctualityRatting, value => setPunctualityRatting(normalizeRatingValue(value)))}
          </View>
          <View style={styles(theme).ratingContainer}>
            <Text
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={'#424242'}>
              {STRING.Solution}
            </Text>
            {!isLoadingRating && renderStars(solutionRatting, value => setSolutionRatting(normalizeRatingValue(value)))}
          </View>
          <View style={styles(theme).ratingContainer}>
            <Text
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={'#424242'}>
              {STRING.Payout}
            </Text>

            {!isLoadingRating && renderStars(payoutRatting, value => setPayoutRatting(normalizeRatingValue(value)))}
          </View>
          <Text
            style={{ marginTop: getScaleSize(20) }}
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={'#323232'}>
            {STRING.Pleaseshareyourexperience}
          </Text>
          <View style={styles(theme).inputContainer}>
            <TextInput
              style={styles(theme).textInput}
              value={review}
              onChangeText={setReview}
              placeholder={STRING.Writeyourreviewhere}
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={8}
              textAlignVertical="top"
              returnKeyType="default"
            />
          </View>
        </View>
      </ScrollView >
      <Button
        title={STRING.Submit}
        style={{
          marginHorizontal: getScaleSize(22),
          marginBottom: getScaleSize(16),
        }}
        onPress={() => {
          Keyboard.dismiss();
          debouncedWriteReview();
        }}
      />
      <BottomSheet
        bottomSheetRef={successBottomSheetRef}
        height={330}
        type="review"
        title={STRING.thank_you_for_your_review}
        description={STRING.we_appreciated_you_taking_the_time_to_reflect_on_your_experience}
        buttonTitle={STRING.back_to_home}
        onPressButton={() => {
          successBottomSheetRef.current?.close();
          props.navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: SCREENS.BottomBar.identifier
                },
              ],
            }),
          );
        }}
      />
      {isLoading || isLoadingRating && <ProgressView />}
    </View >
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.white },
    serviceProviderCotainer: {
      marginTop: getScaleSize(24),
      flexDirection: 'column',
      marginHorizontal: getScaleSize(22),
    },
    textInput: {
      fontSize: getScaleSize(18),
      color: theme._323232,
      padding: getScaleSize(16),
      minHeight: getScaleSize(240),
      textAlignVertical: 'top',
      fontFamily: FONTS.Lato.Regular,
    },
    inputContainer: {
      borderWidth: 1,
      borderColor: theme._D5D5D5,
      borderRadius: getScaleSize(12),
      marginTop: getScaleSize(12),
      marginBottom: getScaleSize(24),
    },
    ratingContainer: {
      marginTop: getScaleSize(22),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    starsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    starTouchable: {
      marginLeft: getScaleSize(2),
    },
  });
