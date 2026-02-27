import React, {useContext, useEffect, useMemo, useState} from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  SafeAreaView,
} from 'react-native';

//ASSETS
import {FONTS, IMAGES} from '../../assets';

//CONTEXT
import {ThemeContext, ThemeContextType, AuthContext} from '../../context';

//CONSTANT
import {getScaleSize, SHOW_TOAST, useString} from '../../constant';

//COMPONENT
import {Text} from '../../components';

//PACKAGES
import {useFocusEffect} from '@react-navigation/native';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {
  messagesListThread,
  userNegotiationMessage,
} from '../../services/negotiationchat';

export default function NegotiationDetails(props: any) {
  const STRING = useString();
  const {theme} = useContext<any>(ThemeContext);
  const {profile} = useContext<any>(AuthContext);
  const peerUser = props?.route?.params?.peerUser;
  // const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  // const [isSending, setIsSending] = useState(false);
  const [editingForMessageId, setEditingForMessageId] = useState<
    boolean | null
  >(false);
  const [offerInputValue, setOfferInputValue] = useState('');

  const [commanId, setCommanId] = useState<string | ''>(
    props?.route?.params?.conversationId || '',
  );

  const peerUserId = peerUser?.user_id;
  const peerUserName = peerUser?.name;
  const peerUserAvatar = peerUser?.avatarUrl;
  const messageListContentStyle = useMemo<StyleProp<ViewStyle>>(
    () => ({
      paddingVertical: getScaleSize(12),
      flexGrow: 1,
      justifyContent: 'flex-end',
    }),
    [],
  );

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(theme.white);
        StatusBar.setBarStyle('dark-content');
      }
    }, [theme.white]),
  );

  useEffect(() => {
    // chat found, so we need to get the messages
    setCommanId(props.route.params.conversationId);
    const unsubscribe = messagesListThread(
      props.route.params.conversationId,
    ).onSnapshot(querySnapshot => {
      const formattedMessages = querySnapshot.docs.map((doc: any) => {
        return {
          _id: doc.id,
          text: '',
          createdAt: new Date().getTime(),
          ...doc.data(),
        };
      });
      setLoadingMessages(false);
      setMessages(formattedMessages.reverse());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // const handleSendMessage = () => {
  //   if (!message.trim()) {
  //     SHOW_TOAST('Please enter a message', 'error');
  //     return;
  //   }
  //   setIsSending(true);

  //   if (!profile?.user?.id || !commanId) {
  //     throw new Error('Chat not initialized');
  //   }
  //   userNegotiationMessage(
  //     '',
  //     '',
  //     '',
  //     profile?.user?.id,
  //     profile?.user?.first_name || 'User',
  //     peerUserId,
  //     peerUserName,
  //     commanId,
  //     {
  //       type: 'TEXT',
  //       text: message,
  //     },
  //     profile?.user?.profile_photo_url || '',
  //     peerUserAvatar,
  //   );
  //   setMessage('');
  // };

  const renderMessage = ({item}: {item: any}) => {
    switch (item.type) {
      case 'TEXT':
        const isMessageMe = item.senderId === profile?.user?.id;
        const currentUserAvatar = profile?.user?.profile_photo_url;
        return (
          <View
            style={[
              styles(theme).messageRow,
              isMessageMe
                ? styles(theme).messageRowRight
                : styles(theme).messageRowLeft,
            ]}>
            {!isMessageMe && (
              <Image
                style={styles(theme).userProfilePic}
                source={
                  peerUserAvatar
                    ? {uri: peerUserAvatar}
                    : IMAGES.user_placeholder
                }
              />
            )}
            <View
              style={[
                styles(theme).messageContainer,
                isMessageMe
                  ? styles(theme).selfBubble
                  : styles(theme).peerBubble,
              ]}>
              <Text
                size={getScaleSize(16)}
                font={FONTS.Lato.SemiBold}
                color={isMessageMe ? theme.white : theme._818285}>
                {item?.text}
              </Text>
              <Text
                size={getScaleSize(10)}
                font={FONTS.Lato.Regular}
                color={isMessageMe ? theme.white : theme._ACADAD}
                style={[styles(theme).messageTime]}>
                {formatTimestamp(item.createdAt)}
              </Text>
            </View>
            {isMessageMe && (
              <Image
                style={styles(theme).userProfilePic}
                source={
                  currentUserAvatar
                    ? {uri: currentUserAvatar}
                    : IMAGES.user_placeholder
                }
              />
            )}
          </View>
        );
      case 'NEGOTIATION':
        const isMe = item.senderId === profile?.user?.id;

        const latestNegotiationMessage = messages
          ?.filter(msg => msg.type === 'NEGOTIATION')
          ?.sort((a, b) => b.createdAt - a.createdAt)[0];
        const isLatest = latestNegotiationMessage?._id === item._id;

        return isLatest ? (
          <View
            style={
              profile?.user?.role === 'service_provider'
                ? styles(theme).quoteCardContainer
                : styles(theme).negotiationCard
            }>
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.Bold}
              color={theme._323232}>
              {item.negotiation.serviceName}
            </Text>
            {item.negotiation?.offers.map((offer: any) => {
              return (
                <View style={styles(theme).pricingRow}>
                  {offer.label === 'ORIGINAL_VALUATION' ? (
                    <Text
                      style={{flex: 1}}
                      size={getScaleSize(14)}
                      font={FONTS.Lato.Medium}
                      color={theme._6D6D6D}>
                      {'Original Valuation :'}
                    </Text>
                  ) : offer.label === 'PROVIDER_QUOTE' ? (
                    <Text
                      style={{flex: 1}}
                      size={getScaleSize(14)}
                      font={FONTS.Lato.Medium}
                      color={theme._6D6D6D}>
                      {'Initial Quote :'}
                    </Text>
                  ) : (
                    <Text
                      style={{flex: 1}}
                      size={getScaleSize(14)}
                      font={FONTS.Lato.Medium}
                      color={theme._6D6D6D}>
                      {offer.userName === profile?.user?.first_name
                        ? 'Your Previous Offer'
                        : offer.userName + ' Current Offer'}
                    </Text>
                  )}

                  <Text
                    size={getScaleSize(16)}
                    font={FONTS.Lato.Bold}
                    color={theme._424242}>
                    €{offer.amount}
                  </Text>
                </View>
              );
            })}

            {item.negotiation?.status === 'PENDING' &&
              (profile?.user?.role === 'service_provider' ? (
                <View>
                  {!editingForMessageId && (
                    <TouchableOpacity
                      style={styles(theme).editOfferButton}
                      onPress={() => {
                        setEditingForMessageId(!editingForMessageId);
                      }}>
                      <Text
                        size={getScaleSize(14)}
                        font={FONTS.Lato.SemiBold}
                        color={theme.primary}>
                        Edit Offer
                      </Text>
                    </TouchableOpacity>
                  )}

                  {editingForMessageId && (
                    <View>
                      <View style={styles(theme).offerInputWrapper}>
                        <Text
                          size={getScaleSize(16)}
                          font={FONTS.Lato.Medium}
                          color={theme._424242}>
                          €
                        </Text>
                        <TextInput
                          value={offerInputValue}
                          onChangeText={setOfferInputValue}
                          style={styles(theme).offerTextInput}
                          placeholder="0.00"
                          placeholderTextColor={theme._ACADAD}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <View style={styles(theme).actionRow}>
                        <TouchableOpacity
                          style={styles(theme).actionButtonPrimary}
                          onPress={async () => {
                            if (!offerInputValue.trim()) {
                              SHOW_TOAST(
                                'Please enter an offer amount',
                                'error',
                              );
                              return;
                            }

                            const updatedNegotiation = {
                              ...item.negotiation,
                              currentAmount: offerInputValue,
                              offers: [
                                ...item.negotiation.offers,
                                {
                                  amount: offerInputValue.toString(),
                                  by: profile?.user?.id,
                                  label: 'EDITED',
                                  createdAt: Date.now(),
                                  userName: profile?.user?.first_name,
                                },
                              ],
                            };

                            userNegotiationMessage(
                              item.serviceId,
                              item.serviceName,
                              item.servicePhoto,
                              profile?.user?.id,
                              profile?.user?.first_name,
                              peerUserId,
                              peerUserName,
                              commanId,
                              {
                                type: 'NEGOTIATION',
                                text: `My revised offer is €${offerInputValue}`,
                                negotiation: updatedNegotiation,
                              },
                              peerUserAvatar ?? '',
                              profile?.user?.profile_photo_url || '',
                            );
                            setEditingForMessageId(false);
                            setOfferInputValue('');
                          }}>
                          <Text
                            size={getScaleSize(14)}
                            font={FONTS.Lato.SemiBold}
                            color={theme.white}>
                            Submit
                          </Text>
                        </TouchableOpacity>
                        <View style={{width: getScaleSize(12)}} />
                        <TouchableOpacity
                          style={styles(theme).actionButtonSecondary}
                          onPress={() => {
                            setEditingForMessageId(false);
                            setOfferInputValue('');
                          }}>
                          <Text
                            size={getScaleSize(14)}
                            font={FONTS.Lato.SemiBold}
                            color={theme.primary}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ) : profile?.user?.role === 'elderly_user' ? (
                <View>
                  {!editingForMessageId && (
                    <View style={styles(theme).actionRow}>
                      <TouchableOpacity
                        style={styles(theme).actionButtonSecondary}
                        onPress={() => {
                          setEditingForMessageId(true);
                        }}>
                        <Text
                          size={getScaleSize(14)}
                          font={FONTS.Lato.SemiBold}
                          color={theme.primary}>
                          Counter Offer
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles(theme).actionButtonPrimary}
                        onPress={async () => {
                          // acceptNegotiation({
                          //   conversationId: commanId,
                          //   messageId: item._id,
                          //   userId: profile?.user?.id,
                          //   userName: profile?.user?.first_name,
                          // });
                          setEditingForMessageId(false);
                          setOfferInputValue('');
                        }}>
                        <Text
                          size={getScaleSize(14)}
                          font={FONTS.Lato.SemiBold}
                          color={theme.white}>
                          Accept Offer
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {editingForMessageId && (
                    <View>
                      <View style={styles(theme).offerInputWrapper}>
                        <Text
                          size={getScaleSize(16)}
                          font={FONTS.Lato.Medium}
                          color={theme._424242}>
                          €
                        </Text>
                        <TextInput
                          value={offerInputValue}
                          onChangeText={setOfferInputValue}
                          style={styles(theme).offerTextInput}
                          placeholder="0.00"
                          placeholderTextColor={theme._ACADAD}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <View style={styles(theme).actionRow}>
                        <TouchableOpacity
                          style={styles(theme).actionButtonPrimary}
                          onPress={() => {
                            if (!offerInputValue.trim()) {
                              SHOW_TOAST(
                                'Please enter an offer amount',
                                'error',
                              );
                              return;
                            }

                            const newOffer = {
                              amount: offerInputValue.toString(),
                              by: profile?.user?.id,
                              label: 'COUNTER', // or ACCEPTED / REJECTED
                              createdAt: Date.now(),
                              userName: profile?.user?.first_name,
                            };

                            const updatedNegotiation = {
                              ...item.negotiation,
                              currentAmount: offerInputValue,
                              offers: [...item.negotiation.offers, newOffer],
                            };

                            userNegotiationMessage(
                              item.serviceId,
                              item.serviceName,
                              item.servicePhoto,
                              profile?.user?.id,
                              profile?.user?.first_name,
                              peerUserId,
                              peerUserName,
                              commanId,
                              {
                                type: 'NEGOTIATION',
                                text: `My revised offer is €${offerInputValue}`,
                                negotiation: updatedNegotiation,
                              },
                              profile?.user?.profile_photo_url || '',
                              peerUserAvatar ?? '',
                            );

                            setEditingForMessageId(false);
                            setOfferInputValue('');
                          }}>
                          <Text
                            size={getScaleSize(14)}
                            font={FONTS.Lato.SemiBold}
                            color={theme.white}>
                            Submit
                          </Text>
                        </TouchableOpacity>
                        <View style={{width: getScaleSize(12)}} />
                        <TouchableOpacity
                          style={styles(theme).actionButtonSecondary}
                          onPress={() => {
                            setEditingForMessageId(false);
                            setOfferInputValue('');
                          }}>
                          <Text
                            size={getScaleSize(14)}
                            font={FONTS.Lato.SemiBold}
                            color={theme.primary}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ) : null)}
          </View>
        ) : (
          <View
            style={
              isMe
                ? styles(theme).quoteCardContainer
                : styles(theme).negotiationCard
            }>
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.Bold}
              color={theme._323232}>
              {item.negotiation.serviceName}
            </Text>
            {item.negotiation?.offers.map((offer: any) => {
              return (
                <View style={styles(theme).pricingRow}>
                  {offer.label === 'ORIGINAL_VALUATION' ? (
                    <Text
                      style={{flex: 1}}
                      size={getScaleSize(14)}
                      font={FONTS.Lato.Medium}
                      color={theme._6D6D6D}>
                      {'Original Valuation :'}
                    </Text>
                  ) : offer.label === 'PROVIDER_QUOTE' ? (
                    <Text
                      style={{flex: 1}}
                      size={getScaleSize(14)}
                      font={FONTS.Lato.Medium}
                      color={theme._6D6D6D}>
                      {'Initial Quote :'}
                    </Text>
                  ) : (
                    <Text
                      style={{flex: 1}}
                      size={getScaleSize(14)}
                      font={FONTS.Lato.Medium}
                      color={theme._6D6D6D}>
                      {offer.userName === profile?.user?.first_name
                        ? 'Your Previous Offer'
                        : offer.userName + ' Current Offer'}
                    </Text>
                  )}

                  <Text
                    size={getScaleSize(16)}
                    font={FONTS.Lato.Bold}
                    color={theme._424242}>
                    €{offer.amount}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      default:
        return null;
    }

    // case 'NEGOTIATION':
    //   const isMe = item.senderId === profile?.user?.id;
    //   return (

    //   );
    // default:
    //   return;
    // }
  };

  // const renderNegotiationMessage = ({item}: {item: any}) => {
  //   return (
  //     <View style={styles(theme).pricingRow}>
  //       {item.label === 'ORIGINAL_VALUATION' ? (
  //         <Text
  //           style={{flex: 1}}
  //           size={getScaleSize(14)}
  //           font={FONTS.Lato.Medium}
  //           color={theme._6D6D6D}>
  //           {'Original Valuation :'}
  //         </Text>
  //       ) : item.label === 'PROVIDER_QUOTE' ? (
  //         <Text
  //           style={{flex: 1}}
  //           size={getScaleSize(14)}
  //           font={FONTS.Lato.Medium}
  //           color={theme._6D6D6D}>
  //           {'Initial Quote :'}
  //         </Text>
  //       ) : (
  //         <Text
  //           style={{flex: 1}}
  //           size={getScaleSize(14)}
  //           font={FONTS.Lato.Medium}
  //           color={theme._6D6D6D}>
  //           {item.label === 'COUNTER'
  //             ? 'Your Previous Offer'
  //             : item.userName + ' Current Offer'}
  //         </Text>
  //       )}

  //       <Text
  //         size={getScaleSize(16)}
  //         font={FONTS.Lato.Bold}
  //         color={theme._424242}>
  //         €{item.amount}
  //       </Text>
  //     </View>
  //   );
  // };

  // const isMe = negotiationMessages[0]?.senderId === profile?.user?.id;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles(theme).container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.white}
        translucent={false}
      />
      <SafeAreaView style={styles(theme).hearderContainer}>
        <TouchableOpacity
          style={styles(theme).backImage}
          activeOpacity={1}
          onPress={() => {
            props.navigation.goBack();
          }}>
          <Image style={styles(theme).backImage} source={IMAGES.back_black} />
        </TouchableOpacity>
        <Image
          style={styles(theme).userImage}
          source={
            peerUserAvatar ? {uri: peerUserAvatar} : IMAGES.user_placeholder
          }
        />
        <View style={styles(theme).headerDetails}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.Bold}
            color={theme._2B2B2B}
            style={{}}>
            {peerUserName || STRING.unknown_user}
          </Text>
          <Text
            size={getScaleSize(14)}
            font={FONTS.Lato.Medium}
            color={theme._2E7D32}>
            {'Available'}
          </Text>
        </View>
      </SafeAreaView>
      <View style={styles(theme).messagesWrapper}>
        {loadingMessages ? (
          <View style={styles(theme).loaderContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        ) : (
          // <ScrollView showsVerticalScrollIndicator={false}>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={messageListContentStyle}
            showsVerticalScrollIndicator={false}
          />

          // </ScrollView>
        )}
      </View>
      {/* <View style={styles(theme).sendMessageContainer}>
        <Image style={styles(theme).microphoneImage} source={IMAGES.mic} />
        <TextInput
          style={styles(theme).searchInput}
          placeholderTextColor={'#939393'}
          placeholder={STRING.Sendamessagehere}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          style={styles(theme).sendButtonWrapper}
          // activeOpacity={0.7}
          // disabled={isSending || !message.trim()}
          onPress={handleSendMessage}>
          <Image
            style={[
              styles(theme).microphoneImage,
              (isSending || !message.trim()) && styles(theme).disabledSendIcon,
            ]}
            source={IMAGES.message_send}
          />
        </TouchableOpacity>
      </View> */}
    </KeyboardAvoidingView>
  );
}

const formatTimestamp = (
  timestamp?: FirebaseFirestoreTypes.Timestamp | null,
) => {
  if (!timestamp) {
    return '';
  }
  const date = timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp as any);
  return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
};

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: theme.white},
    hearderContainer: {
      paddingVertical: getScaleSize(12),
      flexDirection: 'row',
      marginHorizontal: getScaleSize(22),
    },
    headerDetails: {
      alignSelf: 'center',
      marginLeft: getScaleSize(12),
    },
    backImage: {
      height: getScaleSize(32),
      width: getScaleSize(32),
      alignSelf: 'center',
    },
    userImage: {
      height: getScaleSize(50),
      width: getScaleSize(50),
      borderRadius: getScaleSize(30),
      marginLeft: getScaleSize(8),
    },
    deviderView: {
      width: '100%',
      height: 1,
      backgroundColor: '#F5F5F5',
    },
    messagesWrapper: {
      flex: 1,
      paddingHorizontal: getScaleSize(16),
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendMessageContainer: {
      marginHorizontal: getScaleSize(24),
      marginBottom: getScaleSize(17),
      flexDirection: 'row',
      paddingVertical: getScaleSize(16),
      paddingHorizontal: getScaleSize(20),
      borderRadius: getScaleSize(22),
      backgroundColor: theme._F6F7F7,
    },
    negotiateButton: {
      alignSelf: 'center',
      marginRight: getScaleSize(12),
      paddingHorizontal: getScaleSize(12),
      paddingVertical: getScaleSize(8),
      borderRadius: getScaleSize(10),
      backgroundColor: theme.white,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    microphoneImage: {
      height: getScaleSize(24),
      width: getScaleSize(24),
      alignSelf: 'center',
    },
    searchInput: {
      fontFamily: FONTS.Lato.Regular,
      fontSize: getScaleSize(16),
      color: theme.black,
      marginLeft: getScaleSize(12),
      flex: 1.0,
      maxHeight: getScaleSize(80),
      paddingTop: 0,
    },
    userProfilePic: {
      height: getScaleSize(32),
      width: getScaleSize(32),
      borderRadius: getScaleSize(16),
      alignSelf: 'flex-end',
    },
    messageContainer: {
      paddingVertical: getScaleSize(10),
      paddingHorizontal: getScaleSize(17),
      borderRadius: getScaleSize(16),
      maxWidth: '75%',
    },
    selfBubble: {
      backgroundColor: theme.primary,
      marginLeft: getScaleSize(40),
      marginRight: getScaleSize(12),
    },
    peerBubble: {
      backgroundColor: '#F5F5F5',
      marginLeft: getScaleSize(12),
      marginRight: getScaleSize(40),
    },
    messageTime: {
      marginTop: getScaleSize(4),
    },
    messageRow: {
      flexDirection: 'row',
      marginBottom: getScaleSize(12),
      alignItems: 'flex-end',
    },
    messageRowLeft: {
      justifyContent: 'flex-start',
    },
    messageRowRight: {
      justifyContent: 'flex-end',
    },
    sendButtonWrapper: {
      marginRight: getScaleSize(12),
      justifyContent: 'center',
    },
    disabledSendIcon: {
      opacity: 0.5,
    },
    pricingBreakdownContainer: {
      marginHorizontal: getScaleSize(16),
      marginVertical: getScaleSize(12),
      paddingHorizontal: getScaleSize(16),
      paddingVertical: getScaleSize(16),
      borderRadius: getScaleSize(12),
      backgroundColor: theme._F5F5F5,
    },
    quoteCardContainer: {
      width: '65%',
      alignSelf: 'flex-end',
      paddingHorizontal: getScaleSize(16),
      paddingVertical: getScaleSize(16),
      borderRadius: getScaleSize(16),
      backgroundColor: theme._F5F5F5,
      marginBottom: getScaleSize(10),
    },
    negotiationCard: {
      width: '65%',
      alignSelf: 'flex-start',
      paddingHorizontal: getScaleSize(16),
      paddingVertical: getScaleSize(16),
      borderRadius: getScaleSize(16),
      backgroundColor: theme._F5F5F5,
      marginBottom: getScaleSize(10),
    },
    pricingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: getScaleSize(8),
    },
    offersHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: getScaleSize(2),
    },
    offerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: getScaleSize(6),
    },
    pricingRowSeparator: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme._D5D5D5,
      paddingTop: getScaleSize(12),
      marginTop: getScaleSize(8),
    },
    editOfferButton: {
      height: getScaleSize(44),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: getScaleSize(8),
      backgroundColor: theme.white,
    },
    offerInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: getScaleSize(8),
      paddingHorizontal: getScaleSize(12),
      borderRadius: getScaleSize(10),
      backgroundColor: theme.white,
      height: getScaleSize(44),
    },
    offerTextInput: {
      flex: 1,
      marginLeft: getScaleSize(8),
      fontFamily: FONTS.Lato.Medium,
      fontSize: getScaleSize(16),
      color: theme._424242,
      padding: 0,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: getScaleSize(10),
    },
    actionButtonPrimary: {
      paddingHorizontal: getScaleSize(16),
      paddingVertical: getScaleSize(10),
      borderRadius: getScaleSize(12),
      backgroundColor: theme.primary,
    },
    actionButtonSecondary: {
      paddingHorizontal: getScaleSize(12),
      paddingVertical: getScaleSize(8),
      borderRadius: getScaleSize(10),
      backgroundColor: theme.white,
      borderWidth: 1,
      borderColor: theme.primary,
      marginRight: getScaleSize(8),
    },
  });
