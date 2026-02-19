import React, { useContext, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  TextInput,
  Platform,
} from 'react-native';
import { ThemeContext, ThemeContextType } from '../context';
import { getScaleSize, useString } from '../constant';
import { FONTS, IMAGES } from '../assets';
import Text from './Text';
import { constant } from 'lodash';
import RBSheet from 'react-native-raw-bottom-sheet';
import Input from './Input';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RejectBottomPopup = (props: any) => {

  const insets = useSafeAreaInsets();

  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const { selectedCategory, reason, setSelectedCategory, setReason } = props;

  const startOpenAnimations = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(100); // Start from further down for slower feel
    scaleAnim.setValue(0.7); // Start smaller for more dramatic scale

    // Ultra slow and smooth animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200, // 1.2 seconds
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startCloseAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
      <RBSheet
        ref={props.rejectRef}
        customModalProps={{
          animationType: 'fade',
          statusBarTranslucent: true,
        }}
        customStyles={{
          wrapper: {
            backgroundColor: theme._77777733,
          },
          container: {
            height: selectedCategory == 3 ? getScaleSize(700) : getScaleSize(550),
            borderTopLeftRadius: getScaleSize(24),
            borderTopRightRadius: getScaleSize(24),
            backgroundColor: theme.white,
          },
        }}
        draggable={false}
        closeOnPressMask={true}>
        <View style={[styles(theme).content,
        { paddingBottom: Platform.OS === 'android' ? insets.bottom : 0 }
        ]}>
          <Image style={styles(theme).icon} source={IMAGES.reject_icon} />
          <Text
            size={getScaleSize(22)}
            font={FONTS.Lato.Bold}
            color={theme.primary}
            style={{ alignSelf: 'center', marginTop: getScaleSize(16) }}>
            {STRING.RejectServicerequest}
          </Text>
          <View style={{ flex: 1.0 }}>
            <TouchableOpacity
              style={styles(theme).radioButtonContainer}
              activeOpacity={1}
              onPress={() => {
                setSelectedCategory(1);
                setReason(STRING.Pricehigherthancompetitors);
              }}>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(18)}
                font={FONTS.Lato.Medium}
                color={'#424242'}>
                {STRING.Pricehigherthancompetitors}
              </Text>
              <Image
                style={styles(theme).radioButton}
                source={
                  selectedCategory == 1
                    ? IMAGES.ic_radio_select
                    : IMAGES.ic_radio_unselect
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles(theme).radioButtonContainer}
              activeOpacity={1}
              onPress={() => {
                setSelectedCategory(2);
                setReason(STRING.Lateresponse);
              }}>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(18)}
                font={FONTS.Lato.Medium}
                color={'#424242'}>
                {STRING.Lateresponse}
              </Text>
              <Image
                style={styles(theme).radioButton}
                source={
                  selectedCategory == 2
                    ? IMAGES.ic_radio_select
                    : IMAGES.ic_radio_unselect
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles(theme).otherRadioButtonContainer}
              activeOpacity={1}
              onPress={() => {
                if (selectedCategory == 3) {

                } else {
                  setReason(''); // Clear the reason when selecting another reason
                  setSelectedCategory(3);
                }

              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{ flex: 1.0 }}
                  size={getScaleSize(18)}
                  font={FONTS.Lato.Medium}
                  color={'#424242'}>
                  {STRING.Rejectedforanotherreason}
                </Text>
                <Image
                  style={styles(theme).radioButton}
                  source={
                    selectedCategory == 3
                      ? IMAGES.ic_radio_select
                      : IMAGES.ic_radio_unselect
                  }
                />
              </View>
              {selectedCategory == 3 && (
                <View style={styles(theme).inputContainer}>
                  <TextInput
                    style={styles(theme).input}
                    placeholder={'Write your reason here…'}
                    placeholderTextColor={theme._818285}
                    value={reason}
                    onChangeText={setReason}
                    multiline={true}
                    numberOfLines={8}
                    textAlignVertical="top"
                    returnKeyType="default"
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles(theme).buttonContainer}>
            <TouchableOpacity
              style={styles(theme).backButtonContainer}
              activeOpacity={1}
              onPress={props.onClose}>
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
              onPress={props.onReject}>
              <Text
                size={getScaleSize(19)}
                font={FONTS.Lato.Bold}
                color={theme.white}
                style={{ alignSelf: 'center' }}>
                {STRING.Reject}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </RBSheet>
    </View>
  );
};

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    content: {
      paddingVertical: getScaleSize(24),
      flex: 1.0,
    },
    icon: {
      height: getScaleSize(60),
      width: getScaleSize(60),
      alignSelf: 'center',
    },
    radioButtonContainer: {
      marginTop: getScaleSize(20),
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme._D5D5D5,
      paddingVertical: getScaleSize(17),
      paddingHorizontal: getScaleSize(17),
      borderRadius: getScaleSize(12),
      marginHorizontal: getScaleSize(22),
    },
    otherRadioButtonContainer: {
      marginTop: getScaleSize(20),
      borderWidth: 1,
      borderColor: theme._D5D5D5,
      paddingVertical: getScaleSize(17),
      paddingHorizontal: getScaleSize(17),
      borderRadius: getScaleSize(12),
      marginHorizontal: getScaleSize(22),
    },
    radioButton: {
      height: getScaleSize(40),
      width: getScaleSize(40),
      alignSelf: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      marginHorizontal: getScaleSize(22),
      marginTop: getScaleSize(24),
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
    input: {
      fontSize: getScaleSize(16),
      fontFamily: FONTS.Lato.Medium,
      color: theme._31302F,
      flex: 1.0,
      height: Platform.OS == 'ios' ? getScaleSize(56) : getScaleSize(56),
    },
    inputContainer: {
      marginTop: getScaleSize(12),
      height: getScaleSize(100),
      borderWidth: 1,
      borderColor: theme._D5D5D5,
      borderRadius: getScaleSize(12),
      paddingHorizontal: getScaleSize(16)
    }
  });

export default RejectBottomPopup;
