import {
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Image,
  View,
} from 'react-native';
import React, { useContext } from 'react';

//COMPONENTS
import Text from './Text';

//ASSETS & CONSTANT
import { FONTS } from '../assets';
import { getScaleSize } from '../constant';
import { ThemeContext, ThemeContextType } from '../context';


interface ButtonProps {
  title?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
}

const Button = (props: ButtonProps) => {
  const { theme } = useContext<any>(ThemeContext)
  const { style, title, onPress, disabled } = props;

  return (
    <TouchableOpacity onPress={onPress} style={[styles(theme).gradient, { backgroundColor: disabled ? theme._DFE8ED : theme._214C65 }, style]} activeOpacity={0.8}>
      <Text
        align="center"
        font={FONTS.Lato.Bold}
        size={getScaleSize(19)}
        lineHeight={getScaleSize(24)}
        color={disabled ?  theme._214C65 : theme.white}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = (theme: ThemeContextType['theme']) => StyleSheet.create({
  gradient: {
    borderRadius: getScaleSize(12),
    paddingVertical: getScaleSize(18),
  }
});

export default Button;
