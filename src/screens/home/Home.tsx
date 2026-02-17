import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, SHOW_TOAST, TABBAR_HEIGHT, useString } from '../../constant';
import {
  Text,
  HomeHeader,
  SearchComponent,
  RequestItem,
  FavouritesItem,
  ProgressView,
} from '../../components';
import { CommonActions, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { SCREENS, TABS } from '..';
import { API } from '../../api';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Home(props: any) {
  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  const [isLoading, setLoading] = useState(false);
  const [allServices, setAllServices] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [favoriteProfessionals, setFavoriteProfessionals] = useState([]);
  const [professionalConnectedCount, setProfessionalConnectedCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        setTimeout(() => {
          StatusBar.setBackgroundColor(theme.primary);
          StatusBar.setBarStyle('light-content');
        }, 600);
      }
    }, []),
  );

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      getHomeData();
      getFavoriteProfessionals()
      getAllRequests()
    }
  }, [isFocused]);

  async function getHomeData() {
    try {
      setLoading(true);
      const result = await API.Instance.get(API.API_ROUTES.getHomeData);
      if (result.status) {
        setProfessionalConnectedCount(result?.data?.data?.professional_connected_count);
        setAllServices(result?.data?.data?.services);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error')
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function getFavoriteProfessionals() {
    try {
      setLoading(true);
      const result = await API.Instance.get(API.API_ROUTES.getFavoriteProfessionals + `?page=${1}&limit=${2}`);
      if (result.status) {
        console.log('favoriteProfessionals==', result?.data?.data?.results)
        setFavoriteProfessionals(result?.data?.data?.results ?? []);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error')
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
      console.log(error?.message)
    } finally {
      setLoading(false);
    }
  }

  async function removeFavoriteProfessional(id: any) {
    try {
      setLoading(true);
      const result = await API.Instance.delete(API.API_ROUTES.removeFavoriteProfessional + `/${id}`);
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success')
        getFavoriteProfessionals()
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error')
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    }
  }

  async function getAllRequests() {

    try {
      const result: any = await API.Instance.get(API.API_ROUTES.getAllRequests + `?page=${1}&limit=${2}&status=all`);
      if (result.status) {
        const newData: any = result?.data?.data?.recent_requests?.items ?? []
        setRecentRequests(newData);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error')
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
      <StatusBar
        translucent={true}
        animated
        backgroundColor={theme.primary}
        barStyle={'light-content'} />
      {/* HEADER */}
      <HomeHeader
        professionalConnectedCount={professionalConnectedCount}
        onSearchPress={() => {
          props.navigation.navigate(SCREENS.Search.identifier);
        }}
        onPressNotification={() => {
          props.navigation.navigate(SCREENS.Notification.identifier);
        }}
        onPressUserProfile={() => {
          props.navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: SCREENS.BottomBar.identifier,
                  params: { isProfile: true },
                },
              ],
            }),
          );
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        contentContainerStyle={{
          paddingBottom: TABBAR_HEIGHT + getScaleSize(20),
        }}>
        <Text
          size={getScaleSize(20)}
          font={FONTS.Lato.SemiBold}
          style={{
            marginTop: getScaleSize(31),

            marginHorizontal: getScaleSize(22),
          }}
          color={theme._323232}>
          {STRING.explore_all_service}
        </Text>
        <TouchableOpacity style={styles(theme).bannerContainer}
          activeOpacity={1}
          onPress={() => {
            const service = allServices.find((item: any) => item.name === "Home Assistance");
            if (service) {
              props.navigation.navigate(SCREENS.Assistance.identifier, {
                service: service
              })
            } else {
              SHOW_TOAST('Service not found', 'error');
            }
          }}>
          <Text
            style={{ flex: 1.0, alignSelf: 'center' }}
            size={getScaleSize(24)}
            font={FONTS.Lato.Bold}
            color={theme._323232}>
            {'Home Assistance'}
          </Text>
          <Image
            style={styles(theme).bannerImage}
            source={IMAGES.home_assitance}
          />
        </TouchableOpacity>
        <View style={styles(theme).optionView}>
          <TouchableOpacity
            style={[
              styles(theme).imageContainer,
              { borderTopLeftRadius: getScaleSize(40) },
            ]}
            activeOpacity={1}
            onPress={() => {
              const service = allServices.find((item: any) => item.name === "Transport");
              if (service) {
                props.navigation.navigate(SCREENS.Assistance.identifier, {
                  service: service
                })
              } else {
                SHOW_TOAST('Service not found', 'error');
              }
            }}>
            <Image
              resizeMode="contain"
              style={styles(theme).iconImage}
              source={IMAGES.transport} />
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.Medium}
              style={{ marginTop: getScaleSize(8) }}
              color={theme._787878}>
              {STRING.Transport}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles(theme).imageContainer,
              { marginHorizontal: getScaleSize(12) },
            ]}
            activeOpacity={1}
            onPress={() => {
              const service = allServices.find((item: any) => item.name === "Personal Care");
              if (service) {
                props.navigation.navigate(SCREENS.Assistance.identifier, {
                  service: service
                })
              } else {
                SHOW_TOAST('Service not found', 'error');
              }
            }}>
            <Image
              style={styles(theme).iconImage}
              resizeMode="contain"
              source={IMAGES.personal_care}
            />
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.Medium}
              style={{ marginTop: getScaleSize(8) }}
              color={theme._787878}>
              {STRING.PersonalCare}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles(theme).imageContainer,
              { borderTopRightRadius: getScaleSize(40) },
            ]}
            activeOpacity={1}
            onPress={() => {
              const service = allServices.find((item: any) => item.name === "Tech Support");
              if (service) {
                props.navigation.navigate(SCREENS.Assistance.identifier, {
                  service: service
                })
              } else {
                SHOW_TOAST('Service not found', 'error');
              }
            }}>
            <Image
              resizeMode="contain"
              style={styles(theme).iconImage}
              source={IMAGES.tech_support}
            />
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.Medium}
              style={{ marginTop: getScaleSize(8) }}
              color={theme._787878}>
              {STRING.TechSupport}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles(theme).deviderView} />
        <View
          style={{
            flexDirection: 'row',
            marginTop: getScaleSize(31),
            marginBottom: getScaleSize(18),
            marginHorizontal: getScaleSize(22),
          }}>
          <Text
            size={getScaleSize(20)}
            font={FONTS.Lato.SemiBold}
            style={{ flex: 1.0 }}
            color={theme._323232}>
            {STRING.ResentRequests}
          </Text>
          {recentRequests?.length > 0 &&
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.Regular}
              onPress={() => {
                props.navigation.navigate(TABS.Request.identifier);
              }}
              style={{ alignSelf: 'center' }}
              color={theme._999999}>
              {STRING.ViewAll}
            </Text>
          }
        </View>
        {recentRequests.length > 0 ? (
          <>
            {recentRequests.map((item: any, index: number) => {
              return (
                <RequestItem
                  key={index}
                  item={item}
                  onPress={() => {
                    props.navigation.navigate(SCREENS.RequestDetails.identifier, {
                      item: item
                    })
                  }}
                />
              );
            })}
            {favoriteProfessionals?.length > 0 &&
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: getScaleSize(13),
                    marginHorizontal: getScaleSize(22),
                  }}>
                  <Text
                    size={getScaleSize(20)}
                    font={FONTS.Lato.SemiBold}
                    style={{ flex: 1.0 }}
                    color={theme._323232}>
                    {STRING.FavoriteProfessionals}
                  </Text>
                  {favoriteProfessionals?.length > 2 &&
                    <Text
                      onPress={() => {
                        props.navigation.navigate(SCREENS.Favourites.identifier);
                      }}
                      size={getScaleSize(16)}
                      font={FONTS.Lato.Regular}
                      style={{ alignSelf: 'center' }}
                      color={theme._999999}>
                      {STRING.ViewAll}
                    </Text>
                  }
                </View>
                <View style={{ marginHorizontal: getScaleSize(24), flexDirection: 'row', justifyContent: 'space-between' }}>
                  {favoriteProfessionals?.length > 0 && favoriteProfessionals.map((item: any, index: number) => {
                    return (
                      <View key={index} style={{ marginTop: getScaleSize(26) }}>
                        <FavouritesItem
                          item={item}
                          itemContainer={{}}
                          onPressFavorite={(item: any) => {
                            removeFavoriteProfessional(item?.provider?.id)
                          }}
                          onPressItem={(item: any) => {
                            props.navigation.navigate(SCREENS.OtherUserProfile.identifier, {
                              item: item?.provider ?? ''
                            })
                          }}
                        />
                      </View>
                    );
                  })}
                </View>
              </>
            }
          </>
        ) : (
          <View style={styles(theme).emptyView}>
            <Image style={styles(theme).emptyImage} source={IMAGES.empty} />
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.Regular}
              align="center"
              color={theme._939393}
              style={{
                marginTop: getScaleSize(20),
              }}>
              {STRING.Youhavenotcreatedanyrequest}
            </Text>
          </View>
        )}
        <View style={{ height: TABBAR_HEIGHT }} />
      </ScrollView>
      {isLoading && <ProgressView />}
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.white },
    bannerContainer: {
      height: getScaleSize(105),
      flex: 1.0,
      backgroundColor: '#FDBE12',
      borderBottomLeftRadius: getScaleSize(40),
      borderTopRightRadius: getScaleSize(40),
      borderBottomRightRadius: getScaleSize(12),
      borderTopLeftRadius: getScaleSize(12),
      marginTop: getScaleSize(26),
      paddingHorizontal: getScaleSize(22),
      justifyContent: 'center',
      flexDirection: 'row',
      marginHorizontal: getScaleSize(22),
    },
    bannerImage: {
      height: getScaleSize(74),
      width: getScaleSize(86),
      alignSelf: 'center',
    },
    optionView: {
      marginHorizontal: getScaleSize(16),
      flexDirection: 'row',
      marginTop: getScaleSize(16),
    },
    imageContainer: {
      flex: 1.0,
      backgroundColor: '#F8F8F8',
      borderRadius: getScaleSize(12),
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: getScaleSize(16),
    },
    iconImage: {
      height: getScaleSize(60),
      width: getScaleSize(60),
    },
    deviderView: {
      marginTop: getScaleSize(35),
      height: getScaleSize(6),
      backgroundColor: '#F8F8F8',
    },
    emptyView: {
      flex: 1.0,
      alignSelf: 'center',
      marginTop: getScaleSize(26),
    },
    emptyImage: {
      height: getScaleSize(140),
      width: getScaleSize(119),
      alignSelf: 'center',
    },
    statusBar: {
      height: StatusBar.currentHeight
    },
  });
