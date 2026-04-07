import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';

// ASSETS
import { FONTS } from '../../assets';

// API
import { API } from '../../api';

// COMPONENTS
import { Header, ProgressView, RatingsReviewsItem, Text } from '../../components';

// CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

// CONSTANTS
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';

export default function RatingsReviews(props: any) {

    const { theme } = useContext<any>(ThemeContext);
    const STRING = useString();
    const { userType, profile } = useContext<any>(AuthContext);

    const PAGE_SIZE = 10;

    const [showMore, setShowMore] = useState(false);

    const [ratingsReviews, setRatingsReviews] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [isLoading, setLoading] = useState(false);       // initial loading
    const [isLoadingMore, setLoadingMore] = useState(false); // pagination loading

    // 🔥 API CALL
    useEffect(() => {
        getRatingReviews();
    }, [page]);

    async function getRatingReviews() {
        try {
            page === 1 ? setLoading(true) : setLoadingMore(true);

            const result: any = await API.Instance.get(
                API.API_ROUTES.fetchTransactions +
                `?section=ratings_reviews&page=${page}&limit=${PAGE_SIZE}`
            );

            if (result?.status) {
                const newData = result?.data?.data?.results ?? [];

                setRatingsReviews((prev: any) =>
                    page === 1 ? newData : [...prev, ...newData]
                );

                if (newData.length < PAGE_SIZE) {
                    setHasMore(false);
                }
            } else {
                SHOW_TOAST(result?.data?.message, 'error');
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
        } finally {
            page === 1 ? setLoading(false) : setLoadingMore(false);
        }
    }

    // 🔥 LOAD MORE
    function loadMore() {
        if (hasMore && !isLoading && !isLoadingMore) {
            setPage(prev => prev + 1);
        }
    }

    async function onLikeReviewRating(item: any, action: string) {
        if (isLoading || isLoadingMore) return;

        try {
            const params = {
                review_id: item?.review_id,
                action: action,
            };

            const result: any = await API.Instance.put(
                API.API_ROUTES.onLikeReviewRating,
                params
            );

            if (result?.status) {
                // ✅ DON'T CLEAR DATA
                setPage(1);         // trigger refresh
                setHasMore(true);

                // ✅ FORCE CALL (important if page already 1)
                getRatingReviews();

            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error');
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
        }
    }

    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => props.navigation.goBack()}
                screenName={STRING.ratings_reviews}
            />

            <View style={styles(theme).mainContainer}>

                <Text
                    style={{ marginVertical: getScaleSize(16) }}
                    size={getScaleSize(22)}
                    font={FONTS.Lato.SemiBold}
                    color={theme._2B2B2B}
                >
                    {STRING.recent_works_reviews}
                </Text>

                {ratingsReviews.length > 0 ? (
                    <FlatList
                        data={ratingsReviews}
                        contentContainerStyle={{ paddingBottom: getScaleSize(50) }}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item: any, index: number) => index.toString()}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.3}
                        ListFooterComponent={
                            isLoadingMore ? (
                                <ActivityIndicator
                                    size="large"
                                    color={theme.primary}
                                    style={{ margin: 20 }}
                                />
                            ) : null
                        }
                        renderItem={({ item, index }) => (
                            <RatingsReviewsItem
                                key={index}
                                item={item}
                                itemContainer={{ marginBottom: getScaleSize(24) }}
                                onPressShowMore={() => setShowMore(!showMore)}
                                showMore={showMore}
                                onPressLike={onLikeReviewRating}
                            />
                        )}
                    />
                ) : (
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <Text
                            size={getScaleSize(16)}
                            font={FONTS.Lato.Medium}
                            color={theme._2B2B2B}
                        >
                            {isLoading ? '' : STRING.no_data_found}
                        </Text>
                    </View>
                )}

            </View>
            {isLoading && <ProgressView />}
        </View>
    );
}

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.white,
        },
        mainContainer: {
            flex: 1,
            marginHorizontal: getScaleSize(24),
        },
    });