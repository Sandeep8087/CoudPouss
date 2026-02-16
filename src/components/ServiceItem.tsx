import {
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useContext, useState} from 'react';
import {ThemeContext, ThemeContextType} from '../context/ThemeProvider';
import {getScaleSize} from '../constant';
import Text from './Text';
import {FONTS, IMAGES} from '../assets';
import Tooltip from 'react-native-walkthrough-tooltip';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function ServiceItem(props: any) {
  const {
    item,
    itemContainer,
    isSelected,
    onPress,
    isReview,
    isSelectedBox,
    isManage,
    isOpen,
    onRemove,
    onEdit,
  } = props;
  const {theme} = useContext<any>(ThemeContext);

  const [visible, setVisible] = useState(false);
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        onPress(item);
      }}
      style={[styles(theme).container, itemContainer]}>
      {isSelectedBox && (
        <Image
          source={{uri: item.image}}
          resizeMode="cover"
          style={styles(theme).iconView}
        />
      )}
      {isReview && (
        <Image
          source={{uri: item.image}}
          resizeMode="cover"
          style={styles(theme).reviewIcon}
        />
      )}
      {isManage && (
        <Image
          source={{uri: item.image}}
          resizeMode="cover"
          style={styles(theme).iconView}
        />
      )}
      <Text
        style={styles(theme).nameView}
        size={getScaleSize(18)}
        font={FONTS.Lato.SemiBold}
        color={theme._323232}>
        {item.subcategory_name ?? ''}
      </Text>
      {isReview && (
        <Image source={IMAGES.ic_delete} style={styles(theme).deleteIcon} />
      )}
      {isSelectedBox && (
        <>
          {isSelected ? (
            <Image
              source={IMAGES.ic_checkbox_select}
              style={styles(theme).icon}
            />
          ) : (
            <Image
              source={IMAGES.ic_checkBox_unSelect}
              style={styles(theme).icon}
            />
          )}
        </>
      )}
      {isManage && (
        <>
          <Tooltip
            isVisible={visible}
            placement="bottom"
            backgroundColor="transparent"
            disableShadow={true}
            topAdjustment={-(StatusBar.currentHeight ?? 0)}
            contentStyle={styles(theme).tooltipContent}
            onClose={() => setVisible(false)}
            content={
              <View style={{}}>
                {[
                  {title: 'Remove', icon: IMAGES.trash2},
                  {title: 'Edit', icon: IMAGES.edit},
                ].map((type, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles(theme).dropdownItem}
                    onPress={() => {
                      if (type.title === 'Remove') {
                        onRemove(item);
                        // setVisible(false);
                      } else {
                        onEdit(item);
                        // setVisible(false);
                      }
                    }}>
                    <View style={styles(theme).dropdownItemContainer}>
                      <Text
                        style={{flex: 1.0}}
                        size={getScaleSize(14)}
                        font={FONTS.Lato.SemiBold}
                        color={theme._555555}>
                        {type.title}
                      </Text>
                      <Image
                        source={type.icon}
                        style={styles(theme).itemIcon}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            }>
            <TouchableOpacity
              style={styles(theme).iconContainer}
              onPress={() => {
                setVisible(true);
              }}>
              <Image source={IMAGES.ic_dott_line} style={styles(theme).icon} />
            </TouchableOpacity>
          </Tooltip>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      padding: getScaleSize(10),
      backgroundColor: theme._F2F2F2,
      borderRadius: getScaleSize(20),
      flexDirection: 'row',
      alignItems: 'center',
      // position: 'relative',
      zIndex: 0,
      overflow: 'visible',
    },

    iconView: {
      width: getScaleSize(100),
      height: getScaleSize(80),
      borderRadius: getScaleSize(12),
      overflow: 'hidden',
      backgroundColor: theme._D5D5D5,
    },
    reviewIcon: {
      width: getScaleSize(80),
      height: getScaleSize(70),
      borderRadius: getScaleSize(12),
      overflow: 'hidden',
      backgroundColor: theme._D5D5D5,
    },
    nameView: {
      flex: 1.0,
      marginLeft: getScaleSize(16),
    },
    icon: {
      width: getScaleSize(24),
      height: getScaleSize(24),
      marginHorizontal: getScaleSize(10),
    },
    deleteIcon: {
      width: getScaleSize(20),
      height: getScaleSize(20),
      marginHorizontal: getScaleSize(10),
    },
    iconContainer: {
      paddingVertical: getScaleSize(15),
      paddingHorizontal: getScaleSize(10),
    },
    tooltipContent: {
      width: getScaleSize(130),
      paddingVertical: getScaleSize(12),
      paddingHorizontal: getScaleSize(13),
      backgroundColor: '#fff',
      borderRadius: getScaleSize(6),
      elevation: getScaleSize(5),
      shadowColor: theme.black,
      shadowOffset: {width: 0, height: getScaleSize(2)},
      shadowOpacity: 0.2,
      shadowRadius: getScaleSize(4),
    },
    dropdownItem: {
      paddingVertical: getScaleSize(5),
    },
    dropdownItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    itemIcon: {
      width: getScaleSize(20),
      height: getScaleSize(20),
      marginLeft: getScaleSize(10),
    },
  });
