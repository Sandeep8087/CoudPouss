import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
    View,
    StatusBar,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Platform,
} from 'react-native';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';

//COMPONENT
import {
    Header,
    ProgressView,
    RequestItem,
    SearchComponent,
    Text,
} from '../../components';

//PACKAGES
import { useFocusEffect } from '@react-navigation/native';
import { SCREENS } from '..';
import { API } from '../../api';
import { debounce } from 'lodash';

export default function Search(props: any) {
    const STRING = useString();
    const { theme } = useContext<any>(ThemeContext);

    const [searchText, setSearchText] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [searchData, setSearchData] = useState<any>([]);
    const [searchDebouncedText, setSearchDebouncedText] = useState('')

    console.log('searchData=', searchData);

    const abortControllerRef = useRef<AbortController | undefined>(undefined);

    useEffect(() => {
        if (searchDebouncedText) {
            getSearchData();
        } else {
            setSearchData([]);
        }
    }, [searchDebouncedText]);

    const debouncedSearch = useCallback(debounce((text: string) => {
        setSearchDebouncedText(text);
    }, 500), []);

    async function getSearchData() {
        try {
            setLoading(true);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            const abortController = new AbortController();
            abortControllerRef.current = abortController;
            const result = await API.Instance.get(API.API_ROUTES.getHomeData + `?search=${searchText}`);
            console.log('result', result.status, result)
            if (result.status) {
                console.log('searchData==', result?.data?.data)
                setSearchData(result?.data?.data);
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error')
                console.log('error==>', result?.data?.message)
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
            console.log(error?.message)
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
            />
            <View style={styles(theme).notificationContainer}>
                <View style={{ marginHorizontal: getScaleSize(24) }}>
                    <SearchComponent
                        value={searchText}
                        onChangeText={(text: any) => {
                            setSearchText(text);
                            debouncedSearch(text);
                        }} />
                </View>
                <FlatList
                    data={searchData?.services ?? []}
                    contentContainerStyle={{
                        paddingBottom: getScaleSize(50),
                        flexGrow: 1,
                    }}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item: any, index: number) => index.toString()}
                    renderItem={({ item, index }) => (
                        <RequestItem
                            selectedFilter={typeof searchText === 'string' ? { id: '1', title: 'All', filter: 'all' } : null}
                            key={index}
                            onPress={() => {
                                if (item?.status === 'open') {
                                    props.navigation.navigate(SCREENS.OpenRequestDetails.identifier, {
                                        item: item
                                    })
                                } else if (item?.status === 'pending') {
                                    props.navigation.navigate(SCREENS.RequestDetails.identifier, {
                                        item: item
                                    })
                                } else if (item?.status === 'completed') {
                                    props.navigation.navigate(SCREENS.CompletedTaskDetails.identifier, {
                                        item: item
                                    })
                                } else if (item?.status === 'accepted') {
                                    props.navigation.navigate(SCREENS.CompletedTaskDetails.identifier, {
                                        item: item
                                    })
                                }
                            }}
                            item={item} />
                    )}
                    ListEmptyComponent={() =>
                        !isLoading && searchDebouncedText ? (
                            <View style={styles(theme).emptyContainer}>
                                <Text
                                    size={getScaleSize(16)}
                                    font={FONTS.Lato.Regular}
                                    color={theme._565656}
                                >
                                   {STRING.no_results_found}
                                </Text>
                            </View>
                        ) : null
                    }
                />
            </View>
            {isLoading && <ProgressView />}
        </View>
    );
}

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.white },
        notificationContainer: {
            marginTop: getScaleSize(16),
            flex: 1.0,
        },
        profilePic: {
            height: getScaleSize(42),
            width: getScaleSize(42),
            borderRadius: getScaleSize(21),
        },
        buttonContainer: {
            flexDirection: 'row',
            marginHorizontal: getScaleSize(55),
            marginBottom: getScaleSize(17),
            marginTop: getScaleSize(16),
        },
        backButtonContainer: {
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#ACADAD',
            borderRadius: getScaleSize(12),
            paddingVertical: getScaleSize(8),
            backgroundColor: theme.white,
            marginLeft: getScaleSize(8),
            paddingHorizontal: getScaleSize(10),
        },
        nextButtonContainer: {
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.primary,
            borderRadius: getScaleSize(12),
            paddingVertical: getScaleSize(8),
            backgroundColor: theme.primary,
            marginRight: getScaleSize(8),
            paddingHorizontal: getScaleSize(10),
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
