import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Platform,
  PermissionsAndroid,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  NativeModules,
} from 'react-native';
import Voice, {
  SpeechStartEvent,
  SpeechEndEvent,
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechRecognizedEvent,
} from '@react-native-voice/voice';

async function requestAndroidPermission() {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Microphone Permission',
      message: 'We need access to your microphone to recognize speech.',
      buttonPositive: 'OK',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export default function SpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [partial, setPartial] = useState<string>('');
  const [finalText, setFinalText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const localeRef = useRef('en-US'); // e.g., 'en-IN', 'hi-IN', 'fr-FR' etc.

  console.log('dskajhdksahkdhsakh:::>>>', NativeModules.Voice);
  // Bind/unbind Voice events
  useEffect(() => {
    Voice.onSpeechStart = (_e: SpeechStartEvent) => {
      setError('');
    };
    Voice.onSpeechRecognized = (_e: SpeechRecognizedEvent) => {
      /* fired when engine detects speech */
    };
    Voice.onSpeechEnd = (_e: SpeechEndEvent) => {
      setIsListening(false);
      setLoading(false);
    };
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      const text = e.value?.[0] ?? '';
      setFinalText(text);
      setPartial('');
    };
    Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
      const text = e.value?.[0] ?? '';
      setPartial(text);
    };
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      setError(e.error?.message ?? 'Unknown error');
      setIsListening(false);
      setLoading(false);
    };

    return () => {
      Voice.destroy().finally(() => Voice.removeAllListeners());
    };
  }, []);

  const start = useCallback(async () => {
    const ok = await requestAndroidPermission();
    if (!ok) {
      setError('Microphone permission denied.');
      return;
    }
    try {
      setFinalText('');
      setPartial('');
      setError('');
      setLoading(true);
      setIsListening(true);

      // Start listening: set continuous to true for ongoing partials on Android
      await Voice.start(localeRef.current, {
        EXTRA_PARTIAL_RESULTS: true,
        // Android extras:
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 1500,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 1000,
        EXTRA_MAX_RESULTS: 3,
      });
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setIsListening(false);
      setLoading(false);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await Voice.stop(); // ends current session, triggers onSpeechEnd
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }, []);

  const cancel = useCallback(async () => {
    try {
      await Voice.cancel(); // cancels recognition (no results)
      setIsListening(false);
      setLoading(false);
      setPartial('');
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }, []);

  const destroy = useCallback(async () => {
    try {
      await Voice.destroy();
      setIsListening(false);
      setLoading(false);
      setFinalText('');
      setPartial('');
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Speech to Text</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Final Text:</Text>
        <Text style={styles.output}>{finalText || '—'}</Text>

        <Text style={styles.label}>Partial (live):</Text>
        <Text style={styles.outputMuted}>{partial || '—'}</Text>

        {!!error && <Text style={styles.error}>Error: {error}</Text>}
      </View>

      <View style={styles.row}>
        <RoundButton onPress={start} disabled={isListening} text="Start" />
        <RoundButton onPress={stop} disabled={!isListening} text="Stop" />
        <RoundButton onPress={cancel} text="Cancel" />
        <RoundButton onPress={destroy} text="Reset" />
      </View>

      {loading && <ActivityIndicator style={{marginTop: 12}} />}
      <Text style={styles.tip}>
        Tip: Change locale (e.g., "en-IN", "hi-IN") with{' '}
        <Text style={styles.mono}>localeRef.current = 'hi-IN'</Text> then press
        Start.
      </Text>
    </View>
  );
}

function RoundButton({
  text,
  onPress,
  disabled,
}: {
  text: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, disabled && {opacity: 0.5}]}>
      <Text style={styles.btnText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, paddingTop: 28},
  title: {fontSize: 22, fontWeight: '700', marginBottom: 12},
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  label: {fontSize: 14, fontWeight: '600', marginTop: 8},
  output: {fontSize: 16, marginTop: 4},
  outputMuted: {fontSize: 16, marginTop: 4, opacity: 0.6},
  error: {color: '#b00020', marginTop: 8},
  row: {flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap'},
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#333',
  },
  btnText: {fontWeight: '700'},
  tip: {marginTop: 16, opacity: 0.8},
  mono: {fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'})},
});
