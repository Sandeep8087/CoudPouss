import { Image, StyleSheet, View } from 'react-native'
import React, { useContext } from 'react'
import { ThemeContext, ThemeContextType } from '../context';
import { FONTS, IMAGES } from '../assets';
import { SCREENS } from '../screens';
import { getScaleSize, useString } from '../constant';
import Text from './Text';
import Button from './Button';

export default function EmptyView(props: any) {
    const { theme } = useContext<any>(ThemeContext);
    const STRING = useString();
    const { onPressButton, title, style } = props;
    return (
        <View style={[styles(theme).emptyView, style]}>
            <Image source={IMAGES.empty} style={styles(theme).emptyImage} />
            <Text
                size={getScaleSize(16)}
                font={FONTS.Lato.SemiBold}
                align="center"
                color={theme._939393}
                style={{
                    marginTop: getScaleSize(42),
                    textAlign: 'center',
                    alignSelf: 'center',
                }}>
                {title}
            </Text>
            <Button
                style={styles(theme).btnRequestService}
                title={STRING.subscribe}
                onPress={onPressButton}
            />
        </View>
    )
}

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        emptyView: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyImage: {
            height: getScaleSize(217),
            width: getScaleSize(184),
        },
        btnRequestService: {
            marginTop: getScaleSize(40),
            width: '100%',
        },
    })