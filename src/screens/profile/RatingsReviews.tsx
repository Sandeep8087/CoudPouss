import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'

//ASSETS
import { FONTS } from '../../assets';

//API
import { API } from '../../api';

//COMPONENTS
import { Header, ProgressView, RatingsReviewsItem, Text } from '../../components';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANTS
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';

export default function RatingsReviews(props: any) {

    const { theme } = useContext<any>(ThemeContext);
    const STRING = useString();
    const { userType, profile } = useContext<any>(AuthContext);

    const PAGE_SIZE = 10;

    const [showMore, setShowMore] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [ratingsReviews, setRatingsReviews] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        getRatingReviews()
    }, [])

    async function getRatingReviews() {
        try {
            setLoading(true)
            const result: any = await API.Instance.get(API.API_ROUTES.fetchTransactions + `?section=ratings_reviews&page=${page}&limit=${PAGE_SIZE}`);
            if (result?.status) {
                const newData = result?.data?.data?.results ?? [];
                if (newData?.length < PAGE_SIZE) {
                    setHasMore(false);
                    setRatingsReviews((prev: any) => [...prev, ...newData]);
                }
                else {
                    setRatingsReviews((prev: any) => [...prev, ...newData]);
                }
            }
            else {
                SHOW_TOAST(result?.data?.message, 'error')
                console.log('ERR', result?.data?.message)
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
        } finally {
            setLoading(false);
        }
    }

    function loadMore() {
        if (hasMore) {
            setPage(page + 1);
            getRatingReviews();
        }
    }

    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
                screenName={STRING.ratings_reviews}
            />
            <View style={styles(theme).mainContainer}>
                <Text
                    style={{ marginVertical: getScaleSize(16) }}
                    size={getScaleSize(22)}
                    font={FONTS.Lato.SemiBold}
                    color={theme._2B2B2B}>
                    {STRING.recent_works_reviews}
                </Text>
                {ratingsReviews?.length > 0 ?
                    <FlatList
                        data={ratingsReviews}
                        contentContainerStyle={{ paddingBottom: getScaleSize(50) }}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item: any, index: number) => index.toString()}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.1}
                        ListFooterComponent={
                            isLoading ? <ActivityIndicator size="large" color={theme.primary} style={{ margin: 20 }} /> : null
                        }
                        renderItem={({ item, index }) => {
                            return (
                                <RatingsReviewsItem
                                    key={index}
                                    item={item}
                                    itemContainer={{ marginBottom: getScaleSize(24) }}
                                    onPressShowMore={() => {
                                        setShowMore(!showMore);
                                    }}
                                    showMore={showMore}
                                />
                            )
                        }}
                    />
                    :
                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1.0 }}>
                        <Text
                            style={{ marginTop: getScaleSize(24) }}
                            size={getScaleSize(16)}
                            font={FONTS.Lato.Medium}
                            color={theme._2B2B2B}
                        >
                            {STRING.no_data_found}
                        </Text>
                    </View>
                }
            </View>
            {isLoading && <ProgressView />}
        </View >
    )
}

const styles = (theme: ThemeContextType['theme']) => StyleSheet.create({
    container: {
        flex: 1.0,
        backgroundColor: theme.white,
    },
    mainContainer: {
        flex: 1.0,
        marginHorizontal: getScaleSize(24),
    },

})