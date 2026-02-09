import {StyleProp, ViewStyle} from 'react-native';
import React, { useContext } from 'react';

//PACKAGES
import {getScaleSize, useString} from '../constant';
import {CountryPicker} from 'react-native-country-codes-picker';
import { ThemeContext } from '../context/ThemeProvider';

interface SheetProps {
  style?: StyleProp<ViewStyle> | undefined;
  title?: string | '';
  bottomSheetRef?: any;
  isVisible?: boolean | undefined;
  chnageBackground?: boolean | undefined;
  subTitle?: string | '';
  alartMessage?: string | '';
  isButton?: string | '';
  onPress?: any;
  onClose?: () => void;
  isTitleSubtitle?: boolean | undefined;
  height?: any;
  onChangeText?: any;
  searchText?: string;
  data?: any;
  selected?: any;
}

export default function SelectCountrySheet(props: SheetProps) {

  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  const {isVisible, onClose, height, onPress} = props;

  return (
    <CountryPicker
      lang="en"
      show={isVisible ?? false}
      pickerButtonOnPress={(item: any) => {
        onPress(item);
      }}
      inputPlaceholderTextColor={theme.black}
      inputPlaceholder={STRING.Search}
      onBackdropPress={onClose}
      style={{
        modal: {
          height: height ?? getScaleSize(500),
          borderTopLeftRadius: getScaleSize(20),
          borderTopRightRadius: getScaleSize(20),
        },
        textInput: {
          borderRadius: getScaleSize(10),
          borderWidth: 1,
          borderColor: theme._BFBFBF,
          padding: getScaleSize(10),
          marginBottom: getScaleSize(15),
          marginTop: getScaleSize(15),
        },
        countryName: {
          fontSize: 16,
        },
        dialCode: {
          fontSize: 16,
          fontWeight: '500',
        },
      }}
    />
  );
}
