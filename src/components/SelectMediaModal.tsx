import { Dimensions, Image, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import { getScaleSize } from '../constant/scaleSize';
import { ThemeContext } from '../context/ThemeProvider';
import { FONTS, IMAGES } from '../assets';
import Text from './Text';

interface SelectMediaModalProps {
    visible: boolean;
    onClose: () => void;
    onPressCamera: () => void;
    onPressGallery: () => void;
}

export default function SelectMediaModal(props: SelectMediaModalProps) {
    const { visible, onClose, onPressCamera, onPressGallery } = props;

    const theme = useContext<any>(ThemeContext);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.overlay}
                onPress={onClose}
            >
                <Pressable style={styles.container}>
                    <Text size={getScaleSize(16)} font={FONTS.Lato.Bold} color={theme.black}>
                        {'Select Media'}
                    </Text>
                    <View style={styles.mediaContainer}>
                        <TouchableOpacity
                        onPress={() => {
                            onPressCamera();
                        }}
                        style={styles.mediaItem}>
                            <Image source={IMAGES.ic_camare} style={styles.mediaItemImage} />
                            <Text
                                size={getScaleSize(16)}
                                font={FONTS.Lato.Bold}
                                align='center'
                                color={theme.black}>
                                {'Camera'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                        onPress={() => {
                            onPressGallery();
                        }}
                        style={styles.mediaItem}>
                            <Image source={IMAGES.ic_gallery} style={styles.mediaItemImage} />
                            <Text
                                size={getScaleSize(16)}
                                font={FONTS.Lato.Bold}
                                align='center'
                                color={theme.black}>
                                {'Gallery'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>

    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: Dimensions.get('window').width - getScaleSize(48),
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: getScaleSize(24),
        paddingVertical: getScaleSize(16),
    },
    mediaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: getScaleSize(24),
    },
    mediaItem: {
        flex: 1,
        alignItems: 'center',
    },
    mediaItemImage: {
        width: getScaleSize(40),
        height: getScaleSize(40),
        marginBottom: getScaleSize(8),
    },
})