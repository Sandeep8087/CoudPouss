import {
  Image,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {memo, useCallback, useContext, useMemo, useState} from 'react';
import {ThemeContext, ThemeContextType} from '../context/ThemeProvider';
import {getScaleSize, useString} from '../constant';
import Text from './Text';
import {FONTS, IMAGES} from '../assets';
import Tooltip from 'react-native-walkthrough-tooltip';
import { useTranslation } from 'react-i18next';


function ServiceItem(props: any) {

  const STRING = useString();
  const { t } = useTranslation();
  const {
    item,
    itemContainer,
    isSelected,
    isDisabled,
    onPress,
    isReview,
    isSelectedBox,
    isManage,
    isOpen,
    onRemove,
    onEdit,
  } = props;
  const {theme} = useContext<any>(ThemeContext);
  const actionTypes = useMemo(
    () => [
      {id: 1, title: STRING.remove, icon: IMAGES.trash2},
      {id: 2, title: STRING.add_more, icon: IMAGES.edit},
    ],
    [STRING.remove, STRING.add_more],
  );

  const [visible, setVisible] = useState(false);

  const handlePress = useCallback(() => {
    if (isDisabled || isManage) {
      return;
    }
    onPress?.(item);
  }, [isDisabled, isManage, onPress, item]);

  const handleMenuAction = useCallback(
    (typeId: number) => {
      if (typeId === 1) {
        onRemove?.(item);
      } else {
        onEdit?.(item);
      }
    },
    [onEdit, onRemove, item],
  );

  return (
        <TouchableOpacity
            activeOpacity={0.9}
            disabled={isDisabled || isManage}
            onPress={handlePress}
            style={[styles(theme).container, itemContainer, { opacity: isDisabled ? 0.5 : 1 }]}>
            {isSelectedBox &&
                <Image
                    source={{ uri: item.image }}
                    resizeMode='cover'
                    style={styles(theme).iconView}
                />
            }
            {isReview &&
                <Image
                    source={{ uri: item.image }}
                    resizeMode='cover'
                    style={styles(theme).reviewIcon}
                />
            }
            {isManage &&
                <Image source={{ uri: item.image }} resizeMode='cover' style={styles(theme).iconView} />
            }
            <Text
                style={styles(theme).nameView}
                size={getScaleSize(18)}
                font={FONTS.Lato.SemiBold}
                color={theme._323232}
            >
                {t(item.subcategory_name) ?? ''}
            </Text>
            {isReview &&
                (
                    <Image
                        source={IMAGES.ic_delete}
                        style={styles(theme).deleteIcon}
                    />
                )
            }
            {isSelectedBox &&
                <>
                    {isSelected || isDisabled ? (
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
            }
            {isManage &&
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
                                {actionTypes.map((type, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles(theme).dropdownItem}
                                        onPress={() => handleMenuAction(type.id)}
                                    >
                                        <View style={styles(theme).dropdownItemContainer}>
                                            <Text
                                                style={{ flex: 1.0 }}
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
                        }
                    >
                        <TouchableOpacity
                            style={styles(theme).iconContainer}
                            onPress={() => {
                                setVisible(true);
                            }}>
                            <Image
                                source={IMAGES.ic_dott_line}
                                style={styles(theme).icon}
                            />

                        </TouchableOpacity>
                    </Tooltip>
                </>
            }
        </TouchableOpacity>
    );
}

function areEqual(prevProps: any, nextProps: any) {
  return (
    prevProps?.item?.id === nextProps?.item?.id &&
    prevProps?.item?.sub_category_id === nextProps?.item?.sub_category_id &&
    prevProps?.item?.subcategory_name === nextProps?.item?.subcategory_name &&
    prevProps?.item?.image === nextProps?.item?.image &&
    prevProps?.isSelected === nextProps?.isSelected &&
    prevProps?.isDisabled === nextProps?.isDisabled &&
    prevProps?.isReview === nextProps?.isReview &&
    prevProps?.isSelectedBox === nextProps?.isSelectedBox &&
    prevProps?.isManage === nextProps?.isManage &&
    prevProps?.onPress === nextProps?.onPress &&
    prevProps?.onRemove === nextProps?.onRemove &&
    prevProps?.onEdit === nextProps?.onEdit
  );
}

export default memo(ServiceItem, areEqual);

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
