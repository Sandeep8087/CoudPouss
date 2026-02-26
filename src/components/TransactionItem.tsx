import { Image, StyleSheet, View } from 'react-native'
import React, { useContext } from 'react'
import { ThemeContext, ThemeContextType } from '../context'
import { getScaleSize, useString } from '../constant'
import Text from './Text';
import { FONTS } from '../assets';
import moment from 'moment';

export default function TransactionItem(props: any) {
    const { theme } = useContext<any>(ThemeContext);
    const STRING = useString();
    const { item, itemContainer, key } = props;

    function getStatus(status: any) {
        if (status === 'SUCCESS') {
            return theme._00B500;
        } else if (status === 'FAILED') {
            return theme._D32F2F;
        } else if (status === 'PENDING') {
            return theme._FFBB4E;
        } else {
            return theme._FFBB4E;
        }
    }
    return (
        <View key={key} style={[styles(theme).transactionItem, itemContainer]}>
            {item?.user?.profile_photo_url ? (
                <Image source={{ uri: item?.user?.profile_photo_url }} style={styles(theme).transactionItemImage} resizeMode='cover' />
            ) : (
                <View style={[styles(theme).transactionItemImage, { backgroundColor: theme._D5D5D5 }]} />
            )}
            <View style={styles(theme).transactionItemDetails}>
                <Text size={getScaleSize(19)} font={FONTS.Lato.Medium} color={theme._2B2B2B}>
                    {item?.user?.name ?? ''}
                </Text>
                <Text size={getScaleSize(16)} font={FONTS.Lato.SemiBold} color={theme._818285}>
                    {item?.date ? moment.utc(item?.date).local().format('DD MMM YYYY, hh:mm A') : ''}
                </Text>
            </View>
            <View style={styles(theme).transactionStatusContainer}>
                <Text size={getScaleSize(16)} font={FONTS.Lato.SemiBold} color={theme._787878}>
                    {item?.amount ? `€${parseFloat(item?.amount).toFixed(2)}` : '€0'}
                </Text>
                <Text
                    size={getScaleSize(16)}
                    font={FONTS.Lato.SemiBold}
                    color={getStatus(item?.status)}>
                    {item?.status ?? ''}
                </Text>
            </View>
        </View>
    )
}

const styles = (theme: ThemeContextType['theme']) => StyleSheet.create({
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    transactionItemImage: {
        width: getScaleSize(48),
        height: getScaleSize(48),
        borderRadius: getScaleSize(24)
    },
    transactionItemDetails: {
        flex: 1.0,
        marginHorizontal: getScaleSize(12),
    },
    transactionStatusContainer: {
        alignItems: 'flex-end',
    }
})