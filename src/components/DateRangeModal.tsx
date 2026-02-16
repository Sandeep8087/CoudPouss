import React, { useContext, useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Text from './Text';
import { FONTS } from '../assets';
import { getScaleSize } from '../constant';
import { ThemeContext } from '../context';


const PRIMARY = '#3F51B5';

const getMarkedRange = (start: string, end: string) => {
  const marked: any = {};
  let current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    const dateStr = current.toISOString().split('T')[0];

    marked[dateStr] = {
      color: PRIMARY,
      textColor: '#fff',
      startingDay: dateStr === start,
      endingDay: dateStr === end,
    };

    current.setDate(current.getDate() + 1);
  }

  return marked;
};

const DateRangeModal = ({
  visible,
  onApply,
  onClose,
}: {
  visible: boolean;
  onApply: (start: string, end: string) => void;
  onClose: () => void;
}) => {
  const { theme } = useContext<any>(ThemeContext);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState({});

  const today = new Date().toISOString().split('T')[0];

  const onDayPress = (day: any) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate(null);
      setMarkedDates({
        [day.dateString]: {
          startingDay: true,
          color: PRIMARY,
          textColor: '#fff',
        },
      });
    } else {
      if (day.dateString < startDate) return;

      setEndDate(day.dateString);
      setMarkedDates(getMarkedRange(startDate, day.dateString));
    }
  };

  const onClear = () => {
    setStartDate(null);
    setEndDate(null);
    setMarkedDates({});
  };

  const onApplyPress = () => {
    onApply(startDate ?? '', endDate ?? '');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* HEADER */}
          <Text style={styles.title}>Select Date Range</Text>

          {/* CALENDAR */}
          <Calendar
            markingType="period"
            markedDates={markedDates}
            maxDate={today}
            enableSwipeMonths // 👈 smooth month animation
            onDayPress={onDayPress}
          />

          {/* FOOTER */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClear}>
              <Text
                font={FONTS.Lato.SemiBold}
                size={getScaleSize(14)}
                color={theme._214C65}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onApplyPress}
              style={[
                styles.applyBtn
              ]}>
              <Text
                font={FONTS.Lato.SemiBold}
                size={getScaleSize(14)}
                color={theme.white}>Apply</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: Dimensions.get('window').width - getScaleSize(48),
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: getScaleSize(12),
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: getScaleSize(12),
    paddingHorizontal: getScaleSize(16),
  },
  clear: {
    color: 'red',
    fontSize: 14,
  },
  applyBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyText: {
    color: '#fff',
    fontSize: 14,
  },
});


export default DateRangeModal;
