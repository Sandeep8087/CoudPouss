import { Image, StyleSheet, View } from 'react-native'
import React, { useContext } from 'react'
import { ThemeContext, ThemeContextType } from '../context';
import { getScaleSize, useString } from '../constant';
import { FONTS, IMAGES } from '../assets';
import Text from './Text';
import { Rating } from 'react-native-ratings';
import moment from 'moment';

export default function RatingsReviewsItem(props: any) {

    const { onPressShowMore, showMore, itemContainer, item, isFromProfessionalProfile } = props;

    const { theme } = useContext<any>(ThemeContext);

    const STRING = useString();

    const formatDaysAgo = (days: any) => {
        if (days == null) return '';

        if (days < 30) {
            return days === 0
                ? 'Today'
                : days === 1
                    ? '1 day ago'
                    : `${days} days ago`;
        }

        const months = Math.floor(days / 30);

        return months === 1
            ? '1 month ago'
            : `${months} months ago`;
    };

    return (
        <View style={[styles(theme).itemContainer, itemContainer]}>
            <View style={styles(theme).flexView}>
                {item?.profile_photo_url ?
                    <Image source={{ uri: item?.profile_photo_url }} style={styles(theme).profileIcon} />
                    :
                    <View style={styles(theme).profileIcon} />
                }
                <View style={{ flex: 1.0 }}>
                    <Text
                        size={getScaleSize(16)}
                        font={FONTS.Lato.SemiBold}
                        color={theme._2B2B2B}>
                        {isFromProfessionalProfile ? item?.name : item?.full_name ?? ''}
                    </Text>
                    <Text
                        size={getScaleSize(14)}
                        font={FONTS.Lato.Medium}
                        color={theme._6D6D6D}
                    >
                        {formatDaysAgo(item?.days_ago)}
                    </Text>

                </View>
                <View style={styles(theme).flexView}>
                    <Rating
                        type="custom"
                        ratingBackgroundColor="#EDEFF0"
                        tintColor="#fff" // background color, useful for layout
                        ratingCount={5}
                        ratingColor={'#F0B52C'} // grey color
                        startingValue={item?.rating ?? 0}
                        imageSize={18}
                        readonly
                    />
                </View>
            </View>
            <Text
                style={{ marginTop: getScaleSize(16) }}
                size={getScaleSize(14)}
                font={FONTS.Lato.Medium}
                color={theme._131313}
                numberOfLines={showMore ? undefined : 3}>
                {item?.review ?? ''}
            </Text>
            {item?.review?.length > 100 &&
                <Text size={getScaleSize(11)}
                    font={FONTS.Lato.Regular}
                    color={theme._436A00}
                    style={{ marginTop: getScaleSize(4) }}
                    onPress={onPressShowMore}>
                    {showMore ? STRING.show_less : STRING.read_more}
                </Text>
            }
            <View style={styles(theme).likeView}>
                <View style={styles(theme).flexView}>
                    <View style={styles(theme).flexView}>
                        <Image source={IMAGES.ic_thumbsDown} style={styles(theme).starIcon} />
                        <Text
                            style={{ marginLeft: getScaleSize(2) }}
                            size={getScaleSize(12)}
                            font={FONTS.Lato.Regular}
                            color={theme._707D85}>
                            {'###'}
                        </Text>
                    </View>
                    <View style={{ width: getScaleSize(8) }} />
                    <View style={styles(theme).flexView}>
                        <Image source={IMAGES.ic_thumbsUp} style={styles(theme).starIcon} />
                        <Text
                            size={getScaleSize(12)}
                            font={FONTS.Lato.Regular}
                            style={{ marginLeft: getScaleSize(2) }}
                            color={theme._707D85}>
                            {'###'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = (theme: ThemeContextType['theme']) => StyleSheet.create({
    itemContainer: {
        borderWidth: 1,
        borderColor: theme._D5D5D5,
        borderRadius: getScaleSize(8),
        padding: getScaleSize(18),
    },
    flexView: {
        flexDirection: 'row',
    },
    profileIcon: {
        width: getScaleSize(40),
        height: getScaleSize(40),
        borderRadius: getScaleSize(40),
        backgroundColor: theme._D5D5D5,
        marginRight: getScaleSize(8),
    },
    starIcon: {
        width: getScaleSize(16),
        height: getScaleSize(16),
    },
    likeView: {
        alignItems: 'flex-end',
        marginTop: getScaleSize(8),
    }
})