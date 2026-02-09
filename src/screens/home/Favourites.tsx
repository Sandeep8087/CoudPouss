import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'

//COMPONENTS
import { FavouritesItem, Header } from '../../components';

//CONSTANTS & ASSETS
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';
import { API } from '../../api';
import { SCREENS } from '..';


const PAGE_SIZE = 10;
export default function Favourites(props: any) {

    const STRING = useString();
    const { theme } = useContext<any>(ThemeContext);

    const [favoriteProfessionalsData, setFavoriteProfessionalsData] = useState({
        allRequests: [],
        page: 1,
        hasMore: true,
        isLoading: true,
    });

    useEffect(() => {
        getFavoriteProfessionals();
    }, [favoriteProfessionalsData?.page]);

    async function getFavoriteProfessionals() {
        try {
            setFavoriteProfessionalsData((prev: any) => ({
                ...prev,
                isLoading: true,
            }));
            const result = await API.Instance.get(API.API_ROUTES.getFavoriteProfessionals + `?page=${favoriteProfessionalsData?.page}&limit=${PAGE_SIZE}`);
            if (result.status) {
                const newData = result?.data?.data?.results
                if (newData.length < PAGE_SIZE) {
                    setFavoriteProfessionalsData((prev: any) => ({
                        ...prev,
                        hasMore: false,
                        allRequests: [...(prev?.allRequests ?? []), ...newData],
                        isLoading: false,
                    }));
                }
                else {
                    setFavoriteProfessionalsData((prev: any) => ({
                        ...prev,
                        allRequests: [...(prev?.allRequests ?? []), ...newData],
                        isLoading: false,
                    }));
                }
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error')
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
            console.log(error?.message)
        } finally {
            setFavoriteProfessionalsData((prev: any) => ({
                ...prev,
                isLoading: false,
            }));
        }
    }

    const loadMore = () => {
        if (!favoriteProfessionalsData?.isLoading && favoriteProfessionalsData?.hasMore) {
            setFavoriteProfessionalsData((prev: any) => ({
                ...prev,
                page: favoriteProfessionalsData?.page + 1,
                hasMore: true,
                isLoading: true,
            }));
        }
    };

    async function removeFavoriteProfessional(id: any) {
        try {
            setFavoriteProfessionalsData((prev: any) => ({
                ...prev,
                isLoading: true,
            }));
            const result = await API.Instance.delete(API.API_ROUTES.removeFavoriteProfessional + `/${id}`);
            if (result.status) {
                SHOW_TOAST(result?.data?.message ?? '', 'success')
                setFavoriteProfessionalsData(prev => ({
                    ...prev,
                    allRequests: prev.allRequests.filter(
                        (item: any) => item?.provider?.id !== id
                    ),
                }));

            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error')
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
        } finally {
            setFavoriteProfessionalsData((prev: any) => ({
                ...prev,
                isLoading: false,
            }));
        }
    }


    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
                screenName={STRING.FavoriteProfessionals}
            />
            <FlatList
                data={favoriteProfessionalsData?.allRequests}
                keyExtractor={(item: any, index: number) => index.toString()}
                numColumns={2}
                contentContainerStyle={{ marginTop: getScaleSize(24), marginHorizontal: getScaleSize(24) }}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                showsVerticalScrollIndicator={false}
                onEndReached={loadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={
                    favoriteProfessionalsData?.isLoading ? <ActivityIndicator size="large" color={theme.primary} style={{ margin: 20 }} /> : null
                }
                renderItem={({ item, index }) => {
                    return (
                        <FavouritesItem
                            item={item}
                            itemContainer={styles(theme).itemContainer}
                            onPressFavorite={(item: any) => {
                                removeFavoriteProfessional(item?.provider?.id)
                            }}
                            onPressItem={(item: any) => {
                                props.navigation.navigate(SCREENS.OtherUserProfile.identifier, {
                                    item: item?.provider ?? ''
                                })
                            }}
                        />
                    );
                }}
            />
        </View>
    )
}

const styles = (theme: ThemeContextType['theme']) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.white,
    },
    itemContainer: {
        marginBottom: getScaleSize(14),
    }
})