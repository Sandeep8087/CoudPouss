import { IMAGES } from '../assets';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { Dimensions, Linking } from 'react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import { getScaleSize } from './scaleSize';
import RNFS from 'react-native-fs';

export const formatDecimalInput = (
  text: string,
  decimalLimit: number = 2
): string => {
  // Remove invalid characters
  let value = text.replace(/[^0-9.]/g, '');

  // Allow typing "." → "0."
  if (value === '.') return '0.';

  if (/^0\d+/.test(value)) {
    return '0';
  }

  // Allow only one dot
  const firstDot = value.indexOf('.');
  if (firstDot !== -1) {
    value =
      value.slice(0, firstDot + 1) +
      value.slice(firstDot + 1).replace(/\./g, '');
  }

  let [intPart = '', decPart] = value.split('.');

  // Max 7 digits before decimal
  if (intPart.length > 7) {
    intPart = intPart.slice(0, 7);
  }

  // Max 2 digits after decimal
  if (decPart && decPart.length > decimalLimit) {
    decPart = decPart.slice(0, decimalLimit);
  }

  // Rebuild value safely
  return value.includes('.')
    ? `${intPart}.${decPart ?? ''}`
    : intPart;
};

export const openStripeCheckout = async (url: any) => {
  try {
    if (await InAppBrowser.isAvailable()) {
      const result = await InAppBrowser.open(url, {
        // iOS
        dismissButtonStyle: 'close',
        preferredBarTintColor: '#ffffff',
        preferredControlTintColor: '#000000',
        readerMode: false,

        // Android
        showTitle: true,
        toolbarColor: '#ffffff',
        secondaryToolbarColor: '#ffffff',
        enableUrlBarHiding: true,
        enableDefaultShare: false,
        forceCloseOnRedirection: false,
      });
      console.log('result==>', result);
    } else {
      // Fallback
      Linking.openURL(url);
    }
  } catch (error) {
    console.log(error);
  }
};

export const arrayIcons = {
  pets: IMAGES.pets,
  homecare: IMAGES.homecare,
  housekeeping: IMAGES.housekeeping,
  childcare: IMAGES.childcare,
  diy: IMAGES.diy,
  transport: IMAGES.transportIcon,
  'personal care': IMAGES.personalCareIcon,
  'tech support': IMAGES.ic_tech_support,
  gardening: IMAGES.gardening,
};

export const isImageFile = (file: any) => {
  const type = file?.nativeType || file?.type || '';
  return type?.startsWith('image/');
};

export async function requestLocationPermission() {
  if (Platform.OS === 'ios') return true;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'App needs access to your location',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    return false;
  }
}

export const prepareMediaForUpload = async (asset: any) => {
  if (!asset?.type?.startsWith('video')) {
    // ✅ Image → no change
    return asset;
  }

  // 🎥 Video → move out of cache
  const destPath = `${RNFS.DocumentDirectoryPath}/video_${Date.now()}.mp4`;

  await RNFS.copyFile(asset.uri, destPath);

  return {
    ...asset,
    uri: 'file://' + destPath,
  };
};

export const sanitizeAddressInput = (text: string) => {
  if (!text) return '';

  let value = text;

  // Remove emojis
  value = value.replace(/([\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}])/gu, '');

  // Remove leading spaces
  value = value.replace(/^\s+/, '');

  // Replace multiple spaces with single
  value = value.replace(/\s{2,}/g, ' ');

  // Remove trailing spaces


  // Hard limit
  if (value.length > 250) {
      value = value.slice(0, 250);
  }

  return value;
};

export const sanitizeNameInput = (text: string) => {
  if (!text) return '';

  let value = text;

  // Remove emojis
  value = value.replace(/([\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}])/gu, '');

  // Allow only alphabets + space + dot + hyphen
  value = value.replace(/[^A-Za-z.\-\s]/g, '');

  // Remove leading spaces
  value = value.replace(/^\s+/, '');

  // Replace multiple spaces with single
  value = value.replace(/\s{2,}/g, ' ');

  // Remove trailing spaces


  // Hard limit
  if (value.length > 50) {
      value = value.slice(0, 50);
  }

  return value;
};

export const sanitizePublicProfileText = (text: string) => {
  if (!text) return '';

  let value = text;

  // Non-breaking spaces (often from paste) → normal space so spacing rules apply
  value = value.replace(/\u00A0/g, ' ');
  // Strip emoji / pictographs
  value = value.replace(/([\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}])/gu, '');
  // Only allow letters, digits, space, and a small set of punctuation
  // value = value.replace(/[^a-zA-Z0-9 ., '@_-]/g, '');
  // No leading spaces / line breaks before the first character
  value = value.replace(/^\s+/, '');
  // Collapse 2+ spaces (or other whitespace runs) to a single space between words
  value = value.replace(/\s{2,}/g, ' ');

  // Enforce API / UI max length (300)
  if (value.length > 300) {
    value = value.slice(0, 300);
  }

  return value;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const TABBAR_RATIO = getScaleSize(105) / getScaleSize(428);
export const TABBAR_HEIGHT = SCREEN_WIDTH * TABBAR_RATIO;


