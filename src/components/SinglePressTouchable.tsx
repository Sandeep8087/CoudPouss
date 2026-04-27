import React, { memo, useCallback, useRef } from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

type Props = TouchableOpacityProps & {
  delayMs?: number;
};

function isPromiseLike(value: any): value is Promise<any> {
  return value && typeof value.then === 'function' && typeof value.finally === 'function';
}

function SinglePressTouchable(props: Props) {
  const { onPress, delayMs = 800, disabled, ...rest } = props;
  const lockedRef = useRef(false);

  const handlePress = useCallback(
    (event: any) => {
      if (disabled) return;
      if (lockedRef.current) return;

      lockedRef.current = true;

      try {
        const result = onPress?.(event);

        if (isPromiseLike(result)) {
          result.finally(() => {
            lockedRef.current = false;
          });
          return;
        }
      } finally {
        setTimeout(() => {
          lockedRef.current = false;
        }, delayMs);
      }
    },
    [delayMs, disabled, onPress],
  );

  return <TouchableOpacity {...rest} disabled={disabled} onPress={handlePress} />;
}

export default memo(SinglePressTouchable);
