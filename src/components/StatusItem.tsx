import React, {useContext, useRef, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Alert, Image} from 'react-native';
import {ThemeContext, ThemeContextType} from '../context';
import {getScaleSize, useString} from '../constant';
import {FONTS, IMAGES} from '../assets';
import {constant} from 'lodash';
import RBSheet from 'react-native-raw-bottom-sheet';
import Text from './Text';
import moment from 'moment';

const StatusItem = (props: any) => {
  const STRING = useString();
  const {theme} = useContext<any>(ThemeContext);

  const {item, isLast} = props;

  console.log('item==>', item?.name == 'Started service' && item?.completed);

  function getImage() {
    if (item?.name === 'Started service') {
      if (item?.completed) {
        return IMAGES.service_running;
      }
    }

    if (item?.serviceRunning) {
      return IMAGES.service_running;
    }

    // 2️⃣ Service rejected
    if (item?.isRejected) {
      return IMAGES.ic_rejected;
    }

    // 3️⃣ Service completed
    if (item?.completed) {
      return IMAGES.status_green;
    }

    // 4️⃣ Default / empty state
    return IMAGES.empty_view;
  }

  return (
    <View style={[styles(theme).statusItem, {}]}>
      {/* Timeline line */}
      <View style={styles(theme).timelineContainer}>
        <Image
          style={{
            height: getScaleSize(24),
            width: getScaleSize(24),
            resizeMode: 'contain',
          }}
          source={getImage()}
        />
        {!item?.completed && item?.id && (
          <Text
            style={{position: 'absolute', top: getScaleSize(3.2)}}
            size={getScaleSize(12)}
            font={FONTS.Lato.Medium}
            color={theme.white}>
            {String(item?.id != null ? item.id + 1 : 0)}
          </Text>
        )}
        {!isLast && (
          <View
            style={[
              styles(theme).timelineLine,
              {
                backgroundColor: item?.isRejected
                  ? 'red'
                  : item?.completed
                    ? '#2E7D32'
                    : '#424242',
              },
            ]}
          />
        )}
      </View>

      {/* Content */}
      <View style={styles(theme).content}>
        <Text
          size={getScaleSize(16)}
          font={FONTS.Lato.SemiBold}
          color={theme._2B2B2B}
          style={{}}>
          {item?.name ?? ''}
        </Text>
        <Text
          size={getScaleSize(12)}
          font={FONTS.Lato.Regular}
          color={theme._737373}
          style={{marginTop: getScaleSize(4)}}>
          {item?.time
            ? moment(item?.time).format('ddd, DD MMM’ YYYY  -  h:mma')
            : '-'}
        </Text>
        {/* {props?.item?.securityCode && (
          <>
            <Text
              size={getScaleSize(14)}
              font={FONTS.Lato.Regular}
              color={theme._737373}
              style={{ marginTop: getScaleSize(8) }}>
              {
                'Please keep this security code safe — it will be required to confirm completion and release payment.'
              }
            </Text>
            <View style={styles(theme).informationView}>
              <Text
                style={[
                  styles(theme).date,
                  {
                    fontFamily: FONTS.Lato.Medium,
                    fontSize: 16,
                    color: '#2C6587',
                  },
                ]}>
                {'Security Code'}
              </Text>
              <Text
                style={[
                  styles(theme).date,
                  {
                    fontFamily: FONTS.Lato.Bold,
                    fontSize: 24,
                    color: '#2C6587',
                    marginTop: getScaleSize(2),
                    textAlign: 'center',
                    alignSelf: 'center',
                  },
                ]}>
                {'7    9    6'}
              </Text>
            </View>
          </>
        )} */}
      </View>
    </View>
  );
};

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 16,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 24,
      textAlign: 'center',
    },
    scrollView: {
      flex: 1,
    },
    timeline: {
      paddingLeft: 8,
    },
    statusItem: {
      flexDirection: 'row',
      marginBottom: 24,
    },
    timelineContainer: {
      alignItems: 'center',
      marginRight: 16,
      width: 24,
    },
    timelineDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    completedDot: {
      backgroundColor: '#4CAF50',
      borderWidth: 3,
      borderColor: '#E8F5E8',
    },
    pendingDot: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#E0E0E0',
    },
    innerDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#fff',
    },
    timelineLine: {
      width: 2,
      flex: 1,
      marginTop: 0,
      marginBottom: -24,
    },
    content: {
      flex: 1,
      paddingBottom: 8,
    },
    title: {
      fontSize: getScaleSize(16),
      fontFamily: FONTS.Lato.SemiBold,
      marginBottom: 4,
      color: '#2B2B2B',
    },
    date: {
      fontSize: 12,
      color: '#737373',
      fontFamily: FONTS.Lato.Regular,
    },
    informationView: {
      marginTop: getScaleSize(12),
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(12),
      paddingVertical: getScaleSize(12),
    },
  });

export default StatusItem;
