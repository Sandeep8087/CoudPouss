import React, { useContext, useEffect, useMemo, useState } from 'react';
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
  ScrollView,
  SafeAreaView,
} from 'react-native';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { ThemeContext, ThemeContextType, AuthContext } from '../../context';

//CONSTANT
import {getScaleSize, SHOW_TOAST, useString} from '../../constant';

//COMPONENT
import { Text } from '../../components';

//PACKAGES
import { useFocusEffect } from '@react-navigation/native';
import {
  listenToThreads,
  messagesListThread,
  messagesNegotiationListThread,
  negotiationMessage,
  userMessage,
} from '../../services/chat';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {Screen} from 'react-native-screens';

export default function ChatDetails(props: any) {

  const STRING = useString();
  const {theme} = useContext<any>(ThemeContext);
  const {profile} = useContext<any>(AuthContext);
  const { user } = useContext<any>(AuthContext);
  const peerUser = props?.route?.params?.peerUser;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [negotiationMessages, setNegotiationMessages] = useState<any>({});

  const [loadingMessages, setLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [editingForMessageId, setEditingForMessageId] = useState<
    boolean | null
  >(false);
  const [offerInputValue, setOfferInputValue] = useState('');

  const [commanId, setCommanId] = useState<string | ''>(
    props?.route?.params?.conversationId || '',
  );
  // Extract user data from profile
  // const currentUserId = profile?.user?.id;
  // const currentUserName = profile?.user?.first_name;
  // const currentUserEmail = profile?.user?.email;
  const currentUserAvatar = profile?.user?.profile_photo_url;
  // const currentUserRole = profile?.user?.role;

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
    const unsubscribe = messagesNegotiationListThread(
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

      // Create common object
      const commonData = {
        serviceName: formattedMessages[0]?.serviceName,
        senderId: formattedMessages[0]?.senderId,
        receiverId: formattedMessages[0]?.receiverId,
        type: formattedMessages[0]?.type,
      };

      // Optional: keep only message-specific fields
      const messagesData = formattedMessages.map(({...rest}) => rest);

      const result = {
        commonData,
        messagesData: messagesData.reverse(),
      };
      setLoadingMessages(false);
      setNegotiationMessages(result);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (commanId === '') {
      return listenToThreads(profile?.user?.id).onSnapshot(querySnapshot => {
        querySnapshot.docs.map((doc: any) => {
          if (doc.data().user.recipientId === peerUserId) {
            setCommanId(doc.id);
            return messagesListThread(doc.id).onSnapshot(
              (querySnapshot: any) => {
                const formattedMessages = querySnapshot.docs.map((doc: any) => {
                  return {
                    _id: doc.id,
                    text: '',
                    createdAt: new Date().getTime(),
                    ...doc.data(),
                  };
                });
                setLoadingMessages(false);
                setMessages(formattedMessages);
              },
            );
          }
        });
      });
    } else {
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
        setMessages(formattedMessages);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [commanId]);

  const handleSendMessage = () => {
    setIsSending(true);

    try {
      userMessage(
        profile?.user?.id,
        profile?.user?.first_name,
        peerUserId,
        peerUserName,
        message,
        commanId || '',
        currentUserAvatar,
        peerUserAvatar,
        'text',
      );
      setMessage('');
    } catch (error) {
      console.log('Failed to send message', error);
    } finally {
      setIsSending(false);
    }
  };

  const isMe = negotiationMessages?.commonData?.senderId === profile?.user?.id;

  const renderMessage = ({item}: {item: any}) => {
    const isMessageMe = item.senderId === profile?.user?.id;
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
              peerUserAvatar ? { uri: peerUserAvatar } : IMAGES.user_placeholder
            }
          />
        )}
        <View
          style={[
            styles(theme).messageContainer,
            isMessageMe ? styles(theme).selfBubble : styles(theme).peerBubble,
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
                ? { uri: currentUserAvatar }
                : IMAGES.user_placeholder
            }
          />
        )}
      </View>
    );
  };

  const renderNegotiationMessage = ({item}: {item: any}) => {
    return (
      <View style={styles(theme).pricingRow}>
        {item.title === 'Original Valuation' ? (
          <Text
            style={{flex: 1}}
            size={getScaleSize(14)}
            font={FONTS.Lato.Medium}
            color={theme._6D6D6D}>
            {item.title}
          </Text>
        ) : item.title === 'Initial Quote' ? (
          <Text
            style={{flex: 1}}
            size={getScaleSize(14)}
            font={FONTS.Lato.Medium}
            color={theme._6D6D6D}>
            {item.title}
          </Text>
        ) : (
          <Text
            style={{flex: 1}}
            size={getScaleSize(14)}
            font={FONTS.Lato.Medium}
            color={theme._6D6D6D}>
            {item.title === profile?.user?.first_name
              ? 'Your Previous Offer'
              : item.title + ' Current Offer'}
          </Text>
        )}

        <Text
          size={getScaleSize(16)}
          font={FONTS.Lato.Bold}
          color={theme._424242}>
          €{item.text}
        </Text>
      </View>
    );
  };

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
            peerUserAvatar ? { uri: peerUserAvatar } : IMAGES.user_placeholder
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
            color={theme.primary}>
            {peerUser?.status || ''}
          </Text>
        </View>
      </SafeAreaView>
      <View style={styles(theme).messagesWrapper}>
        {loadingMessages ? (
          <View style={styles(theme).loaderContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={messageListContentStyle}
              showsVerticalScrollIndicator={false}
            />
            {negotiationMessages.messagesData.length > 0 && (
              <View
                style={
                  !isMe
                    ? styles(theme).quoteCardContainer
                    : styles(theme).negotiationCard
                }>
                <Text
                  size={getScaleSize(16)}
                  font={FONTS.Lato.Bold}
                  color={theme._323232}>
                  {negotiationMessages.commonData.serviceName}
                </Text>
                <FlatList
                  data={negotiationMessages.messagesData}
                  renderItem={renderNegotiationMessage}
                  keyExtractor={item => item._id}
                  contentContainerStyle={messageListContentStyle}
                  showsVerticalScrollIndicator={false}
                />
                {!isMe ? (
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
                              negotiationMessage(
                                negotiationMessages.commonData.serviceName,
                                peerUserId,
                                profile?.user?.id,
                                profile?.user?.first_name,
                                'service_provider',
                                offerInputValue,
                                peerUserId,
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
                ) : (
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
                          onPress={async () => {}}>
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
                              negotiationMessage(
                                negotiationMessages.commonData.serviceName,
                                profile?.user?.id,
                                peerUserId,
                                profile?.user?.first_name,
                                'elderly_user',
                                offerInputValue,
                                profile?.user?.id,
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
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
      <View style={styles(theme).sendMessageContainer}>
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
      </View>
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
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.white },
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
    },
    negotiationCard: {
      width: '65%',
      alignSelf: 'flex-start',
      paddingHorizontal: getScaleSize(16),
      paddingVertical: getScaleSize(16),
      borderRadius: getScaleSize(16),
      backgroundColor: theme._F5F5F5,
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
