import { IMAGES } from "../assets";
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { Linking } from "react-native";
import { PermissionsAndroid, Platform } from 'react-native';

export const formatDecimalInput = (text: string, decimalLimit: number = 2): string => {
  // Allow digits and dot only
  let cleaned = text.replace(/[^0-9.]/g, '');

  // Prevent dot as first character
  if (cleaned.startsWith('.')) {
    cleaned = cleaned.substring(1);
  }

  // Allow only one dot
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts[1];
  }

  // Limit decimal places
  if (parts[1]?.length > decimalLimit) {
    cleaned = parts[0] + '.' + parts[1].slice(0, decimalLimit);
  }

  return cleaned;
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
  "pets": IMAGES.pets,
  "homecare": IMAGES.homecare,
  "housekeeping": IMAGES.housekeeping,
  "childcare": IMAGES.childcare,
  "diy": IMAGES.diy,
  "transport": IMAGES.transportIcon,
  "personal care": IMAGES.personalCareIcon,
  "tech support": IMAGES.it,
  "gardening": IMAGES.gardening,
}

export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs access to your location',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};
