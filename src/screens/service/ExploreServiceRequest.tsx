import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  FlexAlignType,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';

//API
import { API } from '../../api';

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
  ServiceRequest,
  TaskItem,
  Text,
} from '../../components';

//SCREENS
import { SCREENS } from '..';

export default function ExploreServiceRequest(props: any) {


  const PAGE_SIZE = 10;
  const STRING = useString();

  const { theme } = useContext<any>(ThemeContext);

  const { profile } = useContext(AuthContext)

  const [isLoading, setLoading] = useState(false);
  const [serviceList, setServiceList] = useState<any[]>([]);
  const [filterModal, setFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('Filters');
  const [filterPosition, setFilterPosition] = useState({ top: 0, right: 0 });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedFilterType, setSelectedFilterType] = useState<
    'none' | 'category' | 'location'
  >('none');

  useEffect(() => {
    getAllServices()
  }, [page])

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      getAllServices(1, true);
    }, 400);

    return () => clearTimeout(delay);
  }, [searchText, selectedCategory, selectedLocation]);

  useEffect(() => {
    if (page > 1) {
      getAllServices(page);
    }
  }, [page]);

  async function getAllServices(currentPage = 1, reset = false) {

    if (!hasMore && !reset) return;

    try {
      setLoading(true);

      const trimmedText = searchText.trim();

      let params: any = {
        page: String(currentPage),
        limit: String(PAGE_SIZE),
      };

      // Filter
      if (selectedFilterType === "category" && trimmedText) {
        params.category_name = trimmedText;
      }
      else if (selectedFilterType === "location" && trimmedText) {
        params.location = trimmedText;
      }
      else if (trimmedText) {
        params.search = trimmedText;
      }

      const queryParams = new URLSearchParams(params).toString();

      console.log('PRMS',queryParams)

      const url = `${API.API_ROUTES.getProfessionalAllServices}?${queryParams}`;

      console.log("API URL =>", url);

      const result: any = await API.Instance.get(url);

      if (result?.status) {

        const newData = result?.data?.data?.open_services ?? [];

        if (reset) {
          setServiceList(newData);
        } else {
          setServiceList(prev => [...prev, ...newData]);
        }

        setHasMore(newData.length === PAGE_SIZE);

      } else {
        SHOW_TOAST(result?.data?.message, 'error');
      }

    } catch (error: any) {
      if (error?.message === 'canceled') return;
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <View style={styles(theme).container}>
      <Header
        onBack={() => {
          props.navigation.goBack();
        }}
        screenName={STRING.explore_all_service}
      />
      <View style={styles(theme).searchView}>
        <View style={styles(theme).searchBox}>
          <TextInput
            style={styles(theme).searchInput}
            placeholderTextColor={theme._555555}
            placeholder={STRING.what_are_you_looking_for}
            numberOfLines={1}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text)
            }}
            onSubmitEditing={() => {
              setPage(1);
              setHasMore(true);
              getAllServices(1, true);
            }}
          />
          <Image
            style={styles(theme).searchImage}
            source={IMAGES.search_icon}
          />
        </View>
        <TouchableOpacity
          style={styles(theme).filterContainer}
          onLayout={(event) => {
            const { y, height } = event.nativeEvent.layout;
            setFilterPosition({
              top: y + height + getScaleSize(80),
              right: getScaleSize(22),
            });
          }}
          onPress={() => setFilterModal(true)}>
          <Text
            size={getScaleSize(14)}
            font={FONTS.Lato.Medium}
            color={theme._555555}>
            {selectedFilter}
          </Text>
          <Image
            style={styles(theme).arrowImage}
            source={IMAGES.arrow_left}
          />
        </TouchableOpacity>
        <Modal visible={filterModal} transparent animationType="fade">
          <TouchableOpacity
            style={styles(theme).modalOverlay}
            activeOpacity={1}
            onPress={() => setFilterModal(false)}
          >
            <View
              style={[
                styles(theme).dropdownModalBox,
                {
                  position: 'absolute',
                  top: filterPosition.top,
                  right: filterPosition.right,
                },
              ]}
            >
              {["Category", "Location"].map((type, index, arr) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles(theme).dropdownItem,
                    index === arr.length - 1 && { borderBottomWidth: 0 }
                  ]}
                  onPress={() => {
                    if (type === "Category") {
                      setSelectedFilter("Category");
                      setSelectedFilterType("category");
                    } else {
                      setSelectedFilter("Location");
                      setSelectedFilterType("location");
                    }
                    setFilterModal(false);
                  }}

                >
                  <Text
                    size={getScaleSize(14)}
                    font={FONTS.Lato.Regular}
                    color={theme._555555}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
      <FlatList
        data={serviceList}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any, index: number) => index.toString()}
        contentContainerStyle={{ marginHorizontal: getScaleSize(22), paddingBottom: getScaleSize(50) }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isLoading ? <ActivityIndicator size="large" color={theme.primary} style={{ margin: 20 }} /> : null
        }
        renderItem={({ item, index }) => {
          return (
            <ServiceRequest
              key={index}
              data={item}
              onPress={() => {
                props.navigation.navigate(SCREENS.ServicePreview.identifier, { serviceData: item });
              }}
              onPressAccept={() => {
                props.navigation.navigate(SCREENS.AddQuote.identifier, {
                  isItem: item,
                  isFromHome: false,
                });
              }}
            />
          )
        }}
      />
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.white },
    headerContainer: {
      flexDirection: 'row',
      marginHorizontal: getScaleSize(22),
      marginTop: StatusBar.currentHeight ? StatusBar.currentHeight + getScaleSize(10) : getScaleSize(20),
    },
    verticalView: {
      alignSelf: 'center',
      flexDirection: 'column',
      flex: 1.0,
    },
    notifiationIcon: {
      height: getScaleSize(24),
      width: getScaleSize(24),
      alignSelf: 'center',
    },
    profilePic: {
      height: getScaleSize(34),
      width: getScaleSize(34),
      borderRadius: getScaleSize(17),
      alignSelf: 'center',
    },
    scrolledContainer: {
      marginTop: getScaleSize(28),
      marginHorizontal: getScaleSize(22),
    },
    bannerView: {
      borderRadius: getScaleSize(25),
      height: getScaleSize(150),
      alignSelf: 'center',
      width: '100%',
    },
    horizontalContainer: {
      marginTop: getScaleSize(27),
      flexDirection: 'row',
    },
    directionView: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    searchView: {
      flexDirection: 'row',
      marginHorizontal: getScaleSize(22),
      marginTop: getScaleSize(16),
      marginBottom: getScaleSize(24)
    },
    searchBox: {
      flexDirection: 'row',
      flex: 1.0,
      alignItems: 'center',
      backgroundColor: theme.white,
      borderWidth: 1,
      borderColor: theme._BECFDA,
      borderRadius: getScaleSize(12),
      paddingHorizontal: getScaleSize(12),
      // paddingVertical: getScaleSize(4),
      height: getScaleSize(53),
    },
    searchImage: {
      height: getScaleSize(32),
      width: getScaleSize(32),
      alignSelf: 'center' as FlexAlignType,
    },

    searchInput: {
      fontFamily: FONTS.Lato.Regular,
      fontSize: getScaleSize(14),
      color: theme.black,
      // marginLeft: getScaleSize(12),
      flex: 1.0,
    },
    filterContainer: {
      backgroundColor: theme.white,
      borderRadius: getScaleSize(12),
      paddingHorizontal: getScaleSize(16),
      marginLeft: getScaleSize(16),
      justifyContent: 'center',
      borderWidth: 0.7,
      borderColor: theme._BECFDA,
      height: getScaleSize(53),
      flexDirection: 'row',
      alignItems: 'center',
    },
    arrowImage: {
      height: getScaleSize(24),
      width: getScaleSize(24),
      alignSelf: 'center',
      marginLeft: getScaleSize(4)
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "transparent",
    },
    dropdownModalBox: {
      width: getScaleSize(160),
      backgroundColor: "#fff",
      borderRadius: getScaleSize(12),
      paddingVertical: getScaleSize(6),
      elevation: 8,
    },
    dropdownItem: {
      paddingVertical: getScaleSize(13),
      paddingHorizontal: getScaleSize(16),
      borderBottomWidth: 1,
      borderBottomColor: theme._D5D5D5,
      backgroundColor: theme.white
    },
  });

