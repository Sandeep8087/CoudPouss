import React from 'react';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-aware-scroll-view';
import { StyleProp, ViewStyle } from 'react-native';

interface KeyBoardAwareProps extends KeyboardAwareScrollViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const KeyBoardAware = ({
  children,
  style,
  contentContainerStyle,
  ...props
}: KeyBoardAwareProps) => {
  return (
    <KeyboardAwareScrollView
      {...props}
      enableOnAndroid
      extraScrollHeight={60}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={[{ flex: 1 }, style]}
      contentContainerStyle={[{ paddingBottom: 24 }, contentContainerStyle]}>
      {children}
    </KeyboardAwareScrollView>
  );
};

export default KeyBoardAware;
