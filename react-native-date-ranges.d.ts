declare module 'react-native-date-ranges' {
  import { Component } from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  interface CustomStyles {
    placeholderText?: TextStyle;
    contentText?: TextStyle;
    [key: string]: ViewStyle | TextStyle | undefined;
  }

  interface DatePickerProps {
    style?: ViewStyle;
    customStyles?: CustomStyles;
    centerAlign?: boolean;
    allowFontScaling?: boolean;
    placeholder?: string;
    mode?: 'range' | 'single';
    selectedBgColor?: string;
    selectedTextColor?: string;
    maxDate?: Date;
    minDate?: Date;
    onConfirm?: (startDate: Date, endDate?: Date) => void;
    [key: string]: any;
  }

  export default class DatePicker extends Component<DatePickerProps> {}
}
