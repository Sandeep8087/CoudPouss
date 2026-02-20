import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useContext } from 'react';

//ASSET
import { FONTS, IMAGES, LIGHT_THEME_COLOR } from '../assets';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../context/ThemeProvider';

//CONSTANT
import { arrayIcons, getScaleSize, useString } from '../constant';

//COMPONENT
import Text from './Text';

//CONTEXT
import { AuthContext } from '../context';

//PACKAGES
import moment from 'moment';

export default function ServiceRequest(props: any) {

  const { theme } = useContext<any>(ThemeContext);

  const { profile } = useContext(AuthContext)

  const STRING = useString();

  const { data, onPress, onPressAccept } = props

  return (
    <TouchableOpacity
      style={styles(theme).container}
      activeOpacity={1}
      onPress={onPress}>
      {data?.subcategory_info?.sub_category_name?.service_photo === null ?
        <View style={[styles(theme).imageContainer, {
          backgroundColor: 'gray'
        }]}>
        </View>
        :
        <Image
          style={styles(theme).imageContainer}
          resizeMode='cover'
          source={{ uri: data?.subcategory_info?.sub_category_name?.img_url }}
        />
      }
      <View style={styles(theme).horizontalView}>
        <Text
          style={{ flex: 1.0 }}
          size={getScaleSize(24)}
          font={FONTS.Lato.Bold}
          color={theme._2C6587}>
          {data?.subcategory_info?.sub_category_name?.name}
        </Text>
        <Text
          style={{ alignSelf: 'center' }}
          size={getScaleSize(14)}
          font={FONTS.Lato.Medium}
          color={theme._737373}>
          {data?.created_ago ?? ''}
        </Text>
      </View>
      <View style={styles(theme).verticalView}>
        <View style={styles(theme).horizontalView}>
          <View style={styles(theme).itemView}>
            <Image
              style={styles(theme).informationIcon}
              source={IMAGES.calender}
            />
            <Text
              style={{
                marginHorizontal: getScaleSize(8),
                alignSelf: 'center',
              }}
              size={getScaleSize(14)}
              font={FONTS.Lato.Medium}
              color={theme._424242}>
              {data?.date ? moment.utc(data?.date).local().format('DD MMM, YYYY') : ''}
            </Text>
          </View>
          <View style={styles(theme).itemView}>
            <Image
              style={styles(theme).informationIcon}
              source={IMAGES.clock}
            />
            <Text
              style={{
                marginHorizontal: getScaleSize(8),
                alignSelf: 'center',
              }}
              size={getScaleSize(14)}
              font={FONTS.Lato.Medium}
              color={theme._424242}>
              {moment.utc(data?.time, "HH:mm").local().format("hh:mm A")}
            </Text>
          </View>
        </View>
        <View
          style={[styles(theme).horizontalView, { marginTop: getScaleSize(12) }]}>
          <View style={styles(theme).itemView}>
            {data?.category_info?.category_name?.name ?
              <Image
                style={[styles(theme).informationIcon, { tintColor: theme._1A3D51 }]}
                source={arrayIcons[data?.category_info?.category_name?.name?.toLowerCase() as keyof typeof arrayIcons] ?? arrayIcons['diy'] as any}
                resizeMode='cover'
              />
              :
              <View style={styles(theme).informationIcon} />
            }
            <Text
              style={{
                marginHorizontal: getScaleSize(8),
                alignSelf: 'center',
                flex: 1.0,
              }}
              size={getScaleSize(14)}
              font={FONTS.Lato.Medium}
              color={theme._424242}>
              {`${data?.category_info?.category_name?.name} Services`}
            </Text>
          </View>
          <View style={styles(theme).itemView}>
            <Image style={styles(theme).informationIcon} source={IMAGES.pin} />
            <Text
              style={{
                marginHorizontal: getScaleSize(8),

                flex: 1.0,
              }}
              size={getScaleSize(14)}
              font={FONTS.Lato.Medium}
              numberOfLines={4}
              color={theme._424242}>
              {data?.service_address ?? '-'}
            </Text>
          </View>
        </View>
      </View>
      {profile?.user?.service_provider_type === 'professional' ?
        <View
          style={[styles(theme).horizontalView, { marginTop: getScaleSize(24), alignItems: 'center' }]}>
          <View style={{ flex: 1.0 }}>
            <Text
              size={getScaleSize(14)}
              font={FONTS.Lato.Medium}
              color={'#424242'}>
              {STRING.EstimatedCost}
            </Text>
            <Text
              style={{ marginTop: getScaleSize(2) }}
              size={getScaleSize(27)}
              font={FONTS.Lato.ExtraBold}
              color={theme._2C6587}>
              {`€${parseFloat(data?.estimated_cost).toFixed(2)}`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles(theme).quateContainer}
            activeOpacity={1}
            onPress={onPressAccept}>
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.SemiBold}
              color={theme.white}>
              {STRING.Quote}
            </Text>
          </TouchableOpacity>
        </View>
        :
        <View style={styles(theme).buttonView}>
          <TouchableOpacity style={styles(theme).viewButton}
            onPress={onPress}>
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.SemiBold}
              color={theme._214C65}>
              {STRING.view}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles(theme).acceptButton}
            onPress={onPressAccept}>
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.SemiBold}
              color={theme.white}>
              {STRING.accept}
            </Text>
          </TouchableOpacity>
        </View>}
    </TouchableOpacity>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      marginBottom: getScaleSize(24),
      paddingHorizontal: getScaleSize(16),
      paddingVertical: getScaleSize(16),
      backgroundColor: '#EAF0F3',
      borderRadius: getScaleSize(20),
      flex: 1.0,
    },
    imageContainer: {
      height: getScaleSize(163),
      borderRadius: getScaleSize(20),
      width: '100%',
    },
    horizontalView: {
      flexDirection: 'row',
      marginTop: getScaleSize(16),
      flex: 1.0,
    },
    verticalView: {
      marginTop: getScaleSize(7),
      flex: 1.0,
    },
    informationIcon: {
      height: getScaleSize(25),
      width: getScaleSize(25),
      alignSelf: 'center',
    },
    itemView: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1.0,
    },
    quateContainer: {
      paddingVertical: getScaleSize(16),
      paddingHorizontal: getScaleSize(62),
      borderRadius: getScaleSize(12),
      backgroundColor: theme._214C65,
    },
    buttonView: {
      flexDirection: 'row',
      marginTop: getScaleSize(24),
      alignItems: 'center',
    },
    viewButton: {
      paddingVertical: getScaleSize(10),
      paddingHorizontal: getScaleSize(66),
      justifyContent: 'center',
      alignItems: "center",
      borderRadius: getScaleSize(12),
      borderColor: LIGHT_THEME_COLOR._214C65,
      borderWidth: 1,
      marginRight: getScaleSize(12)
    },
    acceptButton: {
      paddingVertical: getScaleSize(10),
      paddingHorizontal: getScaleSize(66),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: getScaleSize(12),
      backgroundColor: LIGHT_THEME_COLOR._214C65,
    }
  });
