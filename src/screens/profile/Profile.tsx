import React, { useContext, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, openStripeCheckout, Storage, TABBAR_HEIGHT, useString } from '../../constant';

//COMPONENTS
import { Text, HomeHeader, SearchComponent, Header, Button, BottomSheet, ProgressView } from '../../components';
import { SCREENS } from '..';
import { CommonActions } from '@react-navigation/native';
import { stubFalse } from 'lodash';


export default function Profile(props: any) {

  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);
  const { userType, profile } = useContext<any>(AuthContext);

  const [isLoading, setLoading] = useState(false);
  const bottomSheetRef = useRef<any>(null);

  console.log('user', profile)

  const profileItemsElder = [
    { id: 1, title: STRING.my_profile, icon: IMAGES.ic_my_profile, onPress: SCREENS.MyProfile.identifier },
    { id: 2, title: STRING.transactions, icon: IMAGES.ic_transactions, onPress: SCREENS.TransactionsElder.identifier },
    { id: 3, title: STRING.ratings_reviews, icon: IMAGES.ic_ratings_reviews, onPress: SCREENS.RatingsReviews.identifier },
    { id: 4, title: STRING.notifications, icon: IMAGES.ic_notifications, onPress: SCREENS.Notification.identifier },
    { id: 5, title: STRING.prefered_language, icon: IMAGES.ic_language, onPress: SCREENS.Language.identifier }
  ]

  const profieItemsProfessional = [
    { id: 1, title: STRING.my_profile, icon: IMAGES.ic_my_profile, onPress: SCREENS.MyProfileProfessional.identifier },
    { id: 2, title: STRING.my_earnings, icon: IMAGES.ic_my_earnings, onPress: SCREENS.MyEarnings.identifier },
    { id: 3, title: STRING.manage_services, icon: IMAGES.ic_manage_services, onPress: SCREENS.ManageServices.identifier },
    { id: 4, title: STRING.manage_subscription, icon: IMAGES.ic_manage_subscription, onPress: SCREENS.ManageSubscription.identifier },
    { id: 5, title: STRING.ratings_reviews, icon: IMAGES.ic_ratings_reviews, onPress: SCREENS.RatingsReviews.identifier },
    { id: 6, title: STRING.notifications, icon: IMAGES.ic_notifications, onPress: SCREENS.Notification.identifier },
    { id: 7, title: STRING.prefered_language, icon: IMAGES.ic_language, onPress: SCREENS.Language.identifier }

  ]

  function getProfileItems() {
    if (userType === 'service_provider') {
      return profieItemsProfessional;
    } else {
      return profileItemsElder;
    }
  }

  async function logout() {
    setLoading(true);
    bottomSheetRef.current.close();
    await Storage.clear()
    props.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: SCREENS.Splash.identifier }],
      }),
    );
    setLoading(false);
  }


  return (
    <View style={styles(theme).container}>
      <Header
        type="profile"
        rightIcon={{ icon: IMAGES.ic_logout, title: STRING.logout }}
        onPress={() => {
          bottomSheetRef.current.open();
        }}
        screenName={STRING.my_account}
      />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: getScaleSize(20)
        }}>
        <View style={styles(theme).mainContainer}>
          {profile?.user?.profile_photo_url ? (
            <Image source={{ uri: profile?.user?.profile_photo_url }} resizeMode='cover' style={styles(theme).profileContainer} />
          ) : (
            <View style={styles(theme).EmptyProfileContainer}>
              <Text
                size={getScaleSize(24)}
                font={FONTS.Lato.Regular}
                align="center"
                color={theme._262B43E5}>
                {(profile?.user?.first_name?.charAt(0) ?? '').toUpperCase() +
                  (profile?.user?.last_name?.charAt(0) ?? '').toUpperCase()}
              </Text>
            </View>
          )}
          <Text
            size={getScaleSize(22)}
            font={FONTS.Lato.SemiBold}
            align="center"
            numberOfLines={1}
            color={theme._2B2B2B}>
            {(profile?.user?.first_name ?? "") + " " + (profile?.user?.last_name ?? "")}
          </Text>
          {userType === 'service_provider' && (
            <>
              {profile?.provider_info?.is_docs_verified == false || profile?.onboarding_status === false && (
                <View style={styles(theme).checkStatusContainer}>
                  <Image source={IMAGES.ic_alart} style={styles(theme).alartIcon} />
                  <Text
                    size={getScaleSize(19)}
                    font={FONTS.Lato.Bold}
                    align="center"
                    color={theme._214C65}>
                    {STRING.account_under_verification}
                  </Text>
                  {profile?.provider_info?.is_docs_verified === false && (
                    <TouchableOpacity
                      onPress={() => {
                        props.navigation.navigate(SCREENS.ApplicationStatus.identifier);
                      }}
                      style={[styles(theme).checkStatusButton, { backgroundColor: theme._214C65 }]}>
                      <Text
                        size={getScaleSize(16)}
                        font={FONTS.Lato.SemiBold}
                        align="center"
                        color={theme.white}>
                        {STRING.check_status}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {profile?.onboarding_status === false && (
                    <TouchableOpacity
                      onPress={() => {
                        openStripeCheckout(profile?.onboarding_redirect_url ?? '')
                      }}
                      style={[styles(theme).checkStatusButton, { backgroundColor: theme._F0B52C }]}>
                      <Text
                        size={getScaleSize(16)}
                        font={FONTS.Lato.SemiBold}
                        align="center"
                        color={theme.white}>
                        {STRING.onboarding_process}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}
          <View style={{ marginTop: userType === 'service_provider' ? getScaleSize(20) : getScaleSize(40) }}>
            {getProfileItems().map((item: any, index: number) => {
              return (
                <TouchableOpacity key={index}
                  onPress={() => { props.navigation.navigate(item.onPress) }}
                  style={styles(theme).profileItemContainer}>
                  <Image
                    source={item.icon}
                    style={styles(theme).profileItemIcon}
                  />
                  <Text
                    style={{ flex: 1.0 }}
                    size={getScaleSize(22)}
                    font={FONTS.Lato.SemiBold}
                    color={theme._2C6587}>
                    {item.title}
                  </Text>
                  <Image source={IMAGES.ic_right} style={styles(theme).profileItemRightIcon} />
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </ScrollView>
      <BottomSheet
        bottomSheetRef={bottomSheetRef}
        height={Dimensions.get('window').height * 0.4}
        isInfo={true}
        title={STRING.are_you_sure_you_want_to_logout}
        buttonTitle={STRING.logout}
        secondButtonTitle={STRING.cancel}
        onPressSecondButton={() => {
          bottomSheetRef.current.close();
        }}
        onPressButton={() => {
          logout()
        }}
      />
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
    mainContainer: {
      flex: 1,
      marginHorizontal: getScaleSize(24),
      marginTop: getScaleSize(42),
      marginBottom: getScaleSize(20),
    },
    profileContainer: {
      width: getScaleSize(126),
      height: getScaleSize(126),
      borderWidth: 1,
      borderColor: theme._F0EFF0,
      borderRadius: getScaleSize(126),
      alignSelf: 'center',
      marginBottom: getScaleSize(12),
    },
    EmptyProfileContainer: {
      width: getScaleSize(126),
      height: getScaleSize(126),
      backgroundColor: theme._F0EFF0,
      borderRadius: getScaleSize(126),
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: getScaleSize(12),
    },
    profileItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getScaleSize(16),
    },
    profileItemIcon: {
      width: getScaleSize(56),
      height: getScaleSize(56),
      marginRight: getScaleSize(20),
    },
    profileItemRightIcon: {
      width: getScaleSize(24),
      height: getScaleSize(24),
      marginHorizontal: getScaleSize(12),
    },
    checkStatusContainer: {
      borderWidth: 1,
      borderColor: theme._2C6587,
      borderRadius: getScaleSize(12),
      paddingHorizontal: getScaleSize(66),
      paddingVertical: getScaleSize(24),
      marginTop: getScaleSize(10),
    },
    alartIcon: {
      width: getScaleSize(60),
      height: getScaleSize(60),
      alignSelf: 'center',
      marginBottom: getScaleSize(12),
    },
    checkStatusButton: {

      borderRadius: getScaleSize(12),
      alignItems: 'center',
      paddingVertical: getScaleSize(10),
      marginTop: getScaleSize(20),
    }
  });
