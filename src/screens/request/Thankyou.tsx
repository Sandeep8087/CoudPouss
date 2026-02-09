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
import { getScaleSize } from '../../constant';

//COMPONENT
import {
  AssistanceItems,
  CalendarComponent,
  CategoryDropdown,
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
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
      justifyContent: 'center',
    },
    imageView: {
      width: Dimensions.get('window').width - getScaleSize(58),
      height: getScaleSize(500),
      resizeMode: 'contain',
      alignSelf: 'center'
    }
  });
