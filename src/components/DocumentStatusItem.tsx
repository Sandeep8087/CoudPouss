import React, { useContext } from 'react';
import {
    View,
    StyleSheet,
    Image
} from 'react-native';
import { ThemeContext, ThemeContextType } from '../context';
import { getScaleSize, useString } from '../constant';
import { FONTS, IMAGES } from '../assets';
import Text from './Text';


const DocumentStatusItem = (props: any) => {
    const STRING = useString();
    const { theme } = useContext<any>(ThemeContext);

    const { item } = props;

    function getImage() {
        if (item?.serviceRunning) {
            return IMAGES.service_running;
        } else {
            if (props?.item?.isRejected) {
                return IMAGES.ic_rejected;
            } else {
                if (props?.item?.completed) {
                    return IMAGES.status_green;
                } else {
                    return IMAGES.empty_view;
                }
            }
        }
    }

    return (
        <View style={[styles(theme).statusItem, {}]}>
            {/* Timeline line */}
            <View style={styles(theme).timelineContainer}>
                <Image
                    style={{
                        height: getScaleSize(24),
                        width: getScaleSize(24),
                        resizeMode: 'cover',
                    }}
                    source={getImage()}
                />
                {!item?.completed && !item?.serviceRunning && !item?.isRejected && item?.id && (
                    <Text
                        style={{ position: 'absolute', top: getScaleSize(4) }}
                        size={getScaleSize(12)}
                        font={FONTS.Lato.Medium}
                        color={theme.white}
                    >
                        {item?.id ?? ''}
                    </Text>
                )}
                {!props?.isLast && (
                    <View
                        style={[
                            styles(theme).timelineLine,
                            {
                                backgroundColor: props?.item?.isRejected ? 'red' : props?.item?.completed ? '#2E7D32' : '#424242',
                            },
                        ]}
                    />
                )}
            </View>
            <View style={styles(theme).content}>
                <Text
                    size={getScaleSize(16)}
                    font={FONTS.Lato.SemiBold}
                    color={theme._2B2B2B}
                    style={{ marginBottom: getScaleSize(4) }}
                >
                    {item?.name ?? ''}
                </Text>
                <Text
                    size={getScaleSize(14)}
                    font={FONTS.Lato.Regular}
                    color={theme._737373}>
                    {item?.description ?? '-'}
                </Text>
            </View>
        </View>
    );
};

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff',
            padding: 16,
        },
        header: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 24,
            textAlign: 'center',
        },
        scrollView: {
            flex: 1,
        },
        timeline: {
            paddingLeft: 8,
        },
        statusItem: {
            flexDirection: 'row',
            marginBottom: 24,
        },
        timelineContainer: {
            alignItems: 'center',
            marginRight: 16,
            width: 24,
        },
        timelineDot: {
            width: 20,
            height: 20,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1,
        },
        completedDot: {
            backgroundColor: '#4CAF50',
            borderWidth: 3,
            borderColor: '#E8F5E8',
        },
        pendingDot: {
            backgroundColor: '#fff',
            borderWidth: 2,
            borderColor: '#E0E0E0',
        },
        innerDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#fff',
        },
        timelineLine: {
            width: 2,
            flex: 1,
            marginTop: 0,
            marginBottom: -24,
        },
        content: {
            flex: 1,
            paddingBottom: 8,
        },
        title: {
            fontSize: getScaleSize(16),
            fontFamily: FONTS.Lato.SemiBold,
            marginBottom: 4,
            color: '#2B2B2B',
        },
        completedTitle: {
            fontFamily: FONTS.Lato.SemiBold,
            marginBottom: 4,
            color: '#2B2B2B',
            fontSize: 16,
            marginTop: -5,
        },
        pendingTitle: {
            fontFamily: FONTS.Lato.SemiBold,
            marginBottom: 4,
            color: '#2B2B2B',
            fontSize: 16,
            marginTop: -5,
        },
        date: {
            fontSize: 12,
            color: '#737373',
            fontFamily: FONTS.Lato.Regular,
        },
        informationView: {
            marginTop: getScaleSize(12),
            borderWidth: 1,
            borderColor: '#D5D5D5',
            borderRadius: getScaleSize(16),
            paddingHorizontal: getScaleSize(12),
            paddingVertical: getScaleSize(12),
        },
    });

export default DocumentStatusItem;
