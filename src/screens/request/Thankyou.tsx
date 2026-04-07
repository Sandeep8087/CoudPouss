import React, { useContext, useEffect, useState } from 'react';
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
  SafeAreaView,
  TextInput,
} from 'react-native';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { getScaleSize, useString } from '../../constant';

//COMPONENT
import {
  AssistanceItems,
  CalendarComponent,
  Header,
  Input,
  ProgressSlider,
  SearchComponent,
  ServiceItem,
  Text,
  TimePicker,
} from '../../components';

//PACKAGES
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { SCREENS } from '..';

export default function Thankyou(props: any) {
  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  useEffect(() => {
    setTimeout(() => {
      props?.navigation?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: SCREENS.BottomBar.identifier }],
        }),
      );
    }, 1800);
  }, [])

  return (
    <View style={styles(theme).container}>
      <Image style={styles(theme).imageView} source={IMAGES.request_submitteed} />
      <Text size={getScaleSize(24)}
        font={FONTS.Lato.Bold}
        color={theme._939393}
        align="center">
        {STRING.great_job_Your_request_is_now_submitted_successfully}
      </Text>
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: getScaleSize(29),
    },
    imageView: {
      width: Dimensions.get('window').width - getScaleSize(58),
      height: ((Dimensions.get('window').width - getScaleSize(58)) * getScaleSize(333)) / getScaleSize(373),
      marginBottom: getScaleSize(40),
    }
  });
