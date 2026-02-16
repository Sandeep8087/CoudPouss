import {
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import React, { memo, useContext } from 'react';

//ASSETS & CONSTANT
import { FONTS, IMAGES } from '../assets';
import { getScaleSize } from '../constant';

//CONTEXT
import Text from './Text';
import { ThemeContext, ThemeContextType } from '../context';

interface InputProps {
  continerStyle?: StyleProp<ViewStyle>;
  value?: any;
  icon?: any;
  onChnageIcon?: () => void;
  onPress?: () => void;
  passwordIcon?: boolean;
  secureTextEntry?: boolean;
  searchBox?: any;
  inputContainer?: StyleProp<ViewStyle>;
  isError?: string;
  inputTitle?: string;
  inputColor?: boolean;
  countryCode?: string;
  countryFlag?: string;
  onPressCountryCode?: () => void;
  quantityIcon?: any;
  onPressQuantityRemove?: () => void;
  onPressQuantityAdd?: () => void;
}

function Input(props: InputProps & TextInputProps) {
  const {
    onChnageIcon,
    icon,
    continerStyle,
    passwordIcon,
    secureTextEntry,
    inputContainer,
    placeholderTextColor,
    searchBox,
    isError,
    inputTitle,
    inputColor,
    countryCode,
    countryFlag,
    onPressCountryCode,
    quantityIcon,
    onPressQuantityRemove,
    onPressQuantityAdd
  } = props;

  const { theme } = useContext<any>(ThemeContext);

  return (
    <View style={continerStyle}>
      {inputTitle && (
        <Text
          size={getScaleSize(17)}
          font={FONTS.Lato.Medium}
          color={inputColor ? theme._424242 : theme.primary}
          style={{ marginBottom: getScaleSize(8) }}>
          {inputTitle}
        </Text>
      )}
      <View style={[styles(theme).flexView, { flex: 1.0 }]}>
        {countryCode && (
          <Pressable
            onPress={onPressCountryCode}
            style={[styles(theme).container,
            {
              borderColor: isError ? theme._EF5350 : theme._D5D5D5,
              height: Platform.OS == 'ios' ? getScaleSize(56) : getScaleSize(56),
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: getScaleSize(14),
              paddingHorizontal: getScaleSize(10),
            },
            ]}>
            <Text
              size={getScaleSize(20)}
              font={FONTS.Lato.Bold}
              color={theme._2B2B2B}
            >
              {countryFlag}
            </Text>
            <Text
              style={{ marginLeft: getScaleSize(5) }}
              size={getScaleSize(16)}
              font={FONTS.Lato.Medium}
              color={theme._2B2B2B}
            >
              {countryCode}
            </Text>
            <Image
              source={IMAGES.ic_down}
              style={styles(theme).downIcon}
              resizeMode={'contain'}
            />
          </Pressable>
        )}
        <Pressable
          onPress={props.onPress}
          style={[
            styles(theme).container,
            {
              borderColor: isError ? theme._EF5350 : theme._D5D5D5,
              flex: 1.0,
            },
          ]}>
          {searchBox && (
            <View>
              <Image
                source={searchBox}
                style={styles(theme).leftIcon}
                resizeMode={'contain'}
              />
            </View>
          )}
          <TextInput
            {...props}
            style={[styles(theme).input, inputContainer]}
            placeholderTextColor={
              placeholderTextColor
                  ? placeholderTextColor
                  : theme._939393
            }
            multiline={props?.multiline ?? false}
            numberOfLines={props?.numberOfLines ?? 1}
            value={props.value}
            secureTextEntry={secureTextEntry}
          />
          {icon && (
            <View>
              <Image
                source={icon}
                style={[styles(theme).rightIcon]}
                resizeMode={'contain'}
              />
            </View>
          )}
          {quantityIcon && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable onPress={onPressQuantityRemove}>
                <Image
                  source={IMAGES.quantity_remove}
                  style={[styles(theme).rightIcon, { marginHorizontal: getScaleSize(10) }]}
                  resizeMode={'contain'}
                />
              </Pressable>
              <Pressable onPress={onPressQuantityAdd}>
                <Image
                  source={IMAGES.quantity_add}
                  style={[styles(theme).rightIcon, { marginHorizontal: getScaleSize(10) }]}
                  resizeMode={'contain'}
                />
              </Pressable>
            </View>
          )}
          {passwordIcon && (
            <Pressable onPress={onChnageIcon}>
              <Image
                source={secureTextEntry ? IMAGES.ic_hide : IMAGES.ic_show}
                style={[
                  styles(theme).rightIcon,
                  { tintColor: isError ? theme._EF5350 : theme._2C6587 },
                ]}
                resizeMode={'contain'}
              />
            </Pressable>
          )}
        </Pressable>
      </View>
      {isError && (
        <Text
          style={{ marginTop: getScaleSize(4) }}
          size={getScaleSize(16)}
          font={FONTS.Lato.SemiBold}
          color={theme._EF5350}>
          {isError ? isError : ''}
        </Text>
      )}
    </View>
  );
}

export default memo(Input);

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: getScaleSize(16),
      borderWidth: 1,
      borderRadius: getScaleSize(12),
    },
    input: {
      fontSize: getScaleSize(16),
      fontFamily: FONTS.Lato.Medium,
      color: theme._31302F,
      flex: 1.0,
      height: Platform.OS == 'ios' ? getScaleSize(56) : getScaleSize(56),
    },
    rightIcon: {
      width: getScaleSize(20),
      height: getScaleSize(20),
    },
    leftIcon: {
      width: getScaleSize(16),
      height: getScaleSize(16),
      marginRight: getScaleSize(10),
    },
    downIcon: {
      width: getScaleSize(20),
      height: getScaleSize(20),
      marginLeft: getScaleSize(5),
    },
    flexView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
