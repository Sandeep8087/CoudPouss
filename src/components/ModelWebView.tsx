import { Modal, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import WebView from 'react-native-webview'
import { ThemeContext } from '../context';
import Header from './header';


interface ModelWebViewProps {
    visible: boolean;
    onRequestClose: () => void;
    item: any;
}

export default function ModelWebView(props: ModelWebViewProps) {

    const { theme } = useContext<any>(ThemeContext);
    const { visible, onRequestClose, item } = props;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onRequestClose}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <WebView
                    source={{ uri: item?.checkout_url ?? '' }}
                    startInLoadingState
                />
            </SafeAreaView>
        </Modal>
    )
}

const styles = StyleSheet.create({})