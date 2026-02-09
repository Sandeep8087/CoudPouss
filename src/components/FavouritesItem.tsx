import {
  Dimensions,
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

//CONSTANTS & ASSETS
import { getScaleSize, useString } from '../constant';
import { FONTS, IMAGES } from '../assets';

//COMPONENTS
import Text from './Text';

function FavouritesItem(props: any) {
  const STRING = useString();
  const { theme } = useContext(ThemeContext);
  const { itemContainer, item, onPressItem } = props;

  return (
    <TouchableOpacity
    onPress={() => {
      onPressItem(item);
    }}
     style={[styles(theme).container, itemContainer]}>
      <Image style={styles(theme).userImage} source={{ uri: item?.provider?.profile_picture_url }} />
      <TouchableOpacity
        style={styles(theme).likeImageContainer}
        onPress={() => {
          props.onPressFavorite(item);
        }}>
        <Image style={styles(theme).likeImage} source={IMAGES.like} />
      </TouchableOpacity>
      <Text
        size={getScaleSize(18)}
        font={FONTS.Lato.SemiBold}
        color={theme._323232}>
        {item?.provider?.full_name ?? '-'}
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <Text
          size={getScaleSize(17)}
          font={FONTS.Lato.Medium}
          color={theme._6D6D6D}>
          {item?.average_rating ?? '0.0'}
        </Text>
        <Image style={styles(theme).starImage} source={IMAGES.star} />
        <View style={{ flex: 1.0 }} />
        <Text
          size={getScaleSize(11)}
          style={{ alignSelf: 'center' }}
          font={FONTS.Lato.Regular}
          color={theme._999999}>
          {`(${item?.total_reviews ?? '0'} Reviews)`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: getScaleSize(14),
      paddingVertical: getScaleSize(8),
      borderRadius: getScaleSize(18),
      borderWidth: 1,
      borderColor: theme._DFE8ED,
      width: (Dimensions.get('window').width - getScaleSize(64)) / 2,
    },
    userImage: {
      height: getScaleSize(92),
      width: getScaleSize(92),
      borderRadius: getScaleSize(46),
      alignSelf: 'center',
      backgroundColor: theme._D5D5D5,
    },
    likeImageContainer: {
      paddingHorizontal: getScaleSize(16),
      paddingVertical: getScaleSize(14),
      position: 'absolute',
      right: getScaleSize(0),
      top: getScaleSize(0),
    },
    likeImage: {
      height: getScaleSize(20),
      width: getScaleSize(20),
      
    },
    starImage: {
      height: getScaleSize(16),
      width: getScaleSize(16),
      alignSelf: 'center',
      tintColor: '#F0B52C',
      marginLeft: getScaleSize(4)
    }
  });

export default FavouritesItem;
