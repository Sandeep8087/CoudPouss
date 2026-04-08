import React, { useContext} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  TextInput,
  Platform,
  Keyboard,
} from 'react-native';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../context';

//CONSTANT & ASSETS
import { getScaleSize, useString } from '../constant';
import { FONTS, IMAGES } from '../assets';

//COMPONENTS
import Text from './Text';

//PACKAGES
import RBSheet from 'react-native-raw-bottom-sheet';

const RejectBottomPopup = (props: any) => {

  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  const { selectedCategory, reason, setSelectedCategory, setReason } = props;

  const handleReasonChange = (text: string) => {
    // Prevent starting space
    if (text.length === 1 && text === ' ') {
      return;
    }
  
    // Limit to 250 characters
    if (text.length <= 250) {
      setReason(text);
    }
  };

  return (
      <RBSheet
        ref={props.rejectRef}
        customModalProps={{
          animationType: 'fade',
          statusBarTranslucent: true,
        }}
        customAvoidingViewProps={
          Platform.OS === 'android'
            ? {enabled: false}
            : {enabled: true, behavior: 'padding'}
        }
        customStyles={{
          wrapper: {
            backgroundColor: theme._77777733,
          },
          container: {
            minHeight: selectedCategory == 3 ? getScaleSize(710) : getScaleSize(580),
            borderTopLeftRadius: getScaleSize(24),
            borderTopRightRadius: getScaleSize(24),
            backgroundColor: theme.white,
          },
        }}
        draggable={false}
        closeOnPressMask={true}>
        <View style={[styles(theme).content,
        // { paddingBottom: Platform.OS === 'android' ? insets.bottom : 0 }
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
                    placeholder={STRING.write_your_reason_here}
                    placeholderTextColor={theme._818285}
                    value={reason}
                    onChangeText={handleReasonChange}
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
