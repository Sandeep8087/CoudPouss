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

export default function Success(props: any) {
  const { theme } = useContext<any>(ThemeContext);

  const isFromHome = props?.route?.params?.isFromHome ?? false;

  useEffect(() => {
    if (isFromHome) {
      setTimeout(() => {
        props.navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{
              name: SCREENS.BottomBar.identifier
            }],
          }),
        )
      }, 2000);
    } else {
      setTimeout(() => {
        props.navigation.navigate(SCREENS.ExploreServiceRequest.identifier);
      }, 2000);
    }
  }, [])

  return (
    <View style={styles(theme).container}>
      <Image style={styles(theme).imageView} source={IMAGES.quate_message} />
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
