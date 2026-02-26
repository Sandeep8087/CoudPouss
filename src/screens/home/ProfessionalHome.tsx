import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Alert,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ImageBackground,
} from 'react-native';

//ASSETS
import {FONTS, IMAGES} from '../../assets';

//API
import {API} from '../../api';

//CONTEXT
import {AuthContext, ThemeContext, ThemeContextType} from '../../context';

//CONSTANT
import {
  getScaleSize,
  requestLocationPermission,
  SHOW_TOAST,
  useString,
} from '../../constant';

//COMPONENT
import {
  EmptyView,
  Header,
  ProgressView,
  RequestItem,
  SearchComponent,
  ServiceRequest,
  TaskItem,
  Text,
} from '../../components';

//PACKAGES
import {
  CommonActions,
  useFocusEffect,
  useIsFocused,
} from '@react-navigation/native';

//SCREENS
import {SCREENS} from '..';
import Geolocation from '@react-native-community/geolocation';

export default function ProfessionalHome(props: any) {
  const STRING = useString();

  const {theme} = useContext<any>(ThemeContext);

  const {profile} = useContext(AuthContext);

  const [isLoading, setLoading] = useState(false);
  const [serviceList, setServiceList] = useState<any>([]);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getCurrentLocation();
    }
  }, [isFocused]);

  async function getCurrentLocation() {
    try {
      setLoading(true);
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        SHOW_TOAST('Location permission denied', 'error');
        setLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        (position: any) => {
          const {latitude, longitude} = position.coords;
          console.log('latitude', latitude);
          console.log('longitude', longitude);
          getAllServices({latitude, longitude});
        },
        (error: any) => {
          setLoading(false);
          SHOW_TOAST(error.message, 'error');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    } catch (error: any) {
      setLoading(false);
      SHOW_TOAST(error?.message ?? '', 'error');
    }
  }

  async function getAllServices(location: any) {
    try {
      const page = 1;
      const limit = 2;
      setLoading(true);
      const result: any = await API.Instance.get(
        `${API.API_ROUTES.getProfessionalAllServices}?provider_lat=${location?.latitude}&provider_lon=${location?.longitude}&page=${page}&limit=${limit}`,
      );
      if (result?.status) {
        console.log('result==>', result?.data?.data);
        setServiceList(result.data.data ?? []);
      } else {
        SHOW_TOAST(result?.data?.detail, 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles(theme).container}>
      <StatusBar
        translucent={true}
        backgroundColor={theme.white}
        barStyle={'dark-content'}
      />
      <View style={styles(theme).headerContainer}>
        <View style={styles(theme).verticalView}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.Medium}
            color={theme._6D6D6D}
            style={{}}>
            {`Hello! ${
              profile?.user?.first_name + ' ' + profile?.user?.last_name
            }`}
          </Text>
          <Text
            size={getScaleSize(24)}
            font={FONTS.Lato.Bold}
            color={theme._2C6587}
            style={{}}>
            {'Welcome to CoudPouss'}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles(theme).notifiationIcon,
            {marginRight: getScaleSize(8)},
          ]}
          activeOpacity={1}
          onPress={() => {
            props.navigation.navigate(SCREENS.Notification.identifier);
          }}>
          <Image
            style={styles(theme).notifiationIcon}
            source={IMAGES.notification_professional}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles(theme).profilePic}
          activeOpacity={1}
          onPress={() => {
            props.navigation.navigate(SCREENS.MyProfileProfessional.identifier);
          }}>
          {profile?.user?.profile_photo_url ? (
            <Image
              style={styles(theme).profilePic}
              source={{uri: profile?.user?.profile_photo_url}}
            />
          ) : (
            <Image
              style={styles(theme).profilePic}
              source={IMAGES.user_placeholder}
            />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles(theme).searchView}>
        <SearchComponent
          onPressMicrophone={() => {
            console.log('onPressMicrophone');
          }}
        />
      </View>
      {/* <View style={{height: 400}}>
        {/* <SpeechToText /> */}
      {/* </View> */}
      <ScrollView
        style={styles(theme).scrolledContainer}
        showsVerticalScrollIndicator={false}>
        <ImageBackground
          style={styles(theme).bannerView}
          resizeMode="cover"
          source={IMAGES.homeBanner}>
          <View style={styles(theme).textView}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                size={getScaleSize(40)}
                font={FONTS.Lato.Bold}
                color={theme.white}>
                {serviceList?.stats?.verified_providers_today?.count ?? '0'}{' '}
              </Text>
              <Text
                size={getScaleSize(16)}
                font={FONTS.Lato.Medium}
                color={theme.white}>
                {'Professionals\nConnected Today'}
              </Text>
            </View>
            <Text
              style={{marginTop: getScaleSize(8)}}
              size={getScaleSize(12)}
              font={FONTS.Lato.Regular}
              color={theme.white}>
              {'Verified professionals ready to help you today'}
            </Text>
          </View>
        </ImageBackground>
        {profile?.has_purchased ? (
          <View>
            <View
              style={[
                styles(theme).directionView,
                {marginBottom: getScaleSize(24)},
              ]}>
              <Text
                size={getScaleSize(20)}
                font={FONTS.Lato.SemiBold}
                color={theme._323232}
                style={{
                  marginTop: getScaleSize(28),
                }}>
                {STRING.ExploreServiceRequests}
              </Text>
              <View style={{flex: 1}}></View>
              {serviceList?.open_services?.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    props.navigation.navigate(
                      SCREENS.ExploreServiceRequest.identifier,
                    );
                  }}>
                  <Text
                    size={getScaleSize(14)}
                    font={FONTS.Lato.Medium}
                    align="center"
                    color={theme._2C6587}
                    style={{
                      marginTop: getScaleSize(28),
                    }}>
                    {STRING.ViewAll}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {(serviceList?.open_services?.length > 0
              ? serviceList?.open_services
              : []
            )?.map((item: any, index: number) => (
              <ServiceRequest
                key={index}
                data={item}
                onPress={() => {
                  props.navigation.navigate(SCREENS.ServicePreview.identifier, {
                    serviceData: item,
                    isFromHome: true,
                  });
                }}
                onPressAccept={() => {
                  props.navigation.navigate(SCREENS.AddQuote.identifier, {
                    isItem: item,
                    isFromHome: true,
                  });
                }}
              />
            ))}

            <View style={styles(theme).horizontalContainer}>
              <Text
                size={getScaleSize(20)}
                font={FONTS.Lato.SemiBold}
                color={theme._323232}
                style={{
                  flex: 1.0,
                }}>
                {STRING.RecentTasks}
              </Text>
              {serviceList?.recent_tasks?.data?.length > 0 && (
                <TouchableOpacity
                  style={{paddingVertical: getScaleSize(8)}}
                  onPress={() => {
                    props.navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [
                          {
                            name: SCREENS.BottomBar.identifier,
                            params: {isTask: true},
                          },
                        ],
                      }),
                    );
                  }}>
                  <Text
                    size={getScaleSize(14)}
                    font={FONTS.Lato.Medium}
                    color={theme._2C6587}>
                    {STRING.ViewAll}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {serviceList?.recent_tasks?.data?.length > 0 ? (
              <>
                {(serviceList?.recent_tasks?.data?.length > 0
                  ? serviceList?.recent_tasks?.data
                  : []
                )?.map((item: any, index: number) => {
                  return (
                    <TaskItem
                      key={index}
                      item={item}
                      onPressItem={() => {
                        if (item?.task_status === 'pending') {
                          props.navigation.navigate(
                            SCREENS.OpenRequestDetails.identifier,
                            {
                              item: item,
                            },
                          );
                        } else if (item?.task_status === 'accepted') {
                          props.navigation.navigate(
                            SCREENS.CompletedTaskDetails.identifier,
                            {
                              item: item,
                            },
                          );
                        }
                        props.navigation.navigate(
                          SCREENS.ProfessionalTaskDetails.identifier,
                          {
                            item: item,
                          },
                        );
                      }}
                      onPressStatus={() => {
                        props.navigation.navigate(
                          SCREENS.TaskStatus.identifier,
                          {
                            item: item,
                          },
                        );
                      }}
                      onPressChat={() => {
                        console.log('professional home item==>', item);
                        // props.navigation.navigate(
                        //   SCREENS.ChatDetails.identifier,
                        // );
                      }}
                    />
                  );
                })}
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
                  {
                    STRING.you_have_not_accepted_any_request_please_accept_a_request
                  }
                </Text>
              </View>
            )}
          </View>
        ) : (
          <EmptyView
            title={STRING.you_have_not_subscribed_to_any_plan}
            style={styles(theme).emptyContainer}
            onPressButton={() => {
              props.navigation.navigate(
                SCREENS.ChooseYourSubscription.identifier,
                {
                  isFromSubscriptionButton: true,
                },
              );
            }}
          />
        )}
      </ScrollView>
      {isLoading && <ProgressView />}
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: theme.white},
    headerContainer: {
      flexDirection: 'row',
      marginHorizontal: getScaleSize(22),
      marginTop: StatusBar.currentHeight
        ? StatusBar.currentHeight + getScaleSize(10)
        : getScaleSize(20),
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
    searchView: {
      marginTop: getScaleSize(23),
      marginHorizontal: getScaleSize(22),
    },
    scrolledContainer: {
      marginTop: getScaleSize(28),
      marginHorizontal: getScaleSize(22),
    },
    bannerView: {
      height:
        ((Dimensions.get('window').width - getScaleSize(44)) *
          getScaleSize(124)) /
        getScaleSize(386),
      alignSelf: 'center',
      width: Dimensions.get('window').width - getScaleSize(44),
      borderRadius: getScaleSize(25),
      overflow: 'hidden',
    },
    horizontalContainer: {
      marginTop: getScaleSize(3),
      flexDirection: 'row',
      alignItems: 'center',
    },
    directionView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    textView: {
      justifyContent: 'center',
      flex: 1.0,
      marginLeft: getScaleSize(135),
      marginRight: getScaleSize(30),
    },
    emptyView: {
      flex: 1.0,
      alignSelf: 'center',
      justifyContent: 'center',
      marginVertical: getScaleSize(26),
    },
    emptyImage: {
      height: getScaleSize(217),
      width: getScaleSize(184),
      alignSelf: 'center',
    },
    emptyContainer: {
      marginHorizontal: getScaleSize(24),
      marginVertical: getScaleSize(24),
      flex: 1,
    },
  });
