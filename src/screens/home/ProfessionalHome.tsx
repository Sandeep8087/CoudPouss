import React, { useContext, useEffect, useRef, useState } from 'react';
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
  Linking,
  Platform,
  PermissionsAndroid,
  AppState,
} from 'react-native';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//API
import { API } from '../../api';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import {
  getScaleSize,
  openStripeCheckout,
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
import { SCREENS } from '..';
import Geolocation from 'react-native-geolocation-service';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { EventRegister } from 'react-native-event-listeners';

export default function ProfessionalHome(props: any) {

  const skipSubscription = props?.route?.params?.skipSubscription;

  const STRING = useString();

  const { theme } = useContext<any>(ThemeContext);

  const { profile, fetchProfile, userType } = useContext(AuthContext);

  console.log('profile==', profile);

  const [isLoading, setLoading] = useState(false);
  const [serviceList, setServiceList] = useState<any>([]);
  const [locationDenied, setLocationDenied] = useState(false);

  const isFocused = useIsFocused();


  let currentState = AppState.currentState;

  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (currentState === 'active' && nextState === 'background') {
        onUpdateProfile();
      }

      if (currentState === 'background' && nextState === 'active') {
        onUpdateProfile();
      }

      currentState = nextState;
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    EventRegister.addEventListener('onAccountSuccess', (data: any) => {
      onUpdateProfile();
    });
  }, []);

  const onUpdateProfile = async () => {
    setLoading(true);
    await fetchProfile();
    setLoading(false);
  }

  useEffect(() => {
    console.log('onAccountCancel');
    EventRegister.addEventListener('onAccountCancel', (data: any) => {
      onUpdateProfile();
    });
  }, []);

  useEffect(() => {
    if (isFocused) {
      onUpdateProfile();
      requestPermissions();
      getLocation()
    }
  }, [isFocused]);

  const hasLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const status = await request(PERMISSIONS.IOS.CAMERA);
      if (status === RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    }
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const getLocation = () => {
    let resolved = false;

    const watchId = Geolocation.watchPosition(
      pos => {
        if (!resolved) {
          resolved = true;
          Geolocation.clearWatch(watchId);
          console.log('LOCATION 👉', pos);
          const { latitude, longitude } = pos.coords;
          setLoading(false);
          getAllServices({ latitude, longitude });
        }
      },
      err => {
        console.log('WATCH ERROR 👉', err);
      },
      { enableHighAccuracy: false }
    );

    setTimeout(() => {
      if (!resolved) {
        Geolocation.clearWatch(watchId);
        console.log('Location timeout fallback');
      }
    }, 35000);
  };

  // async function getLocation() {
  //   const permission = await hasLocationPermission();
  //   if (!permission) return;

  //   Geolocation.getCurrentPosition(
  //     position => {
  //       const { latitude, longitude } = position.coords;
  //       setLoading(false);
  //       getAllServices({ latitude, longitude });
  //     },
  //     error => console.log('Error:', error),
  //     {
  //       enableHighAccuracy: false,
  //       timeout: 30000,
  //       maximumAge: 10000,
  //     },
  //   );
  // }

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
    } else {
      await request(PERMISSIONS.IOS.CAMERA);
    }
  };


  async function getAllServices(location: any) {
    try {
      const page = 1;
      const limit = 2;
      setLoading(true);
      const result: any = await API.Instance.get(
        `${API.API_ROUTES.getProfessionalAllServices}?provider_lat=${location?.latitude}&provider_lon=${location?.longitude}&page=${page}&limit=${limit}&platform=app`,
      );
      setLoading(false)
      if (result?.status) {
        console.log('result==>', result?.data?.data);
        setServiceList(result.data.data ?? []);
      } else {
        setLoading(false)
        SHOW_TOAST(result?.data?.detail, 'error');
        console.log('error==>', result?.data?.detail)
      }
    } catch (error: any) {
      setLoading(false)
      SHOW_TOAST(error?.message ?? '', 'error');
      console.log('error==>', error?.message)
    } finally {
      setLoading(false);
    }
  }

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const renderServiceRequestListView = () => {
    return (
      <View>
        <View
          style={[
            styles(theme).directionView,
            { marginBottom: getScaleSize(24) },
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
          <View style={{ flex: 1 }}></View>
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
              style={{ paddingVertical: getScaleSize(8) }}
              onPress={() => {
                props.navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: SCREENS.BottomBar.identifier,
                        params: { isTask: true },
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
                    // if (item?.task_status === 'pending') {
                    //   props.navigation.navigate(
                    //     SCREENS.OpenRequestDetails.identifier,
                    //     {
                    //       item: item,
                    //     },
                    //   );
                    // } else if (item?.task_status === 'accepted') {
                    //   props.navigation.navigate(
                    //     SCREENS.CompletedTaskDetails.identifier,
                    //     {
                    //       item: item,
                    //     },
                    //   );
                    // }
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
                    props.navigation.navigate(
                      SCREENS.ChatDetails.identifier,
                    );
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
    )
  }

  const renderServiceRequestView = () => {
    if (profile?.has_purchased === true) {
      if (profile?.user?.service_provider_type === 'professional') {
        if (profile?.onboarding_status === true) {
          return renderServiceRequestListView();
        }
        else {
          return (
            <EmptyView
              title={STRING.you_have_not_completed_your_onboarding}
              style={styles(theme).emptyContainer}
              buttonTitle={STRING.onboarding_process}
              onPressButton={() => {
                openStripeCheckout(profile?.onboarding_redirect_url ?? '')
              }}
            />
          )
        }
      }
      else {
        return renderServiceRequestListView();
      }
    } else {
      return (
        <EmptyView
          title={STRING.you_have_not_subscribed_to_any_plan}
          style={styles(theme).emptyContainer}
          onPressButton={() => {
            props.navigation.navigate(SCREENS.ChooseYourSubscription.identifier, {
              isFromSubscriptionButton: true,
            });
          }}
        />
      )
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
            {`Hello! ${profile?.user?.first_name + ' ' + profile?.user?.last_name
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
            { marginRight: getScaleSize(8) },
          ]}
          activeOpacity={1}
          onPress={() => {
            props.navigation.navigate(SCREENS.Notification.identifier);
          }}>
          <Image
            style={styles(theme).notifiationIcon}
            source={IMAGES.notification}
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
              source={{ uri: profile?.user?.profile_photo_url }}
            />
          ) : <>
            {profile?.user?.first_name && profile?.user?.last_name ? (
              <View style={styles(theme).EmptyProfileContainer}>
                <Text size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  align="center"
                  color={theme._262B43E5}>
                  {(profile?.user?.first_name?.charAt(0) ?? '').toUpperCase() +
                    (profile?.user?.last_name?.charAt(0) ?? '').toUpperCase()}
                </Text>
              </View>
            ) : (
              <Image
                style={styles(theme).profilePic}
                source={IMAGES.user_placeholder}
              />
            )}
          </>
          }
        </TouchableOpacity>
      </View>
      {/* <View style={styles(theme).searchView}>
        <SearchComponent
          value={searchText}
          onChangeText={setSearchText}
          onPressMicrophone={() => {
            console.log('onPressMicrophone');
          }}
        />
      </View> */}
      {locationDenied ? (
        <EmptyView
          title={STRING.location_permission_required}
          style={styles(theme).emptyContainer}
          onPressButton={() => {
            openAppSettings()
          }}
          buttonTitle={STRING.open_settings}
        />
      ) : (
        <ScrollView
          style={styles(theme).scrolledContainer}
          showsVerticalScrollIndicator={false}>
          <ImageBackground
            style={styles(theme).bannerView}
            resizeMode="cover"
            source={IMAGES.homeBanner}>
            <View style={styles(theme).textView}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  size={getScaleSize(40)}
                  font={FONTS.Lato.Bold}
                  color={theme.white}>
                  {serviceList?.stats?.verified_providers_today?.count ??
                    '0'}{' '}
                </Text>
                <Text
                  size={getScaleSize(16)}
                  font={FONTS.Lato.Medium}
                  color={theme.white}>
                  {'Professionals\nConnected Today'}
                </Text>
              </View>
              <Text
                style={{ marginTop: getScaleSize(8) }}
                size={getScaleSize(12)}
                font={FONTS.Lato.Regular}
                color={theme.white}>
                {'Verified professionals ready to help you today'}
              </Text>
            </View>
          </ImageBackground>
          {renderServiceRequestView()}
        </ScrollView>

      )}
      {isLoading && <ProgressView />}
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: { flex: 1.0, backgroundColor: theme.white },
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
      tintColor: '#6D6D6D'
    },
    profilePic: {
      height: getScaleSize(34),
      width: getScaleSize(34),
      borderRadius: getScaleSize(17),
      alignSelf: 'center',
    },
    EmptyProfileContainer: {
      width: getScaleSize(34),
      height: getScaleSize(34),
      backgroundColor: theme._F0EFF0,
      borderRadius: getScaleSize(34),
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
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
