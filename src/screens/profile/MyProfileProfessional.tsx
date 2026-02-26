import React, { useContext, useState } from 'react';
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
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { getScaleSize, useString } from '../../constant';

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
import { Rating } from 'react-native-ratings';

export default function MyProfileProfessional(props: any) {

  const STRING = useString();

  const { theme } = useContext<any>(ThemeContext);
  const { profile } = useContext(AuthContext)

  const [showMore, setShowMore] = useState(false);
  const [showMoreExperience, setShowMoreExperience] = useState(false);

  return (
    <View style={styles(theme).container}>
      <Header
        icon={IMAGES.ic_edit}
        onPress={() => {
          props.navigation.navigate(SCREENS.EditProfile.identifier);
        }}
        onBack={() => {
          props.navigation.goBack();
        }}
        screenName={STRING.my_profile}
      />
      <ScrollView
        style={styles(theme).scrolledContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles(theme).informationContainer}>
          {profile?.user?.profile_photo_url ?
            <Image
              style={styles(theme).profilePic}
              source={{ uri: profile?.user?.profile_photo_url }}
            />
            :
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
          }
          <Text
            size={getScaleSize(22)}
            font={FONTS.Lato.SemiBold}
            color={theme._2B2B2B}
            style={{ alignSelf: 'center' }}>
            {`${profile?.user?.first_name + " " + profile?.user?.last_name}`}
          </Text>
          <View style={styles(theme).horizontalContainer}>
            <View style={styles(theme).itemContainer}>
              <View>
                <Text
                  size={getScaleSize(16)}
                  font={FONTS.Lato.Bold}
                  color={'#1D7885'}
                  style={{ alignSelf: 'center' }}>
                  {profile?.customer_ratings?.average_rating ?? '0.0'}
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
                {profile?.provider_info?.is_verified && (
                  <Image
                    style={{
                      height: getScaleSize(24),
                      width: getScaleSize(24),
                      alignSelf: 'center',
                    }}
                    source={IMAGES.verify}
                  />
                )}
                <Text
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={'#214C65'}
                  align='center'
                  style={{ marginTop: getScaleSize(4) }}>
                  {profile?.provider_info?.is_certified === true ? STRING.Certified : 'Not\ncertified'}
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
                  {profile?.unique_clients_count ?? '0'}
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
            {STRING.about_me}
          </Text>
          <Text
            size={getScaleSize(14)}
            font={FONTS.Lato.Medium}
            style={{ marginTop: getScaleSize(8) }}
            color={theme._323232}>
            {profile?.provider_info?.bio ?? '-'}
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
            numberOfLines={showMoreExperience ? undefined : 3}
            style={{ marginTop: getScaleSize(8) }}
            color={theme._323232}>
            {profile?.provider_info?.experience_speciality ?? '-'}
          </Text>
          {profile?.provider_info?.experience_speciality?.length > 100 &&
            <TouchableOpacity style={{ marginTop: getScaleSize(8) }}
              onPress={() => setShowMoreExperience(!showMoreExperience)}>
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
            style={{ marginTop: getScaleSize(8) }}
            color={theme._323232}>
            {profile?.provider_info?.achievements ?? '-'}
          </Text>
        </View>
        <View style={styles(theme).informationContainer}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.Medium}
            color={'#2C6587'}>
            {STRING.Photosofpastwork}
          </Text>
          <FlatList
            data={profile?.past_work_files ?? []}
            horizontal
            keyExtractor={(item: any, index: number) => index.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: getScaleSize(12) }}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    props.navigation.navigate(SCREENS.WebViewScreen.identifier, { url: item });
                  }}>
                  <Image
                    style={[styles(theme).photosView]}
                    resizeMode="cover"
                    source={{ uri: item }}
                  />
                </TouchableOpacity>
              );
            }}
          />
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
              {profile?.customer_ratings?.average_rating ?? '0.0'}
            </Text>
            <View
              style={{
                marginLeft: getScaleSize(16),
                alignSelf: 'center',
              }}>
              <View style={styles(theme).rowView}>
                <Rating
                  type="custom"
                  ratingBackgroundColor="#EDEFF0"
                  tintColor="#fff" // background color, useful for layout
                  ratingCount={5}
                  ratingColor={'#F0B52C'} // grey color
                  startingValue={profile?.customer_ratings?.average_rating ?? 0}
                  imageSize={18}
                  readonly
                />
              </View>
              <Text
                size={getScaleSize(12)}
                style={{ marginTop: getScaleSize(3) }}
                font={FONTS.Lato.Medium}
                color={theme._323232}>
                {`Based on ${profile?.customer_ratings?.total_ratings ?? 0} ratings`}
              </Text>
            </View>
          </View>
          <View style={{ marginTop: getScaleSize(15) }}>
            <RattingControler
              title={'Work quality'}
              value={profile?.customer_ratings?.criteria_averages?.work_quality ?? '0.0'}
              fillCount={profile?.customer_ratings?.criteria_averages?.work_quality ?? 0}
              totalCount={5}
            />
          </View>
          <View style={{ marginTop: getScaleSize(15) }}>
            <RattingControler
              title={'Reliability'}
              value={profile?.customer_ratings?.criteria_averages?.reliability ?? '0.0'}
              fillCount={profile?.customer_ratings?.criteria_averages?.reliability ?? 0}
              totalCount={5}
            />
          </View>
          <View style={{ marginTop: getScaleSize(15) }}>
            <RattingControler
              title={'Punctunality'}
              value={profile?.customer_ratings?.criteria_averages?.punctuality ?? '0.0'}
              fillCount={profile?.customer_ratings?.criteria_averages?.punctuality ?? 0}
              totalCount={5}
            />
          </View>
          <View style={{ marginTop: getScaleSize(15) }}>
            <RattingControler
              title={'Soluction'}
              value={profile?.customer_ratings?.criteria_averages?.solution ?? '0.0'}
              fillCount={profile?.customer_ratings?.criteria_averages?.solution ?? 0}
              totalCount={5}
            />
          </View>
          <View style={{ marginTop: getScaleSize(15) }}>
            <RattingControler
              title={'Payout'}
              value={profile?.customer_ratings?.criteria_averages?.payout ?? '0.0'}
              fillCount={profile?.customer_ratings?.criteria_averages?.payout ?? 0}
              totalCount={5}
            />
          </View>
        </View>
        {profile?.recent_reviews?.length > 0 &&
          <View style={styles(theme).informationContainer}>
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.Medium}
              color={'#2C6587'}>
              {STRING.RecentWorksReviews}
            </Text>
            {profile?.recent_reviews?.map((item: any, index: number) => {
              return (
                <RatingsReviewsItem
                  key={index}
                  item={item}
                  isFromProfessionalProfile={true}
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
      borderRadius: getScaleSize(130),
      alignSelf: 'center',
      borderWidth: 1,
      borderColor: theme._F0EFF0,
    },
    EmptyProfileContainer: {
      width: getScaleSize(130),
      height: getScaleSize(130),
      backgroundColor: theme._F0EFF0,
      borderRadius: getScaleSize(130),
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
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
    },
    ratingimage: {
      resizeMode: 'contain',
      width: getScaleSize(20),
      height: getScaleSize(20),
      marginLeft: getScaleSize(2),
    },
    rowView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
