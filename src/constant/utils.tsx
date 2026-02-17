import {IMAGES} from '../assets';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import {Dimensions, Linking} from 'react-native';
import {PermissionsAndroid, Platform} from 'react-native';
import { getScaleSize } from './scaleSize';

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
      await InAppBrowser.open(url, {
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
  'tech support': IMAGES.it,
  gardening: IMAGES.gardening,
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

const SCREEN_WIDTH = Dimensions.get('window').width;
const TABBAR_RATIO = getScaleSize(103) / getScaleSize(403);
export const TABBAR_HEIGHT = SCREEN_WIDTH * TABBAR_RATIO;
