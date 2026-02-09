import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext} from 'react';

//CONTEXT
import {ThemeContext, ThemeContextType} from '../context';

//CONSTANTS & ASSETS
import {arrayIcons, getScaleSize, useString} from '../constant';
import {FONTS, IMAGES} from '../assets';

//COMPONENTS
import Text from './Text';
import moment from 'moment';

function RequestItem(props: any) {
  const STRING = useString();
  const {theme} = useContext(ThemeContext);

  const {item, selectedFilter} = props;

  function getStatus(status: any) {
    if (status === 'open') {
      return 'Open Proposal';
    } else if (status === 'pending') {
      return 'Responsed';
    } else if (status === 'accepted') {
      return 'Validation';
    } else if (status === 'completed') {
      return 'Completed';
    } else if (status === 'cancelled') {
      return 'Cancelled';
    }
  }

  return (
    <TouchableOpacity
      style={styles(theme).container}
      onPress={() => {
        props.onPress();
      }}>
      <View style={styles(theme).horizontalContainer}>
        <View style={styles(theme).imageContainer}>
          {item?.category_name ? (
            <Image
              source={
                arrayIcons[
                  item?.category_name?.toLowerCase() as keyof typeof arrayIcons
                ] ?? (arrayIcons['diy'] as any)
              }
              style={[styles(theme).imageIcon, {tintColor: theme.white}]}
              resizeMode="cover"
            />
          ) : (
            <View style={styles(theme).imageIcon} />
          )}
        </View>
        <Text
          style={{marginLeft: getScaleSize(16), alignSelf: 'center'}}
          size={getScaleSize(24)}
          font={FONTS.Lato.Bold}
          color={theme.primary}>
          {`${item?.category_name} Service`}
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
          style={{flex: 1.0}}
          size={getScaleSize(20)}
          font={FONTS.Lato.SemiBold}
          color={theme.primary}>
          {item?.sub_category_name ?? ''}
        </Text>
        {selectedFilter?.title === 'All' && (
          <View style={styles(theme).statusContainer}>
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.SemiBold}
              color={theme._F0B52C}>
              {getStatus(item?.status)}
            </Text>
          </View>
        )}
      </View>
      <View style={styles(theme).detailsView}>
        <View style={styles(theme).horizontalContainer}>
          <Text
            style={{flex: 1.0}}
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={theme._989898}>
            {STRING.Valuation}
          </Text>
          <Text
            size={getScaleSize(20)}
            font={FONTS.Lato.SemiBold}
            color={theme.primary}>
            {`€${item?.total_renegotiated}`}
          </Text>
        </View>
        <View
          style={[
            styles(theme).horizontalContainer,
            {marginTop: getScaleSize(3)},
          ]}>
          <Text
            style={{flex: 1.0}}
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={theme._989898}>
            {STRING.JobDate}
          </Text>
          <Text
            size={getScaleSize(20)}
            font={FONTS.Lato.SemiBold}
            color={theme.primary}>
            {moment(item?.chosen_datetime).format('DD MMM')}
          </Text>
        </View>
        <View
          style={[
            styles(theme).horizontalContainer,
            {marginTop: getScaleSize(3)},
          ]}>
          <Text
            style={{flex: 1.0}}
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={theme._989898}>
            {STRING.JobTime}
          </Text>
          <Text
            size={getScaleSize(20)}
            font={FONTS.Lato.SemiBold}
            color={theme.primary}>
            {moment(item?.chosen_datetime).format('hh:mm A')}
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
