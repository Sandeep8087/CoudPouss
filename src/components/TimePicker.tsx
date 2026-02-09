import React, { useContext, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { ThemeContext, ThemeContextType } from '../context';
import { getScaleSize, SHOW_TOAST } from '../constant';
import { FONTS, IMAGES } from '../assets';
import Text from './Text';
import moment from 'moment';

const TimePicker = (props: any) => {
  const { onTimeChange, selectedDate } = props;
  const { theme } = useContext<any>(ThemeContext);

  const currentHour24 = moment().hour();
  const currentHour12 = currentHour24 % 12 === 0 ? 12 : currentHour24 % 12;
  const isCurrentAM = currentHour24 < 12;

  const [selectedHour, setSelectedHour] = useState(currentHour12);
  const [selectedMinute, setSelectedMinute] = useState(moment().minute());
  const [isAM, setIsAM] = useState(isCurrentAM);


  const isFutureDateTime = (
    selectedDate: string | Date,
    hour: number,
    minute: number,
    am: boolean
  ): boolean => {
    // Convert to 24-hour format
    let hour24 = hour % 12;
    if (!am) hour24 += 12;

    const selectedDateTime = moment(selectedDate).hour(hour24).minute(minute).second(0).millisecond(0);

    const now = moment();

    return selectedDateTime.isAfter(now);
  };

  const updateParent = (hour: number, minute: number, am: boolean) => {
    if (isFutureDateTime(selectedDate, hour, minute, am)) {
      onTimeChange && onTimeChange(hour, minute, am);
      return true;
    }
    else {
      SHOW_TOAST('Please select a future time', 'error');
      return false;
    }
  };


  // Handle hour increment
  const incrementHour = () => {
    setSelectedHour(prev => {
      const newHour = prev === 12 ? 1 : prev + 1;
      const isValid = updateParent(newHour, selectedMinute, isAM);
      return isValid ? newHour : prev;
    });
  };

  // Handle hour decrement
  const decrementHour = () => {
    setSelectedHour(prev => {
      const newHour = prev === 1 ? 12 : prev - 1;
      const isValid = updateParent(newHour, selectedMinute, isAM);
      return isValid ? newHour : prev;
    });
  };

  // Handle minute increment
  const incrementMinute = () => {
    setSelectedMinute(prev => {
      const newMinute = prev === 59 ? 0 : prev + 1;
      const isValid = updateParent(selectedHour, newMinute, isAM);
      return isValid ? newMinute : prev;
    });
  };

  // Handle minute decrement
  const decrementMinute = () => {
    setSelectedMinute(prev => {
      const newMinute = prev === 0 ? 59 : prev - 1;
      const isValid = updateParent(selectedHour, newMinute, isAM);
      return isValid ? newMinute : prev;
    });
  };

  // Toggle AM/PM
  const toggleAmPm = () => {
    setIsAM(prev => {
      const newAm = !prev;
      const isValid = updateParent(selectedHour, selectedMinute, newAm);
      return isValid ? newAm : prev;
      return newAm;
    });
  };

  // Handle time confirmation
  const confirmTime = () => {
    Alert.alert(
      'Time Selected',
      `You selected: ${selectedHour}:${selectedMinute
        .toString()
        .padStart(2, '0')} ${isAM ? 'AM' : 'PM'}`,
      [{ text: 'OK' }],
    );
  };

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).timeSelection}>
        <View style={styles(theme).verticalView}>
          <TouchableOpacity
            style={styles(theme).backwardIcon}
            onPress={incrementHour}>
            <Image
              style={styles(theme).backwardIcon}
              source={IMAGES.upward_time}
            />
          </TouchableOpacity>
          <Text
            style={{ marginVertical: getScaleSize(20) }}
            size={getScaleSize(24)}
            align="center"
            font={FONTS.Lato.Bold}
            color={theme.primary}>
            {selectedHour}
          </Text>
          <TouchableOpacity
            style={styles(theme).backwardIcon}
            onPress={decrementHour}>
            <Image
              style={styles(theme).backwardIcon}
              source={IMAGES.backward_time}
            />
          </TouchableOpacity>
        </View>
        <Image style={styles(theme).dotIcon} source={IMAGES.dot_icon} />
        <View style={styles(theme).verticalView}>
          <TouchableOpacity
            style={styles(theme).backwardIcon}
            onPress={incrementMinute}>
            <Image
              style={styles(theme).backwardIcon}
              source={IMAGES.upward_time}
            />
          </TouchableOpacity>
          <Text
            style={{ marginVertical: getScaleSize(20) }}
            size={getScaleSize(24)}
            align="center"
            font={FONTS.Lato.Bold}
            color={theme.primary}>
            {selectedMinute.toString().padStart(2, '0')}
          </Text>
          <TouchableOpacity
            style={styles(theme).backwardIcon}
            onPress={decrementMinute}>
            <Image
              style={styles(theme).backwardIcon}
              source={IMAGES.backward_time}
            />
          </TouchableOpacity>
        </View>
        <Text
          onPress={() => {
            toggleAmPm()
          }}
          style={{ alignSelf: 'center', marginHorizontal: getScaleSize(52) }}
          size={getScaleSize(24)}
          font={FONTS.Lato.Bold}
          color={isAM ? theme.primary : theme._D5D5D5}>
          {'AM'}
        </Text>
        <Text
          onPress={() => {
            toggleAmPm()
          }}
          style={{ alignSelf: 'center' }}
          size={getScaleSize(24)}
          font={FONTS.Lato.Bold}
          color={isAM ? theme._D5D5D5 : theme.primary}>
          {'PM'}
        </Text>
      </View>
    </View>
  );
};

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      marginTop: getScaleSize(18),
      paddingVertical: getScaleSize(16),
      paddingHorizontal: getScaleSize(43),
      borderRadius: getScaleSize(18),
      backgroundColor: '#FBFBFB',
      alignItems: 'center'
    },
    timeSelection: {
      flexDirection: 'row',
    },
    verticalView: {
      flexDirection: 'column',
    },
    backwardIcon: {
      height: 20,
      width: 20,
      alignSelf: 'center',
    },
    dotIcon: {
      width: 7,
      height: 27,
      alignSelf: 'center',
      resizeMode: 'contain',
      marginHorizontal: getScaleSize(42)
    }
  });

export default TimePicker;
