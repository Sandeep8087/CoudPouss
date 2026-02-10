import {
  FlexAlignType,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, {useContext} from 'react';

//CONTEXT
import {ThemeContext, ThemeContextType} from '../context';

//CONSTANTS & ASSETS
import {getScaleSize, useString} from '../constant';
import {FONTS, IMAGES} from '../assets';

//COMPONENTS
import Text from './Text';
import {flatMap, head} from 'lodash';

const SearchComponent = (props: any) => {
  const STRING = useString();
  const {theme} = useContext(ThemeContext);

  return (
    <View style={styles(theme).searchView}>
      <View style={styles(theme).searchBox}>
        <Image style={styles(theme).searchImage} source={IMAGES.search} />
        <TextInput
          style={styles(theme).searchInput}
          placeholderTextColor={'#939393'}
          placeholder={STRING.Search}
          value={props.value}
          onChangeText={text => props.onChangeText(text)}
        />
      </View>
      <TouchableOpacity
        onPress={props.onPressMicrophone}
        style={styles(theme).microPhoneContainer}>
        <Image
          style={styles(theme).microPhoneImage}
          source={IMAGES.microphone_new}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      // paddingHorizontal: getScaleSize(20),
    },
    searchView: {
      flexDirection: 'row',
    },
    searchBox: {
      flexDirection: 'row',
      flex: 1.0,
      alignItems: 'center' as FlexAlignType,
      backgroundColor: theme.white,
      borderWidth: 1,
      borderColor: '#BECFDA',
      borderRadius: getScaleSize(12),
      // marginTop: getScaleSize(23),
      paddingHorizontal: getScaleSize(16),
      // paddingVertical: getScaleSize(4),
      height: getScaleSize(53),
    },
    searchImage: {
      height: getScaleSize(24),
      width: getScaleSize(24),
      alignSelf: 'center' as FlexAlignType,
    },
    imgMicroPhone: {
      height: getScaleSize(56),
      width: getScaleSize(56),
      alignSelf: 'center' as FlexAlignType,
      marginLeft: getScaleSize(16),
    },
    searchInput: {
      fontFamily: FONTS.Lato.Regular,
      fontSize: getScaleSize(18),
      color: theme.black,
      marginLeft: getScaleSize(12),
      flex: 1.0,
    },
    microPhoneContainer: {
      backgroundColor: theme.white,
      borderRadius: getScaleSize(12),
      paddingHorizontal: getScaleSize(16),
      paddingVertical: getScaleSize(4),
      marginLeft: getScaleSize(16),
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#BECFDA',
      height: getScaleSize(53),
    },
    microPhoneImage: {
      height: getScaleSize(24),
      width: getScaleSize(24),
      alignSelf: 'center',
    },
    userImage: {
      overflow: 'visible',
      width: getScaleSize(240),
      height: getScaleSize(225),
      marginTop: getScaleSize(32),
      backgroundColor: '#1E4A5D',
      borderRadius: 112,
      left: -56,
      top: 26,
    },
    workerImage: {
      height: getScaleSize(250),
      width: getScaleSize(151),
      position: 'absolute',
      resizeMode: 'cover',
      left: 50,
      top: -45,
    },
    notificationContainer: {
      height: getScaleSize(24),
      width: getScaleSize(24),
      alignSelf: 'center',
    },
    placeholderImage: {
      height: getScaleSize(34),
      width: getScaleSize(34),
      borderRadius: getScaleSize(17),
      alignSelf: 'center',
    },
    bottomText: {
      flexDirection: 'row',
      marginLeft: getScaleSize(16),
    },
    textView: {
      justifyContent: 'center',
      marginTop: getScaleSize(32),
      marginLeft: getScaleSize(-24),
    },
  });
export default SearchComponent;
