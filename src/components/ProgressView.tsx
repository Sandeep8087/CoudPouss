import React from 'react';
import { View, StyleSheet, ActivityIndicator, Modal, Dimensions } from 'react-native';

import { LIGHT_THEME_COLOR } from '../assets';

//CONSTANT
import { getScaleSize } from '../constant';

const ProgressView = () => {
    return (
        <Modal 
        transparent={true} 
        visible={true}
        animationType='fade'
        statusBarTranslucent={true}>
            <View style={styles.mainView}>
                <View style={styles.indicatorView}>
                    <ActivityIndicator color={LIGHT_THEME_COLOR.black}></ActivityIndicator>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    mainView: {
        flex: 1.0,
        height: Dimensions.get('screen').height,
        width: Dimensions.get('window').width,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0
    },
    indicatorView: {
        height: getScaleSize(70),
        width: getScaleSize(70),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: LIGHT_THEME_COLOR.white,
        shadowColor: '#000',
        shadowRadius: 5,
        shadowOffset: {
            height: 5,
            width: 0,
        },
        shadowOpacity: 0.2,
    },
});

export default ProgressView;
