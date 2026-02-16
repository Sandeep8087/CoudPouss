import React, {useContext, useState} from 'react';
import {View, StyleSheet, Image, StyleProp, ViewStyle} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {IMAGES} from '../assets/images';
import Text from './Text';
import {getScaleSize} from '../constant/scaleSize';
import {FONTS} from '../assets';
import {ThemeContext, ThemeContextType} from '../context/ThemeProvider';
import {arrayIcons, useString} from '../constant';

interface DropdownProps {
  container?: StyleProp<ViewStyle>;
  data?: any;
  selectedItem?: any;
  onChange: (item: any) => void;
}

const CategoryDropdown = (props: DropdownProps) => {
  const {container, data, selectedItem, onChange} = props;
  const {theme} = useContext<any>(ThemeContext);

  const STRING = useString();

  const [isFocus, setIsFocus] = useState(false);

  const renderItem = (item: any) => {
    const isSelected = item?.id === selectedItem?.id;
    return (
      <View style={styles(theme).item}>
        <View style={styles(theme).iconLabelContainer}>
          <Image
            source={
              arrayIcons[
                item?.category_name?.toLowerCase() as keyof typeof arrayIcons
              ] ?? (arrayIcons['diy'] as any)
            }
            style={[
              styles(theme).icon,
              {tintColor: isSelected ? theme._2C6587 : theme._818285},
            ]}
            resizeMode="cover"
          />
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.SemiBold}
            color={isSelected ? theme._2C6587 : theme._818285}>
            {item.category_name}
          </Text>
        </View>
        {isSelected ? (
          <Image
            source={IMAGES.ic_radio_select}
            style={styles(theme).radioInner}
          />
        ) : (
          <Image
            source={IMAGES.ic_radio_unselect}
            style={styles(theme).radioInner}
          />
        )}
      </View>
    );
  };

  return (
    <View style={container}>
      <Dropdown
        style={[styles(theme).dropdown]}
        placeholderStyle={styles(theme).placeholderStyle}
        selectedTextStyle={styles(theme).selectedTextStyle}
        containerStyle={styles(theme).containerStyle}
        data={data}
        showsVerticalScrollIndicator={false}
        maxHeight={getScaleSize(500)}
        labelField="category_name"
        valueField="category_name"
        placeholder={STRING.select_category}
        value={selectedItem?.category_name ?? 'category_name'}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          onChange(item);
          setIsFocus(false);
        }}
        renderItem={renderItem}
        renderLeftIcon={() => {
          return (
            <>
              {selectedItem?.category_name && (
                <Image
                  source={
                    arrayIcons[
                      selectedItem?.category_name?.toLowerCase() as keyof typeof arrayIcons
                    ] ?? (arrayIcons['diy'] as any)
                  }
                  style={[styles(theme).icon, {tintColor: theme._2C6587}]}
                  resizeMode="cover"
                />
              )}
            </>
          );
        }}
      />
    </View>
  );
};

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    dropdown: {
      backgroundColor: theme.white,
      borderRadius: getScaleSize(12),
      paddingHorizontal: getScaleSize(16),
      paddingVertical: getScaleSize(16),
      borderWidth: 1,
      borderColor: theme._D5D5D5,
      // shadowColor: theme.black,
      // shadowOffset: { width: 0, height: 2 },
      // shadowOpacity: 0.15,
      // shadowRadius: getScaleSize(6),
      // elevation: 4,
    },
    placeholderStyle: {
      fontSize: getScaleSize(18),
      fontFamily: FONTS.Lato.Regular,
      color: theme._939393,
      lineHeight: getScaleSize(32),
    },
    selectedTextStyle: {
      fontSize: getScaleSize(16),
      fontFamily: FONTS.Lato.SemiBold,
      color: theme._2C6587,
    },
    containerStyle: {
      borderRadius: getScaleSize(20),
      overflow: 'hidden',
      shadowColor: theme.black,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.15,
      shadowRadius: getScaleSize(6),
      elevation: 4,
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: getScaleSize(14),
      paddingHorizontal: getScaleSize(20),
    },
    iconLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      marginRight: getScaleSize(14),
      width: getScaleSize(24),
      height: getScaleSize(24),
    },
    radioInner: {
      width: getScaleSize(36),
      height: getScaleSize(36),
    },
  });

export default CategoryDropdown;
