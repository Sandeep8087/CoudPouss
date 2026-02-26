import React, { useContext, useEffect, useState } from 'react';
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
  Platform,
} from 'react-native';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';

//COMPONENT
import {
  Header,
  RatingsReviewsItem,
  RattingControler,
  RequestItem,
  SearchComponent,
  Text,
} from '../../components';

//PACKAGES
import { useFocusEffect } from '@react-navigation/native';
import { SCREENS } from '..';
import { API } from '../../api';

export default function OtherUserProfile(props: any) {
  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  const item = props?.route?.params?.item ?? {};
  const providerId = props?.route?.params?.providerId ?? '';

  const [isLoading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showMoreExperience, setShowMoreExperience] = useState(false);
  const [userProfile, setUserProfile] = useState<any>({});
  const [ratings, setRatings] = useState<any>({});

  useEffect(() => {
    getOtherUserProfile();
  }, []);

  async function getOtherUserProfile() {

    try {
      const params = {
        user_id: providerId ? providerId : item?.id,
      }

      console.log('item?.id,', item?.id,)
      setLoading(true);
      const result = await API.Instance.post(API.API_ROUTES.otherUserProfile, params);
      if (result.status) {
        setUserProfile(result?.data?.data ?? {});
        parseRatings(result?.data?.data?.customer_ratings)
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error')
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  const parseRatings = (item: any) => {
    if (!item) return {};

    try {
      const fixedString = item.replace(/'/g, '"');
      const ratings = JSON.parse(fixedString);
      setRatings(ratings);
    } catch (e) {
      console.log('Rating parse error', e);
      return {};
    }
  };

  console.log('userProfile?.profile_photo_url', userProfile?.profile_photo_url)

  const overallRating = Number(userProfile?.overall_ratings ?? 0);

  return (
    <View style={styles(theme).container}>
      <Header
        onBack={() => {
          props.navigation.goBack();
        }}
        screenName={STRING.Aboutprofessional}
      />
      <ScrollView
        style={styles(theme).scrolledContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles(theme).informationContainer}>
          {userProfile?.profile_photo_url ?
            <Image
              style={styles(theme).profilePic}
              source={{ uri: userProfile?.profile_photo_url }}
            />
            :
            <Image
              style={styles(theme).profilePic}
              source={IMAGES.user_placeholder}
            />
          }
          <Text
            size={getScaleSize(22)}
            font={FONTS.Lato.SemiBold}
            color={theme._2B2B2B}
            style={{ alignSelf: 'center' }}>
            {userProfile?.full_name ?? ''}
          </Text>
          <View style={styles(theme).horizontalContainer}>
            <View style={styles(theme).itemContainer}>
              <View>
                <Text
                  size={getScaleSize(16)}
                  font={FONTS.Lato.Bold}
                  color={'#1D7885'}
                  style={{ alignSelf: 'center' }}>
                  {userProfile?.overall_ratings ?? '0.0'}
                </Text>
                <Text
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={'#214C65'}
                  style={{ alignSelf: 'center', marginTop: getScaleSize(4) }}>
                  {STRING.Overallrating}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles(theme).itemContainer,
                { marginHorizontal: getScaleSize(16) },
              ]}>
              <View>
                {/* <Text
                  size={getScaleSize(16)}
                  font={FONTS.Lato.Bold}
                  color={'#1D7885'}
                  style={{alignSelf: 'center'}}>
                  {'4.6'}
                </Text> */}
                {item?.is_certified === true &&
                  <Image
                    style={{
                      height: getScaleSize(24),
                      width: getScaleSize(24),
                      alignSelf: 'center',
                    }}
                    source={IMAGES.verify}
                  />
                }
                <Text
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={'#214C65'}
                  align='center'
                  style={{ marginTop: getScaleSize(4) }}>
                  {item?.is_certified === true ? STRING.Certified : 'Not\ncertified'}
                </Text>
              </View>
            </View>
            <View style={styles(theme).itemContainer}>
              <View>
                <Text
                  size={getScaleSize(16)}
                  font={FONTS.Lato.Bold}
                  color={'#1D7885'}
                  style={{ alignSelf: 'center' }}>
                  {userProfile?.unique_clients_served ?? '0'}
                </Text>
                <Text
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={'#214C65'}
                  style={{ alignSelf: 'center', marginTop: getScaleSize(4) }}>
                  {STRING.Clients}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles(theme).informationContainer}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.Medium}
            color={'#2C6587'}>
            {STRING.Bio}
          </Text>
          <Text
            size={getScaleSize(14)}
            font={FONTS.Lato.Medium}
            style={{ marginTop: getScaleSize(16) }}
            color={theme._323232}>
            {userProfile?.provider_info?.bio ?? ''}
          </Text>
        </View>
        <View style={styles(theme).informationContainer}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.Medium}
            color={'#2C6587'}>
            {STRING.ExperienceSpecialities}
          </Text>
          <Text
            size={getScaleSize(14)}
            font={FONTS.Lato.Medium}
            numberOfLines={showMoreExperience ? undefined : 5}
            style={{ marginTop: getScaleSize(20) }}
            color={theme._323232}>
            {userProfile?.provider_info?.speciality ?? '-'}
          </Text>
          {userProfile?.provider_info?.speciality?.length > 50 &&
            <TouchableOpacity
              onPress={() => setShowMoreExperience(!showMoreExperience)}
              style={{ marginTop: getScaleSize(16) }}>
              <Text
                size={getScaleSize(16)}
                font={FONTS.Lato.Medium}
                color={'#2C6587'}>
                {showMoreExperience ? STRING.show_less : STRING.read_more}
              </Text>
            </TouchableOpacity>
          }
        </View>
        <View style={styles(theme).informationContainer}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.Medium}
            color={'#2C6587'}>
            {STRING.Achievements}
          </Text>
          <Text
            size={getScaleSize(14)}
            font={FONTS.Lato.Medium}
            style={{ marginTop: getScaleSize(16) }}
            color={theme._323232}>
            {userProfile?.provider_info?.achievements ?? '-'}
          </Text>
        </View>
        <View style={styles(theme).informationContainer}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.Medium}
            color={'#2C6587'}>
            {STRING.Photosofpastwork}
          </Text>
          {userProfile?.past_work_photos?.length > 0 &&
            <FlatList
              data={userProfile?.past_work_photos ?? []}
              horizontal
              keyExtractor={(item: any, index: number) => index.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity onPress={() => {
                    props.navigation.navigate(SCREENS.WebViewScreen.identifier, {
                      url: item,
                    })
                  }}>
                    <Image
                      style={[styles(theme).photosView]}
                      resizeMode='cover'
                      source={{ uri: item }}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          }
          {userProfile?.past_work_videos?.length > 0 &&
            <FlatList
              data={userProfile?.past_work_videos ?? []}
              horizontal
              keyExtractor={(item: any, index: number) => index.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => {
                return (
                  <Image
                    style={[styles(theme).photosView]}
                    source={{ uri: item }}
                  />
                );
              }}
            />
          }
        </View>
        <View style={styles(theme).informationContainer}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.Medium}
            color={'#2C6587'}>
            {STRING.CustomerRatings}
          </Text>
          <View
            style={[
              styles(theme).horizontalContainer,
              { marginTop: getScaleSize(20) },
            ]}>
            <Text
              size={getScaleSize(24)}
              font={FONTS.Lato.SemiBold}
              color={theme._323232}>
              {userProfile?.overall_ratings ?? '0.0'}
            </Text>
            <View
              style={{
                marginLeft: getScaleSize(16),
                alignSelf: 'center',
              }}>
              <View style={styles(theme).rowView}>
                {[...Array(5)].map((_, i) => {
                  const filled = i < Math.round(overallRating);

                  return (
                    <Image
                      key={i}
                      source={filled ? IMAGES.star : IMAGES.ic_star_blank}
                      style={styles(theme).ratingimage}
                    />
                  );
                })}
              </View>
              <Text
                size={getScaleSize(12)}
                style={{ marginTop: getScaleSize(3) }}
                font={FONTS.Lato.Medium}
                color={theme._323232}>
                {`Based on ${userProfile?.total_ratings ?? '0'} ratings`}
              </Text>
            </View>
          </View>
          <View style={{ marginTop: getScaleSize(15) }}>
            <RattingControler
              title={'Work quality'}
              value={ratings?.work_quality ?? '0.0'}
              fillCount={ratings?.work_quality ?? 0}
              totalCount={5}
            />
          </View>
          <View style={{ marginTop: getScaleSize(15) }}>
            <RattingControler
              title={'Reliability'}
              value={ratings?.reliability ?? '0.0'}
              fillCount={ratings?.reliability ?? 0}
              totalCount={5}
            />
          </View>
          <View style={{ marginTop: getScaleSize(15) }}>
            <RattingControler
              title={'Punctunality'}
              value={ratings?.punctuality ?? '0.0'}
              fillCount={ratings?.punctuality ?? 0}
              totalCount={5}
            />
          </View>
          <View style={{ marginTop: getScaleSize(15) }}>
            <RattingControler
              title={'Soluction'}
              value={ratings?.solution ?? '0.0'}
              fillCount={ratings?.solution ?? 0}
              totalCount={5}
            />
          </View>
          <View style={{ marginTop: getScaleSize(15) }}>
            <RattingControler
              title={'Payout'}
              value={ratings?.payout ?? '0.0'}
              fillCount={ratings?.payout ?? 0}
              totalCount={5}
            />
          </View>
        </View>
        {userProfile?.recent_works_and_reviews?.length > 0 &&
          <View style={styles(theme).informationContainer}>
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.Medium}
              color={'#2C6587'}>
              {STRING.RecentWorksReviews}
            </Text>
            {(userProfile?.recent_works_and_reviews ?? []).map((item: any, index: number) => {
              return (
                <RatingsReviewsItem
                  item={item}
                  key={index}
                  itemContainer={{ marginTop: index === 0 ? getScaleSize(20) : getScaleSize(16) }}
                  onPressShowMore={() => {
                    setShowMore(!showMore);
                  }}
                  showMore={showMore}
                />
              );
            })}
          </View>
        }
        <View style={{ height: getScaleSize(32) }} />
      </ScrollView>
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.white },
    scrolledContainer: {
      marginTop: getScaleSize(19),
      marginHorizontal: getScaleSize(24),
    },
    informationContainer: {
      marginTop: getScaleSize(20),
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(24),
      paddingVertical: getScaleSize(24),
    },
    profilePic: {
      height: getScaleSize(130),
      width: getScaleSize(130),
      borderRadius: getScaleSize(65),
      alignSelf: 'center',
    },
    horizontalContainer: {
      flexDirection: 'row',
    },
    itemContainer: {
      flex: 1.0,
      paddingVertical: getScaleSize(12),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(6),
      marginTop: getScaleSize(20),
    },
    photosView: {
      height: getScaleSize(144),
      width: (Dimensions.get('window').width - getScaleSize(108)) / 2,
      borderRadius: 8,
      resizeMode: 'cover',
      marginTop: getScaleSize(18),
      marginRight: getScaleSize(10)
    },
    ratingimage: {
      resizeMode: 'cover',
      width: getScaleSize(20),
      height: getScaleSize(20),
      marginLeft: getScaleSize(2),
    },
    rowView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
