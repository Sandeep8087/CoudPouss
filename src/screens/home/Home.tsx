import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  ImageBackground,
  Dimensions,
} from 'react-native';

import { ThemeContext, ThemeContextType } from '../../context';
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';
import {
  Text,
  HomeHeader,
  RequestItem,
  FavouritesItem,
  ProgressView,
} from '../../components';
import {
  CommonActions,
  useFocusEffect,
  useIsFocused,
} from '@react-navigation/native';
import { SCREENS, TABS } from '..';
import { API } from '../../api';

export default function Home(props: any) {
  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  const acceptRef = useRef<any>(null);

  const [isLoading, setLoading] = useState(false);
  const [allServices, setAllServices] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [favoriteProfessionals, setFavoriteProfessionals] = useState([]);
  const [professionalConnectedCount, setProfessionalConnectedCount] = useState(0);
  const [hasUnreadNotification, setHasUnreadNotification] = useState<boolean>(false);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        setTimeout(() => {
          StatusBar.setBackgroundColor(theme.primary);
          StatusBar.setBarStyle('light-content');
        }, 600);
      }
    }, [theme.primary]),
  );

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      getHomeData();
      getFavoriteProfessionals();
      getAllRequests();
      getNotificationCount()
    }
  }, [isFocused]);

  async function getHomeData() {
    try {
      setLoading(true);
      const result = await API.Instance.get(API.API_ROUTES.getHomeData);
      if (result.status) {
        setProfessionalConnectedCount(
          result?.data?.data?.professional_connected_count,
        );
        setAllServices(result?.data?.data?.services);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
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
      const result = await API.Instance.get(
        API.API_ROUTES.getFavoriteProfessionals + `?page=${1}&limit=${2}`,
      );
      if (result.status) {
        console.log('favoriteProfessionals==', result?.data?.data?.results);
        setFavoriteProfessionals(result?.data?.data?.results ?? []);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
      console.log(error?.message);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavoriteProfessional(id: any) {
    try {
      setLoading(true);
      const result = await API.Instance.delete(
        API.API_ROUTES.removeFavoriteProfessional + `/${id}`,
      );
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success');
        getFavoriteProfessionals();
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    }
  }

  async function getAllRequests() {
    try {
      const result: any = await API.Instance.get(
        API.API_ROUTES.getAllRequests + `?page=${1}&limit=${2}&status=all`,
      );
      if (result.status) {
        const newData: any = result?.data?.data?.recent_requests?.items ?? [];
        setRecentRequests(newData);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
      console.log(error?.message);
    } finally {
      setLoading(false);
    }
  }

  async function getNotificationCount() {
    try {
      setLoading(true);
      const result = await API.Instance.get(API.API_ROUTES.getNotificationCount);
      if (result.status) {
        console.log('notificationCount==', result?.data?.data);
        setHasUnreadNotification(result?.data?.data?.has_unread ?? false);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    }
    catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
      console.log(error?.message);
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
        barStyle={'light-content'}
      />
      {/* HEADER */}
      <HomeHeader
        professionalConnectedCount={professionalConnectedCount}
        hasUnreadNotification={hasUnreadNotification}
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
      <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={true}>
        <View
          style={{
            marginTop: 0 - getScaleSize(70),
            backgroundColor: theme.primary,
            paddingTop: StatusBar.currentHeight,
            borderBottomLeftRadius: getScaleSize(60),
            borderBottomRightRadius: getScaleSize(60),
            overflow: 'hidden',
          }}>
          <View style={styles(theme).bottomText}>
            <View style={styles(theme).userImage}>
              <Image style={styles(theme).workerImage} source={IMAGES.worker} />
            </View>
            <View style={styles(theme).textView}>
              <View style={{ flexDirection: 'row' }}>
                <Text
                  size={getScaleSize(48)}
                  font={FONTS.Lato.Bold}
                  color={theme.white}>
                  {professionalConnectedCount ?? '0'}{' '}
                </Text>
                <Text
                  size={getScaleSize(20)}
                  font={FONTS.Lato.SemiBold}
                  color={theme.white}>
                  {STRING.professionals_connected_today}
                </Text>
              </View>
              <Text
                style={{ marginTop: getScaleSize(8) }}
                size={getScaleSize(12)}
                font={FONTS.Lato.Regular}
                color={theme.white}>
                {STRING.verified_professionals_ready_to_help_you_today}
              </Text>
            </View>
          </View>
        </View>
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

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            const service = allServices.find(
              (item: any) => item.name === 'Home Assistance',
            );
            if (service) {
              props.navigation.navigate(SCREENS.Assistance.identifier, {
                service: service,
              });
            } else {
              SHOW_TOAST(STRING.service_not_found, 'error');
            }
          }}>
          <ImageBackground source={IMAGES.homeBG} style={styles(theme).bannerContainer}>
            <Text
              style={{ flex: 1.0, alignSelf: 'center' }}
              size={getScaleSize(24)}
              font={FONTS.Lato.Bold}
              color={theme._323232}>
              {STRING.home_assistance}
            </Text>
            <Image
              style={styles(theme).bannerImage}
              source={IMAGES.home_assitance}
            />
          </ImageBackground>

          {/* <Image
            style={styles(theme).bgIcon}
            source={IMAGES.homeBG}
          /> */}
        </TouchableOpacity>
        <View style={styles(theme).optionView}>
          <TouchableOpacity
            style={[
              styles(theme).imageContainer,
              { borderTopLeftRadius: getScaleSize(40) },
            ]}
            activeOpacity={1}
            onPress={() => {
              const service = allServices.find(
                (item: any) => item.name === 'Transport',
              );
              if (service) {
                props.navigation.navigate(SCREENS.Assistance.identifier, {
                  service: service,
                });
              } else {
                SHOW_TOAST(STRING.service_not_found, 'error');
              }
            }}>
            <Image
              resizeMode="contain"
              style={styles(theme).iconImage}
              source={IMAGES.transport}
            />
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
              const service = allServices.find(
                (item: any) => item.name === 'Personal Care',
              );
              if (service) {
                props.navigation.navigate(SCREENS.Assistance.identifier, {
                  service: service,
                });
              } else {
                SHOW_TOAST(STRING.service_not_found, 'error');
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
              align="center"
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
              const service = allServices.find(
                (item: any) => item.name === 'Tech Support',
              );
              if (service) {
                props.navigation.navigate(SCREENS.Assistance.identifier, {
                  service: service,
                });
              } else {
                SHOW_TOAST(STRING.service_not_found, 'error');
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
              align="center"
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
          {recentRequests?.length >= 2 && (
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
          )}
        </View>
        {recentRequests.length > 0 ? (
          <>
            {recentRequests.map((item: any, index: number) => {
              return (
                <RequestItem
                  key={index}
                  item={item}
                  onPress={() => {
                    if (item?.task_status?.toLowerCase() === 'expired') {
                    } else {
                      props.navigation.navigate(
                        SCREENS.RequestDetails.identifier,
                        {
                          item: item,
                        },
                      );
                    }
                  }}
                />
              );
            })}
            {favoriteProfessionals?.length > 0 && (
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
                  {favoriteProfessionals?.length > 1 && (
                    <Text
                      onPress={() => {
                        props.navigation.navigate(
                          SCREENS.Favourites.identifier,
                        );
                      }}
                      size={getScaleSize(16)}
                      font={FONTS.Lato.Regular}
                      style={{ alignSelf: 'center' }}
                      color={theme._999999}>
                      {STRING.ViewAll}
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    marginHorizontal: getScaleSize(24),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  {favoriteProfessionals?.length > 0 &&
                    favoriteProfessionals.map((item: any, index: number) => {
                      return (
                        <View key={index} style={{ marginTop: getScaleSize(26) }}>
                          <FavouritesItem
                            item={item}
                            itemContainer={{}}
                            onPressFavorite={(item: any) => {
                              removeFavoriteProfessional(item?.provider?.id);
                            }}
                            onPressItem={(item: any) => {
                              props.navigation.navigate(
                                SCREENS.OtherUserProfile.identifier,
                                {
                                  item: item?.provider ?? '',
                                },
                              );
                            }}
                          />
                        </View>
                      );
                    })}
                </View>
              </>
            )}
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
        {/* <View style={{ height: TABBAR_HEIGHT }} /> */}
      </ScrollView>
      {isLoading && <ProgressView />}
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white
    },
    bannerContainer: {
      flex: 1.0,
      height: ((Dimensions.get('window').width - getScaleSize(48)) * getScaleSize(104)) / getScaleSize(382),
      width: Dimensions.get('window').width - getScaleSize(48),
      marginTop: getScaleSize(26),
      paddingLeft: getScaleSize(32),
      paddingRight: getScaleSize(70),
      justifyContent: 'center',
      flexDirection: 'row',
      marginHorizontal: getScaleSize(24),

    },
    bannerImage: {
      height: getScaleSize(66),
      width: getScaleSize(66),
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
      height: getScaleSize(56),
      width: getScaleSize(56),
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
      height: StatusBar.currentHeight,
    },
    userImage: {
      overflow: 'visible',
      width: getScaleSize(240),
      height: getScaleSize(225),
      marginTop: getScaleSize(32),
      backgroundColor: '#1E4A5D',
      borderRadius: 112,
      left: -56,
      top: 26,
    },
    workerImage: {
      height: getScaleSize(250),
      width: getScaleSize(151),
      position: 'absolute',
      resizeMode: 'cover',
      left: 50,
      top: -45,
    },
    bottomText: {
      flexDirection: 'row',
      marginLeft: getScaleSize(16),
    },
    textView: {
      justifyContent: 'center',
      marginTop: getScaleSize(32),
      marginLeft: getScaleSize(-40),
    },
  });
