import React, { useContext, useState } from 'react';
import { Image, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemeContext, ThemeContextType } from '../context/ThemeProvider';
import { Header, Text } from '../components';
import { getScaleSize, useString } from '../constant';
import { FONTS, IMAGES } from '../assets';

const WebViewScreen = (props: any) => {

    const STRING = useString();
    const { theme } = useContext<any>(ThemeContext);
    const url = props.route.params?.url ?? '';
    const item = props.route.params?.item ?? '';

    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <View style={styles(theme).center}>
                <Text
                    size={getScaleSize(16)}
                    font={FONTS.Lato.Medium}
                    color={theme._818285}>
                    Unable to load document.
                </Text>

                <TouchableOpacity
                    onPress={() => setHasError(false)}
                    style={styles(theme).retryBtn}
                >
                    <Text
                        size={getScaleSize(16)}
                        font={FONTS.Lato.Medium}
                        color={theme._818285}>
                        {'Retry'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => props.navigation.goBack()}
                    style={styles(theme).backText}
                >
                    <Text
                        size={getScaleSize(16)}
                        font={FONTS.Lato.Medium}
                        color={theme._818285}>
                        {'GoBack'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.18)', }}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={theme.white}
                translucent={false}
            />
            <TouchableOpacity
                style={styles(theme).backContainer} onPress={() => props.navigation.goBack()}>
                <Image source={IMAGES.ic_back} style={styles(theme).backIcon} />
            </TouchableOpacity>
            <WebView
                source={{ uri: item ? item?.checkout_url ?? '' : url }}
                javaScriptEnabled
                startInLoadingState
                domStorageEnabled
                allowsBackForwardNavigationGestures
                onShouldStartLoadWithRequest={(request) => {
                    // Allow only Stripe URLs
                    return request.url.startsWith('https://checkout.stripe.com');
                }}
                onError={(e) => {
                    console.log('WebView error:', e.nativeEvent);
                    setHasError(true);
                }}

                onHttpError={(e) => {
                    console.log('HTTP error:', e.nativeEvent.statusCode);
                    setHasError(true);
                }}
            />
        </View>
    );
};

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        backIcon: {
            width: getScaleSize(40),
            height: getScaleSize(40),
        },
        backContainer: {
            position: 'absolute',
            top: getScaleSize(16),
            left: getScaleSize(16),
            zIndex: 1000,
            padding: getScaleSize(16),
            borderRadius: getScaleSize(16),
            backgroundColor: 'rgba(0, 0, 0, 0.37)',

        },
        backText: {

        },
        retryBtn: {

        },
    });

export default WebViewScreen;


