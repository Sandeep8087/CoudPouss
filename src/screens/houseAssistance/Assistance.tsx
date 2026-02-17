import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  Pressable,

} from 'react-native';

//ASSETS
import { FONTS } from '../../assets';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';

//COMPONENT
import {
  Header,
  ProgressView,
  SearchComponent,
  Text,
} from '../../components';

//API
import { API } from '../../api';
import { SCREENS } from '..';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const cellSize = (width - 30) / 7;

export default function Assistance(props: any) {

  const service = props.route.params?.service;
  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [bannerData, setBannerData] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

  const scrollY = useSharedValue(0);
  const maxScrollOffset = getScaleSize(220);

  useEffect(() => {
    getCategoryData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      getSubCategoryData(selectedCategory?.id);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredSubCategories(subCategoryList);
      return;
    }

    const search = searchText.toLowerCase();

    const filtered = subCategoryList.filter((item: any) => {
      const title = (item?.subcategory_name || "").toLowerCase();
      return title.includes(search);
    });
    setFilteredSubCategories(filtered);
  }, [searchText, subCategoryList]);

  async function getCategoryData() {
    try {
      setLoading(true);
      const result = await API.Instance.get(API.API_ROUTES.getHomeData + `?service_name=${service?.name}`);
      setLoading(false)
      if (result.status) {
        setCategoryList(result?.data?.data?.categories ?? []);
        if (result?.data?.data?.categories?.[0]?.id) {
          setSelectedCategory(result?.data?.data?.categories?.[0]);
          getSubCategoryData(result?.data?.data?.categories?.[0]?.id);
        }
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error')
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function getSubCategoryData(id: string) {
    try {
      setLoading(true);
      const result = await API.Instance.get(API.API_ROUTES.getHomeData + `/${id}`);
      setLoading(false)
      if (result.status) {
        console.log('subcategoryList==', JSON.stringify(result?.data?.data))
        setBannerData(result?.data?.data?.Banner ?? null);
        setSubCategoryList(result?.data?.data?.subcategories ?? []);
        setFilteredSubCategories(result?.data?.data?.subcategories ?? []);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error')
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  // const patterns = searchText ? ['small'] : ['small', 'large', 'large', 'small'];
  const patterns = ['small', 'large', 'large', 'small'];

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, maxScrollOffset],
      [0, -maxScrollOffset],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles(theme).container}>
      <Header
        onBack={() => {
          props.navigation.goBack();
        }}
        screenName={selectedCategory ? selectedCategory?.category_name : service?.name}
      />
      <View
        style={{
          marginTop: getScaleSize(16),
          marginHorizontal: getScaleSize(24),
        }}>
        <SearchComponent
          value={searchText}
          onChangeText={(text: any) => {
            console.log("SEARCH TEXT:", text);
            setSearchText(text);
          }} />
      </View>
      <View style={styles(theme).deviderView}></View>
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, backgroundColor: '#fff' }, animatedHeaderStyle]}>
          <>
            {bannerData ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  props.navigation.navigate(SCREENS.CreateRequest.identifier)
                }}>
                <Image
                  style={styles(theme).bannerContainer}
                  resizeMode='cover'
                  source={{ uri: bannerData?.url }}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles(theme).bannerContainer} />
            )}
            {categoryList.length > 1 && (
              <View style={{ paddingBottom: getScaleSize(20), paddingTop: getScaleSize(20), backgroundColor: '#fff' }}>
                <FlatList
                  data={categoryList}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item: any, index: number) => index.toString()}
                  ListHeaderComponent={() => {
                    return <View style={{ width: getScaleSize(22) }} />;
                  }}
                  ListFooterComponent={() => {
                    return <View style={{ width: getScaleSize(16) }} />;
                  }}
                  renderItem={({ item, index }) => {
                    return (
                      <TouchableOpacity
                        style={[
                          styles(theme).itemContainer,
                          {
                            marginLeft: index === 0 ? 0 : 8,
                            backgroundColor:
                              selectedCategory?.id === item?.id
                                ? theme.primary
                                : theme.white,
                          },
                        ]}
                        activeOpacity={1}
                        onPress={() => {
                          setSearchText('');
                          setSelectedCategory(item);
                        }}>
                        <Image
                          resizeMode='cover'
                          style={styles(theme).categoryImage}
                          source={{ uri: item?.category_logo }}
                        />
                        <Text
                          style={{
                            marginLeft: getScaleSize(14),
                            alignSelf: 'center',
                          }}
                          size={getScaleSize(16)}
                          font={FONTS.Lato.Regular}
                          color={
                            selectedCategory?.id === item?.id
                              ? theme.white
                              : theme._999999
                          }>
                          {item?.category_name}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}
          </>
        </Animated.View>
        {subCategoryList &&subCategoryList.length > 0 && filteredSubCategories.length > 0 && loading === false ?
          <Animated.FlatList
            data={filteredSubCategories}
            numColumns={2}
            contentContainerStyle={{}}
            keyExtractor={(item: any, index: number) => index.toString()}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ paddingLeft: getScaleSize(8) }}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            ListHeaderComponent={() => {
              return <View style={{ height: categoryList.length > 1 ? getScaleSize(300) : getScaleSize(210) }} />;
            }}
            ListFooterComponent={() => {
              return <View style={{ height: getScaleSize(50) }} />;
            }}
            renderItem={({ item, index }) => {
              const type = patterns[index % 4];
              return (
                <Pressable
                  onPress={() => {
                    props.navigation.navigate(SCREENS.CreateRequest.identifier, {
                      category: selectedCategory ? selectedCategory : service,
                      subCategory: item
                    })
                  }}
                  style={[
                    styles(theme).cardContainer,
                    {
                      height: type === 'small' ? getScaleSize(188) : getScaleSize(233),
                      marginTop: type === 'large' && index % 2 == 0 ? getScaleSize(-25) : getScaleSize(20),
                    }
                  ]}>
                  {item?.image === null ?
                    <View style={[styles(theme).imageView, {
                      backgroundColor: 'gray'
                    }]}></View> :
                    <Image
                      style={styles(theme).imageView}
                      resizeMode='cover'
                      source={{ uri: item?.image }}
                    />
                  }
                  <Text
                    style={{
                      marginVertical: getScaleSize(14),
                      marginHorizontal: getScaleSize(14),
                    }}
                    size={getScaleSize(16)}
                    font={FONTS.Lato.Bold}
                    color={theme.primary}>
                    {item?.subcategory_name}
                  </Text>
                </Pressable>
              )
            }}
          />
          :
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.Bold}
              color={theme.primary}>
              {'No data found'}
            </Text>
          </View>
        }
      </View>
      {loading && <ProgressView />}
    </View >
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.white },
    deviderView: {
      marginTop: getScaleSize(30),
      height: getScaleSize(6),
      backgroundColor: '#F8F8F8',
    },
    bannerContainer: {
      height: getScaleSize(182),
      borderRadius: getScaleSize(20),
      marginVertical: getScaleSize(20),
      marginHorizontal: getScaleSize(24),
      backgroundColor: theme._EAF0F3,
    },
    itemContainer: {
      height: getScaleSize(44),
      paddingHorizontal: getScaleSize(20),
      borderRadius: getScaleSize(32),
      borderWidth: 1,
      borderColor: '#F1F1F1',
      flexDirection: 'row',
    },
    categoryImage: {
      height: getScaleSize(24),
      width: getScaleSize(24),
      alignSelf: 'center',
    },
    cardContainer: {
      borderRadius: getScaleSize(20),
      backgroundColor: theme._EAF0F3,
      width: (Dimensions.get('window').width - getScaleSize(64)) / 2,
      marginLeft: getScaleSize(16),
    },
    imageView: {
      flex: 1.0,
      borderRadius: getScaleSize(20),
    }
  });
