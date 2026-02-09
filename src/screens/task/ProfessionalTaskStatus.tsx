import React, {useContext, useRef, useState} from 'react';
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
import {FONTS, IMAGES} from '../../assets';

//CONTEXT
import {ThemeContext, ThemeContextType} from '../../context';

//CONSTANT
import {getScaleSize, useString} from '../../constant';

//COMPONENT
import {
  AcceptBottomPopup,
  Button,
  Header,
  PaymentBottomPopup,
  RejectBottomPopup,
  RequestItem,
  SearchComponent,
  StatusItem,
  Text,
} from '../../components';

//PACKAGES
import {useFocusEffect} from '@react-navigation/native';
import {SCREENS} from '..';

export default function ProfessionalTaskStatus(props: any) {
  const STRING = useString();
  const {theme} = useContext<any>(ThemeContext);

  const statusData = [
    {
      id: 1,
      title: 'Quote Sent',
      date: "Fri, 20 Jan' 2025 - 3:15pm",
      completed: true,
    },
    {
      id: 2,
      title: 'Out for Service',
      date: "Fri, 20 Jan' 2025 - 3:15pm",
      completed: true,
    },
    {
      id: 3,
      title: 'Started Service',
      date: "Fri, 20 Jan' 2025 - 3:15pm",
      completed: true,
    },
    {
      id: 4,
      title: 'Renegotiated the amount',
      date: "Fri, 20 Jan' 2025 - 3:15pm",
      completed: true,
    },
    {
      id: 5,
      title: 'Service Completed',
      date: "Wed, 18 Jan' 2025 - 7:07pm",
      completed: true,
    },
    {
      id: 6,
      title: 'Payment Received',
      date: "Scheduled on Fri, 20 Jan' 2025 - 3:15pm",
      completed: true,
      serviceRunning: false,
    },
  ];

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(theme.white);
        StatusBar.setBarStyle('dark-content');
      }
    }, []),
  );

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
            style={{flex: 1.0}}
            size={getScaleSize(16)}
            font={FONTS.Lato.Medium}
            color={theme.primary}>
            {STRING.TaskStatus}
          </Text>
          <View style={styles(theme).devider}></View>
          <View style={{marginTop: getScaleSize(32)}}>
            {statusData.map((item, index) => (
              <StatusItem
                key={item.id}
                item={item}
                index={index}
                isLast={index === statusData.length - 1}
              />
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles(theme).buttonContainer}>
        <TouchableOpacity
          style={styles(theme).backButtonContainer}
          activeOpacity={1}
          onPress={() => {
            
          }}>
          <Text
            size={getScaleSize(19)}
            font={FONTS.Lato.Bold}
            color={'#EF5350'}
            style={{alignSelf: 'center'}}>
            {'Cancel'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles(theme).nextButtonContainer}
          activeOpacity={1}
          onPress={() => {
            
          }}>
          <Text
            size={getScaleSize(19)}
            font={FONTS.Lato.Bold}
            color={theme.white}
            style={{alignSelf: 'center'}}>
            {'Out for Service'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: theme.white},
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
      justifyContent: 'flex-start',
    },
    devider: {
      backgroundColor: '#E6E6E6',
      height: 1,
      marginTop: getScaleSize(18),
    },
    buttonContainer: {
      flexDirection: 'row',
      marginHorizontal: getScaleSize(22),
      marginBottom: getScaleSize(17),
    },
    backButtonContainer: {
      flex: 1.0,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#EF5350',
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
  });
