import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useContext } from 'react';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../context';

import i18n from '../Translation/i18n';

//CONSTANTS & ASSETS
import { arrayIcons, getScaleSize, useString } from '../constant';
import { FONTS, IMAGES } from '../assets';

//COMPONENTS
import Text from './Text';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

function RequestItem(props: any) {
  const STRING = useString();
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();



  const { item, selectedFilter, isFromSearch } = props;

  function getStatus(status: any) {
    if (status === 'open') {
      return STRING.open_proposal;
    } else if (status === 'pending') {
      return STRING.responses;
    } else if (status === 'accepted') {
      return STRING.validation;
    } else if (status === 'completed') {
      return STRING.completed;
    } else if (status === 'cancelled') {
      return STRING.cancelled;
    } else if (status === 'expired') {
      return STRING.expired;
    }
  }

  return (
    <TouchableOpacity
      style={styles(theme).container}
      disabled={(item?.status?.toLowerCase() === 'expired') ? true : false}
      onPress={() => {
        props.onPress();
      }}>
      <View style={styles(theme).horizontalContainer}>
        <View style={styles(theme).imageContainer}>
          {item?.category_logo ? (
            <Image
              source={{ uri: isFromSearch ? item?.category_logo_url : item?.category_logo }}
              style={[styles(theme).imageIcon, { tintColor: theme.white }]}
              resizeMode="cover"
            />
          ) : (
            <View style={styles(theme).imageIcon} />
          )}
        </View>
        <Text
          style={{ marginLeft: getScaleSize(16), alignSelf: 'center' }}
          size={getScaleSize(24)}
          font={FONTS.Lato.Bold}
          color={theme.primary}>
          {`${t(item.category_name)} ${STRING.service}`}
        </Text>
      </View>
      <View
        style={{
          flex: 1.0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: getScaleSize(12),
        }}>
        <Text
          style={{ flex: 1.0 }}
          size={getScaleSize(20)}
          font={FONTS.Lato.SemiBold}
          color={theme.primary}>
          {t(item?.sub_category_name) ?? ''}
        </Text>
        {selectedFilter?.title === STRING.all && (
          <View style={styles(theme).statusContainer}>
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.SemiBold}
              color={theme._F0B52C}>
              {isFromSearch === true ? getStatus(item?.task_status) : getStatus(item?.status)}
            </Text>
          </View>
        )}
      </View>
      <View style={styles(theme).detailsView}>
        <View style={styles(theme).horizontalContainer}>
          <Text
            style={{ flex: 1.0 }}
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={theme._989898}>
            {STRING.Valuation}
          </Text>
          <Text
            size={getScaleSize(20)}
            font={FONTS.Lato.SemiBold}
            color={theme.primary}>
            {item?.total_renegotiated
              ? item.total_renegotiated === 'Barter Product'
                ? 'Barter Product'
                : `€${item.total_renegotiated}`
              : ''}
          </Text>
        </View>
        <View
          style={[
            styles(theme).horizontalContainer,
            { marginTop: getScaleSize(3) },
          ]}>
          <Text
            style={{ flex: 1.0 }}
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={theme._989898}>
            {STRING.JobDate}
          </Text>
          <Text
            size={getScaleSize(20)}
            font={FONTS.Lato.SemiBold}
            color={theme.primary}>
            {moment.utc(item?.chosen_datetime).local().format('DD MMM')}
          </Text>
        </View>
        <View
          style={[
            styles(theme).horizontalContainer,
            { marginTop: getScaleSize(3) },
          ]}>
          <Text
            style={{ flex: 1.0 }}
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={theme._989898}>
            {STRING.JobTime}
          </Text>
          <Text
            size={getScaleSize(20)}
            font={FONTS.Lato.SemiBold}
            color={theme.primary}>
            {moment.utc(item?.chosen_datetime).local().format('hh:mm A')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      marginHorizontal: getScaleSize(24),
      marginBottom: getScaleSize(18),
      borderRadius: getScaleSize(16),
      backgroundColor: theme._EAF0F3,
      paddingHorizontal: getScaleSize(16),
      paddingVertical: getScaleSize(16),
    },
    horizontalContainer: {
      flexDirection: 'row',
    },
    imageContainer: {
      height: getScaleSize(44),
      width: getScaleSize(44),
      borderRadius: getScaleSize(10),
      backgroundColor: theme._2C6587,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageIcon: {
      width: getScaleSize(24),
      height: getScaleSize(24),
    },
    detailsView: {
      backgroundColor: theme.white,
      borderRadius: getScaleSize(12),
      paddingVertical: getScaleSize(16),
      paddingHorizontal: getScaleSize(16),
      marginTop: getScaleSize(16),
    },
    statusContainer: {
      backgroundColor: theme.white,
      borderRadius: getScaleSize(16),
      paddingVertical: getScaleSize(4),
      paddingHorizontal: getScaleSize(10),
      marginLeft: getScaleSize(8),
    },
  });

export default RequestItem;
