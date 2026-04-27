import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Dimensions,
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
import { arrayIcons, getScaleSize, SHOW_TOAST, useString } from '../../constant';

//COMPONENT
import { Header, ProgressView, StatusItem, Text } from '../../components';

//PACKAGES
import { useFocusEffect } from '@react-navigation/native';
import { SCREENS } from '..';
import { API } from '../../api';
import moment from 'moment';
import Video from 'react-native-video';
import { buildThreadId } from '../../services/chat';
import { Rating } from 'react-native-ratings';

export default function ProfessionalTaskDetails(props: any) {
  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  const item = props?.route?.params?.item ?? {};
  const serviceId = props?.route?.params?.serviceId ?? '';
  const { profile } = useContext<any>(AuthContext);
  const [isStatus, setIsStatus] = useState(false);
  const [visibleTaskDetails, setVisibleTaskDetails] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [taskDetails, setTaskDetails] = useState<any>({});
  const [attachments, setAttachments] = useState<any>([]);

  useEffect(() => {
    if (item) {
      getServiceDetails();
    }
  }, []);

  // function getItemUrl() {
  //   if (item?.quote_status === 'send') {
  //     return '/quotes'
  //   } else if (item?.quote_status === 'accepted') {
  //     return '/accepted'
  //   } else if (item?.quote_status === 'completed') {
  //     return '/completed'
  //   }
  // }

  async function getServiceDetails() {
    try {
      setLoading(true);
      let url = ''
      if (item?.quote_status === 'complete') {
        url = API.API_ROUTES.getCompletedTaskDetails + `/${serviceId ? serviceId : item?.service_request_id}/completed-task-details`;
      } else {
        url = API.API_ROUTES.getTsakDetails + `/quotes/${serviceId ? serviceId : item?.service_request_id}`
      }
      const result = await API.Instance.get(url);
      if (result.status) {
        setTaskDetails(result?.data?.data ?? {});
        setAttachments(normalizeAttachments(result?.data?.data?.task));
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

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(theme.white);
        StatusBar.setBarStyle('dark-content');
      }
    }, []),
  );

  const normalizeAttachments = (data: any) => {
    const photos = (data?.supporting_photos || []).map((url: any) => ({
      id: url,
      type: 'photo',
      url,
    }));

    const videos = (data?.supporting_videos || []).map((url: any) => ({
      id: url,
      type: 'video',
      url,
    }));

    return [...photos, ...videos];
  };

  const AttachmentItem = ({ item }: any) => {
    switch (item.type) {
      case 'photo':
        return (
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate(SCREENS.WebViewScreen.identifier, {
                url: item?.url ?? '',
              });
            }}>
            <Image
              style={[styles(theme).photosView]}
              source={{ uri: item?.url ?? '' }}
            />
          </TouchableOpacity>
        );

      case 'video':
        return (
          <View style={styles(theme).photosView}>
            <Video
              source={{ uri: item.url }}
              resizeMode="cover"
              pointerEvents="none"
              controls
              paused={false}
              fullscreen={false}
              playInBackground={false}
              playWhenInactive={false}
              style={{ width: '100%', height: '100%' }}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles(theme).container}>
      <Header
        onBack={() => {
          props.navigation.goBack();
        }}
        screenName={STRING.TaskDetails}
      />
      <ScrollView
        style={styles(theme).scrolledContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles(theme).imageContainer}>
          {taskDetails?.task?.subcategory?.icon ? (
            <Image
              style={styles(theme).imageView}
              source={{ uri: taskDetails?.task?.subcategory?.icon }}
            />
          ) : (
            <View
              style={[
                styles(theme).imageView,
                { backgroundColor: theme._D5D5D5 },
              ]}
            />
          )}
          <Text
            style={{
              marginVertical: getScaleSize(12),
              marginLeft: getScaleSize(4),
            }}
            size={getScaleSize(24)}
            font={FONTS.Lato.Bold}
            color={theme.primary}>
            {taskDetails?.task?.subcategory?.name ?? ''}
          </Text>
          <View style={styles(theme).informationView}>
            <View style={styles(theme).horizontalView}>
              <View style={styles(theme).itemView}>
                <Image
                  style={styles(theme).informationIcon}
                  source={IMAGES.calender}
                />
                <Text
                  style={{
                    marginHorizontal: getScaleSize(8),
                    alignSelf: 'center',
                  }}
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={theme.primary}>
                  {taskDetails?.task?.chosen_date_time
                    ? moment
                      .utc(taskDetails?.task?.chosen_date_time)
                      .local()
                      .format('DD MMM, YYYY')
                    : '-'}
                </Text>
              </View>
              <View style={styles(theme).itemView}>
                <Image
                  style={styles(theme).informationIcon}
                  source={IMAGES.clock}
                />
                <Text
                  style={{
                    marginHorizontal: getScaleSize(8),
                    alignSelf: 'center',
                  }}
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={theme.primary}>
                  {taskDetails?.task?.chosen_date_time
                    ? moment
                      .utc(taskDetails?.task?.chosen_date_time)
                      .local()
                      .format('hh:mm A')
                    : '-'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles(theme).horizontalView,
                { marginTop: getScaleSize(12) },
              ]}>
              <View style={styles(theme).itemView}>
                {taskDetails?.task?.category?.icon ? (
                  <Image
                    style={[
                      styles(theme).informationIcon,
                      { tintColor: theme._1A3D51 },
                    ]}
                    source={
                      {uri: taskDetails?.task?.category?.icon}
                    }
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles(theme).informationIcon]} />
                )}
                <Text
                  style={{
                    marginHorizontal: getScaleSize(8),
                    alignSelf: 'center',
                  }}
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={theme.primary}>
                  {taskDetails?.task?.category?.name ?? ''}
                </Text>
              </View>
              <View style={styles(theme).itemView}>
                <Image
                  style={styles(theme).informationIcon}
                  source={IMAGES.pin}
                />
                <Text
                  style={{
                    marginHorizontal: getScaleSize(8),
                    alignSelf: 'center',
                  }}
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  numberOfLines={4}
                  color={theme.primary}>
                  {taskDetails?.task?.address ?? '-'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {item?.quote_status === 'accepted' && (
          <View style={styles(theme).amountContainer}>
            <Text
              style={{ flex: 1.0 }}
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={theme._323232}>
              {STRING.FinalizedQuoteAmount}
            </Text>
            <Text
              style={{ flex: 1.0, marginTop: getScaleSize(8) }}
              size={getScaleSize(27)}
              font={FONTS.Lato.Bold}
              color={theme._323232}>
              {`€${taskDetails?.quote?.amount ?? 0}`}
            </Text>
          </View>
        )}
        {item?.quote_status === 'accepted' && (
          <View style={styles(theme).amountContainer}>
            <Text
              style={{ flex: 1.0 }}
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={theme._323232}>
              {STRING.SecurityCode}
            </Text>
            {/* <FlatList
              data={taskDetails?.task?.displayed_service_code?.split('') ?? []}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => {
                return (
                  <View
                    style={[
                      styles(theme).securityItemContainer,
                      { marginLeft: index === 0 ? 0 : 6 },
                    ]}>
                    <Text
                      style={{ flex: 1.0 }}
                      size={getScaleSize(18)}
                      font={FONTS.Lato.Medium}
                      color={theme._323232}>
                      {item}
                    </Text>
                  </View>
                );
              }}
            /> */}
            <View style={styles(theme).codeViewDirection}>
              {taskDetails?.task?.displayed_service_code
                ?.toString()
                ?.split('')
                ?.map((digit: string, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles(theme).securityItemContainer,
                      { marginLeft: index === 0 ? 0 : 3 },
                    ]}>
                    <Text
                      size={getScaleSize(18)}
                      font={FONTS.Lato.Medium}
                      color={theme._323232}>
                      {digit}
                    </Text>
                  </View>
                ))}
            </View>
            <Text
              style={{ flex: 1.0, marginTop: getScaleSize(12) }}
              size={getScaleSize(11)}
              font={FONTS.Lato.Regular}
              color={'#424242'}>
              {STRING.security_note}
            </Text>
          </View>
        )}
        <View style={styles(theme).profileContainer}>
          <View style={styles(theme).horizontalView}>
            <Text
              style={{ flex: 1.0 }}
              size={getScaleSize(18)}
              font={FONTS.Lato.SemiBold}
              color={theme._323232}>
              {STRING.Aboutclient}
            </Text>
          </View>
          <View
            style={[
              styles(theme).horizontalView,
              { marginTop: getScaleSize(16) },
            ]}>
            {taskDetails?.elderly_user?.profile_photo_url ? (
              <Image
                style={[
                  styles(theme).profilePicView,
                  { backgroundColor: theme._D5D5D5 },
                ]}
                source={{ uri: taskDetails?.elderly_user?.profile_photo_url }}
              />
            ) : (
              <Image
                style={styles(theme).profilePicView}
                source={IMAGES.user_placeholder}
              />
            )}
            <View style={{ flex: 1.0 }}>
              <Text
                style={{ marginLeft: getScaleSize(16) }}
                size={getScaleSize(20)}
                font={FONTS.Lato.SemiBold}
                color={'#0F232F'}>
                {`${taskDetails?.elderly_user?.first_name ?? ''} ${taskDetails?.elderly_user?.last_name ?? ''
                  }`}
              </Text>
              <Text
                style={{ marginLeft: getScaleSize(16) }}
                size={getScaleSize(12)}
                font={FONTS.Lato.Medium}
                color={'#595959'}>
                {`${taskDetails?.elderly_user?.phone_country_code ?? ''}${taskDetails?.elderly_user?.phone_number ?? ''
                  }`}
              </Text>
            </View>
            {item?.task_status !== 'completed' && (
              <TouchableOpacity
                activeOpacity={1}
                style={[
                  styles(theme).newButton,
                  { marginRight: getScaleSize(6) },
                ]}
                onPress={() => {
                  const conversationId = buildThreadId(
                    taskDetails?.elderly_user?.id,
                    profile?.user?.id,
                  );
                  props.navigation.navigate(SCREENS.ChatDetails.identifier, {
                    conversationId: conversationId,
                    peerUser: {
                      user_id: taskDetails?.elderly_user?.id,
                      name: taskDetails?.elderly_user?.first_name,
                      email: taskDetails?.elderly_user?.email,
                      avatarUrl: taskDetails?.elderly_user?.profile_photo_url,
                    },
                  });
                }}>
                <Text
                  size={getScaleSize(14)}
                  font={FONTS.Lato.Medium}
                  color={theme.white}>
                  {STRING.Chat}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {item?.quote_status === 'accepted' && (
          <View style={styles(theme).profileContainer}>
            <Text
              style={{ flex: 1.0 }}
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={theme._323232}>
              {STRING.address}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: getScaleSize(12) }}>
              <Image
                style={{ height: getScaleSize(24), width: getScaleSize(24) }}
                source={IMAGES.map_pin}
              />
              <Text
                style={{ flex: 1.0, marginLeft: getScaleSize(4) }}
                size={getScaleSize(14)}
                font={FONTS.Lato.SemiBold}
                color={'#595959'}>
                {taskDetails?.task?.address ?? '-'}
              </Text>
            </View>
          </View>
        )}
        <View
          style={[
            styles(theme).profileContainer,
            { paddingVertical: getScaleSize(26) },
          ]}>
          <TouchableOpacity
            style={{ flexDirection: 'row' }}
            activeOpacity={1}
            onPress={() => {
              setIsStatus(!isStatus);
            }}>
            <Text
              style={{ flex: 1.0 }}
              size={getScaleSize(18)}
              font={FONTS.Lato.Medium}
              color={theme._323232}>
              {STRING.CheckStatus}
            </Text>
            <TouchableOpacity
              style={{ height: getScaleSize(25), width: getScaleSize(24) }}
              activeOpacity={1}
              onPress={() => {
                setIsStatus(!isStatus);
              }}>
              <Image
                style={{ height: getScaleSize(25), width: getScaleSize(24) }}
                source={isStatus ? IMAGES.up : IMAGES.down}
              />
            </TouchableOpacity>
          </TouchableOpacity>
          {isStatus && (
            <>
              {taskDetails?.task_lifecycle?.length > 0 && (
                <>
                  <View style={styles(theme).devider}></View>
                  <View style={{ marginTop: getScaleSize(32) }}>
                    {taskDetails?.task_lifecycle?.map(
                      (item: any, index: number) => (
                        <StatusItem
                          key={index}
                          item={item}
                          index={index}
                          isLast={
                            index === taskDetails?.task_lifecycle?.length - 1
                          }
                        />
                      ),
                    )}
                  </View>
                </>
              )}
            </>
          )}
        </View>
        <View
          style={[
            styles(theme).profileContainer,
            { paddingVertical: getScaleSize(26) },
          ]}>
          <TouchableOpacity
            style={{ flexDirection: 'row' }}
            activeOpacity={1}
            onPress={() => {
              setVisibleTaskDetails(!visibleTaskDetails);
            }}>
            <Text
              style={{ flex: 1.0 }}
              size={getScaleSize(18)}
              font={FONTS.Lato.SemiBold}
              color={theme._323232}>
              {STRING.TaskDetails}
            </Text>
            <TouchableOpacity
              style={{ height: getScaleSize(25), width: getScaleSize(24) }}
              activeOpacity={1}
              onPress={() => {
                setVisibleTaskDetails(!visibleTaskDetails);
              }}>
              <Image
                style={{ height: getScaleSize(25), width: getScaleSize(24) }}
                source={visibleTaskDetails ? IMAGES.up : IMAGES.down}
              />
            </TouchableOpacity>
          </TouchableOpacity>
          {visibleTaskDetails && (
            <>
              <View style={styles(theme).devider}></View>
              <Text
                style={{ flex: 1.0, marginTop: getScaleSize(20) }}
                size={getScaleSize(18)}
                font={FONTS.Lato.SemiBold}
                color={'#424242'}>
                {STRING.Servicedescription}
              </Text>
              <Text
                style={{ flex: 1.0, marginTop: getScaleSize(16) }}
                size={getScaleSize(14)}
                font={FONTS.Lato.Medium}
                color={theme._939393}>
                {taskDetails?.task?.description ?? '-'}
              </Text>
              <Text
                style={{ flex: 1.0, marginVertical: getScaleSize(20) }}
                size={getScaleSize(18)}
                font={FONTS.Lato.SemiBold}
                color={'#424242'}>
                {STRING.Jobphotos}
              </Text>
              <FlatList
                data={attachments ?? []}
                numColumns={2}
                columnWrapperStyle={{ gap: getScaleSize(12) }}
                contentContainerStyle={{ gap: getScaleSize(12) }}
                keyExtractor={(item: any, index: number) => index.toString()}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => <AttachmentItem item={item} />}
              />
            </>
          )}
        </View>
        {item?.quote_status === 'accepted' && (
          <View style={styles(theme).informationContainer}>
            <Text
              size={getScaleSize(18)}
              font={FONTS.Lato.SemiBold}
              color={theme._323232}>
              {STRING.FinalPaymentBreakdown}
            </Text>
            <View style={styles(theme).newHorizontalView}>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(14)}
                font={FONTS.Lato.SemiBold}
                color={'#595959'}>
                {STRING.FinalizedQuoteAmount}
              </Text>
              <Text
                size={getScaleSize(14)}
                font={FONTS.Lato.SemiBold}
                color={'#595959'}>
                {`€${taskDetails?.quote?.amount ?? 0}`}
              </Text>
            </View>
            <View style={styles(theme).newHorizontalView}>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(14)}
                font={FONTS.Lato.SemiBold}
                color={'#595959'}>
                {STRING.PlatformFee}
              </Text>
              <Text
                size={getScaleSize(14)}
                font={FONTS.Lato.SemiBold}
                color={'#595959'}>
                {`€${taskDetails?.quote?.platform_fee ?? 0}`}
              </Text>
            </View>
            <View style={styles(theme).newHorizontalView}>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(14)}
                font={FONTS.Lato.SemiBold}
                color={'#595959'}>
                {STRING.Taxes}
              </Text>
              <Text
                size={getScaleSize(14)}
                font={FONTS.Lato.SemiBold}
                color={'#595959'}>
                {`€${taskDetails?.quote?.Tax ?? 0}`}
              </Text>
            </View>
            <View style={styles(theme).dotView} />
            <View style={styles(theme).newHorizontalView}>
              <Text
                style={{ flex: 1.0 }}
                size={getScaleSize(20)}
                font={FONTS.Lato.SemiBold}
                color={'#0F232F'}>
                {STRING.Total}
              </Text>
              <Text
                size={getScaleSize(20)}
                font={FONTS.Lato.SemiBold}
                color={theme.primary}>
                {`€${taskDetails?.quote?.total ?? 0}`}
              </Text>
            </View>
          </View>
        )}
        {item?.quote_status === 'complete' && (
          <>
            {taskDetails?.ratings_and_review && (
              <View style={styles(theme).ratingContainer}>
                <View style={{ flexDirection: 'row' }}>
                  {taskDetails?.ratings_and_review?.given_by?.profile_photo_url ? (
                    <Image
                      style={[
                        styles(theme).reviewImageView,
                        { backgroundColor: theme._D5D5D5 },
                      ]}
                      source={{ uri: taskDetails?.ratings_and_review?.given_by?.profile_photo_url }}
                    />
                  ) : (
                    <Image
                      style={styles(theme).reviewImageView}
                      source={IMAGES.user_placeholder}
                    />
                  )}
                  <View style={{ flex: 1.0 }}>
                    <Text
                      style={{ marginLeft: getScaleSize(16) }}
                      size={getScaleSize(15)}
                      font={FONTS.Lato.Medium}
                      color={theme._131313}>
                      {`${taskDetails?.ratings_and_review?.given_by?.full_name ?? ''}`}
                    </Text>
                    <Text
                      style={{ marginLeft: getScaleSize(11) }}
                      size={getScaleSize(12)}
                      font={FONTS.Lato.Regular}
                      color={theme._707D85}>
                      {moment(taskDetails?.ratings_and_review?.created_at).fromNow()}
                    </Text>
                  </View>
                  <Rating
                    type="custom"
                    ratingBackgroundColor="#EDEFF0"
                    tintColor="#fff" // background color, useful for layout
                    ratingCount={5}
                    ratingColor={'#F0B52C'} // grey color
                    startingValue={taskDetails?.ratings_and_review?.rating ?? 0}
                    imageSize={15}
                    readonly
                  />
                </View>
                <View style={{ marginTop: getScaleSize(16) }}>
                  <Text
                    size={getScaleSize(14)}
                    font={FONTS.Lato.Medium}
                    color={theme._787878}>
                    {taskDetails?.ratings_and_review?.review ?? ''}
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
        {item?.quote_status === 'complete' && (
          <>
            <View style={styles(theme).informationContainer}>
              <Text
                size={getScaleSize(18)}
                font={FONTS.Lato.SemiBold}
                color={theme._323232}>
                {STRING.FinalPaymentBreakdown}
              </Text>
              <View style={styles(theme).newHorizontalView}>
                <Text
                  style={{ flex: 1.0 }}
                  size={getScaleSize(14)}
                  font={FONTS.Lato.SemiBold}
                  color={'#595959'}>
                  {STRING.FinalizedQuoteAmount}
                </Text>
                <Text
                  size={getScaleSize(14)}
                  font={FONTS.Lato.SemiBold}
                  color={'#595959'}>
                  {`€${taskDetails?.payment_breakdown?.base_amount ?? 0}`}
                </Text>
              </View>
              <View style={styles(theme).newHorizontalView}>
                <Text
                  style={{ flex: 1.0 }}
                  size={getScaleSize(14)}
                  font={FONTS.Lato.SemiBold}
                  color={'#595959'}>
                  {STRING.PlatformFee}
                </Text>
                <Text
                  size={getScaleSize(14)}
                  font={FONTS.Lato.SemiBold}
                  color={'#595959'}>
                  {`€${taskDetails?.payment_breakdown?.platform_fee ?? 0}`}
                </Text>
              </View>
              <View style={styles(theme).newHorizontalView}>
                <Text
                  style={{ flex: 1.0 }}
                  size={getScaleSize(14)}
                  font={FONTS.Lato.SemiBold}
                  color={'#595959'}>
                  {STRING.Taxes}
                </Text>
                <Text
                  size={getScaleSize(14)}
                  font={FONTS.Lato.SemiBold}
                  color={'#595959'}>
                  {`€${taskDetails?.payment_breakdown?.taxes ?? 0}`}
                </Text>
              </View>
              <View style={styles(theme).dotView} />
              <View style={styles(theme).newHorizontalView}>
                <Text
                  style={{ flex: 1.0 }}
                  size={getScaleSize(20)}
                  font={FONTS.Lato.SemiBold}
                  color={'#0F232F'}>
                  {STRING.Total}
                </Text>
                <Text
                  size={getScaleSize(20)}
                  font={FONTS.Lato.SemiBold}
                  color={theme.primary}>
                  {`€${taskDetails?.payment_breakdown?.total ?? 0}`}
                </Text>
              </View>
            </View>
            <View style={styles(theme).lastInformationContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: getScaleSize(10) }}>
                <Image source={IMAGES.ic_warning} style={styles(theme).infoIcon} />
                <Text
                  size={getScaleSize(18)}
                  font={FONTS.Lato.SemiBold}
                  color={theme._323232}>
                  {STRING.information_message}
                </Text>
              </View>
              <Text
                size={getScaleSize(12)}
                font={FONTS.Lato.Regular}
                color={theme._323232}>
                {STRING.information_message_text}
              </Text>
            </View>
          </>
        )}
        <View style={{ height: getScaleSize(40) }} />
      </ScrollView>
      {isLoading && <ProgressView />}
    </View >
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.white },
    scrolledContainer: {
      marginTop: getScaleSize(19),
      marginHorizontal: getScaleSize(24),
    },
    imageContainer: {
      paddingVertical: getScaleSize(12),
      paddingHorizontal: getScaleSize(12),
      borderRadius: getScaleSize(20),
      backgroundColor: '#EAF0F3',
    },
    imageView: {
      height: getScaleSize(172),
      borderRadius: getScaleSize(20),
      flex: 1.0,
    },
    informationView: {
      paddingVertical: getScaleSize(16),
      backgroundColor: theme.white,
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(16),
    },
    horizontalView: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    itemView: {
      flexDirection: 'row',
      flex: 1.0,
    },
    informationIcon: {
      height: getScaleSize(25),
      width: getScaleSize(25),
      alignSelf: 'center',
    },
    amountContainer: {
      marginTop: getScaleSize(32),
      paddingVertical: getScaleSize(9),
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(16),
    },
    profileContainer: {
      borderColor: theme._D5D5D5,
      paddingVertical: getScaleSize(13),
      paddingHorizontal: getScaleSize(16),
      borderWidth: 1,
      borderRadius: getScaleSize(16),
      marginTop: getScaleSize(24),
    },
    profilePicView: {
      height: getScaleSize(56),
      width: getScaleSize(56),
      borderRadius: getScaleSize(28),
    },
    newButton: {
      backgroundColor: theme.primary,
      borderRadius: getScaleSize(8),
      paddingHorizontal: getScaleSize(28),
      paddingVertical: getScaleSize(10),
    },

    photosView: {
      height: getScaleSize(144),
      width: (Dimensions.get('window').width - getScaleSize(96)) / 2,
      borderRadius: getScaleSize(8),
      overflow: 'hidden',
      backgroundColor: theme._EAF0F3,
    },

    securityItemContainer: {
      paddingVertical: getScaleSize(5),
      paddingHorizontal: getScaleSize(11.11),
      borderRadius: getScaleSize(12),
      borderColor: '#D5D5D5',
      borderWidth: 1,
      marginTop: getScaleSize(16),
    },
    devider: {
      backgroundColor: '#E6E6E6',
      height: 1,
      marginTop: getScaleSize(18),
    },
    dotView: {
      // flex:1.0,
      borderStyle: 'dashed',
      borderColor: theme.primary,
      borderWidth: 1,
      marginTop: getScaleSize(8),
    },
    informationContainer: {
      marginTop: getScaleSize(24),
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(24),
      paddingVertical: getScaleSize(24),
    },
    newHorizontalView: {
      flexDirection: 'row',
      marginTop: getScaleSize(8),
    },
    codeViewDirection: {
      flexDirection: 'row',
      marginTop: getScaleSize(16),
    },
    lastInformationContainer: {
      marginTop: getScaleSize(24),
      marginBottom: getScaleSize(30),
    },
    infoIcon: {
      width: getScaleSize(20),
      height: getScaleSize(20),
      marginRight: getScaleSize(8),
    },
    ratingContainer: {
      marginTop: getScaleSize(24),
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(24),
      paddingVertical: getScaleSize(24),
    },
    reviewImageView: {
      height: getScaleSize(40),
      width: getScaleSize(40),
      borderRadius: getScaleSize(40),
    },
  });
