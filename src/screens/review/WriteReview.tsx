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
  TextInput,
} from 'react-native';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';

//COMPONENT
import {
  AcceptBottomPopup,
  BottomSheet,
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
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { Rating } from 'react-native-ratings';

import { SCREENS } from '..';
import { API } from '../../api';

export default function WriteReview(props: any) {

  const serviceId = props?.route?.params?.serviceId ?? '';

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

  useEffect(() => {
    setTimeout(() => {
      setIsLoadingRating(false);
    }, 500);
  }, [])

  async function onWriteReview() {
    if (overallRatting === 0 || reliabilityRatting === 0 || punctualityRatting === 0 || solutionRatting === 0 || payoutRatting === 0) {
      SHOW_TOAST('Please fill all fields', 'error');
      return;
    }
    if (review === '') {
      SHOW_TOAST('Please enter a review', 'error');
      return;
    }
    try {
      const params = {
        rating: {
          service_id: serviceId,
          work_quality: overallRatting,
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
      setLoading(true);
      const result = await API.Instance.post(API.API_ROUTES.onWriteReview, params);
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
            {!isLoadingRating &&
            <View style={{ height: 40, justifyContent: 'center' }}>
              <Rating
                type="custom"
                ratingBackgroundColor="#EDEFF0"
                tintColor={theme.white}
                ratingCount={5}
                ratingColor={'#F0B52C'} // grey color
                startingValue={overallRatting}
                imageSize={30}
                onFinishRating={(value: any) => setOverallRatting(value)}
              />
              </View>
            }
          </View>
          <View style={styles(theme).ratingContainer}>
            <Text
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={'#424242'}>
              {STRING.Reliability}
            </Text>
            {!isLoadingRating &&
              <Rating
                type="custom"
                ratingBackgroundColor="#EDEFF0"
                tintColor="#fff" // background color, useful for layout
                ratingCount={5}
                ratingColor={'#F0B52C'} // grey color
                startingValue={reliabilityRatting}
                imageSize={30}
                onFinishRating={(value: any) => setReliabilityRatting(value)}
              />
            }
          </View>
          <View style={styles(theme).ratingContainer}>
            <Text
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={'#424242'}>
              {STRING.Punctuality}
            </Text>
            {!isLoadingRating &&
              <Rating
                type="custom"
                ratingBackgroundColor="#EDEFF0"
                tintColor="#fff" // background color, useful for layout
                ratingCount={5}
                ratingColor={'#F0B52C'} // grey color
                startingValue={punctualityRatting}
                imageSize={30}
                onFinishRating={(value: any) => setPunctualityRatting(value)}
              />
            }
          </View>
          <View style={styles(theme).ratingContainer}>
            <Text
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={'#424242'}>
              {STRING.Solution}
            </Text>
            {!isLoadingRating &&
              <Rating
                type="custom"
                ratingBackgroundColor="#EDEFF0"
                tintColor="#fff" // background color, useful for layout
                ratingCount={5}
                ratingColor={'#F0B52C'} // grey color
                startingValue={solutionRatting}
                imageSize={30}
                onFinishRating={(value: any) => setSolutionRatting(value)}
              />
            }
          </View>
          <View style={styles(theme).ratingContainer}>
            <Text
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={'#424242'}>
              {STRING.Payout}
            </Text>

            {!isLoadingRating &&
              <Rating
                type="custom"
                ratingBackgroundColor="#EDEFF0"
                tintColor="#fff" // background color, useful for layout
                ratingCount={5}
                ratingColor={'#F0B52C'} // grey color
                startingValue={payoutRatting}
                imageSize={30}
                onFinishRating={(value: any) => setPayoutRatting(value)}
              />
            }
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
          onWriteReview();
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
    },
    ratingContainer: {
      marginTop: getScaleSize(22),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  });
