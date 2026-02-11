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
} from 'react-native';

//ASSETS
import {FONTS, IMAGES} from '../../assets';

//CONTEXT
import {ThemeContext, ThemeContextType, AuthContext} from '../../context';

//CONSTANT
import {getScaleSize, useString} from '../../constant';

//COMPONENT
import {Text} from '../../components';

//PACKAGES
import {useFocusEffect} from '@react-navigation/native';
import {
  ChatMessage,
  buildThreadId,
  ensureThreadDocument,
  sendTextMessage,
  subscribeToMessages,
} from '../../services/chat';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function ChatDetails(props: any) {
  const STRING = useString();
  const {theme} = useContext<any>(ThemeContext);
  const {profile} = useContext<any>(AuthContext);
  const peerUser = props?.route?.params?.peerUser;
  const existingThreadId = props?.route?.params?.threadId;
  const offerAmount = props?.route?.params?.offerAmount;
  const pricingBreakdown = props?.route?.params?.pricingBreakdown;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Extract user data from profile
  const currentUserId = profile?.user?.id;
  const currentUserName = profile?.user?.first_name;
  const currentUserEmail = profile?.user?.email;
  const currentUserAvatar = profile?.user?.profile_photo_url;

  const peerUserId = peerUser?.user_id;
  const peerUserName = peerUser?.name;
  const peerUserEmail = peerUser?.email;
  const peerUserAvatar = peerUser?.avatarUrl;
  const messageListContentStyle = useMemo<StyleProp<ViewStyle>>(
    () => ({
      paddingVertical: getScaleSize(12),
      flexGrow: 1,
      justifyContent: 'flex-end',
    }),
    [],
  );

  const threadId = useMemo(() => {
    if (existingThreadId) {
      return existingThreadId;
    }

    if (currentUserId && peerUserId) {
      return buildThreadId(currentUserId, peerUserId);
    }

    return undefined;
  }, [existingThreadId, currentUserId, peerUserId]);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(theme.white);
        StatusBar.setBarStyle('dark-content');
      }
    }, [theme.white]),
  );

  useEffect(() => {
    if (!threadId || !currentUserId || !peerUserId) {
      return;
    }

    ensureThreadDocument(threadId, [
      {
        user_id: currentUserId,
        name: currentUserName,
        email: currentUserEmail,
        avatarUrl: currentUserAvatar,
      },
      {
        user_id: peerUserId,
        name: peerUserName,
        email: peerUserEmail,
        avatarUrl: peerUserAvatar,
      },
    ]);
  }, [
    threadId,
    currentUserId,
    currentUserName,
    currentUserEmail,
    currentUserAvatar,
    peerUserId,
    peerUserName,
    peerUserEmail,
    peerUserAvatar,
  ]);

  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    setLoadingMessages(true);
    const unsubscribe = subscribeToMessages(
      threadId,
      list => {
        setMessages(list);
        setLoadingMessages(false);
      },
      error => {
        console.log('Failed to subscribe to messages', error);
        setLoadingMessages(false);
      },
    );

    return unsubscribe;
  }, [threadId]);

  // Send the quote summary as the very first message after navigating from RequestDetails
  useEffect(() => {
    if (
      !threadId ||
      !currentUserId ||
      !peerUserId ||
      !offerAmount ||
      !pricingBreakdown ||
      messages.length > 0
    ) {
      return;
    }

    const sendInitialQuoteMessage = async () => {
      try {
        const text = `${
          pricingBreakdown?.serviceName || 'service'
        }:\nOriginal Valuation: €${
          pricingBreakdown?.originalValuation
        }\nInitial Quote: €${
          pricingBreakdown?.initialQuote
        }\nYour Offer: €${offerAmount}`;

        await sendTextMessage({
          threadId,
          text,
          senderId: currentUserId,
          receiverId: peerUserId,
        });
      } catch (error) {
        console.log('Failed to send initial quote message', error);
      }
    };

    sendInitialQuoteMessage();
  }, [
    threadId,
    currentUserId,
    peerUserId,
    offerAmount,
    pricingBreakdown,
    messages.length,
    currentUserName,
  ]);

  const handleSendMessage = async () => {
    console.log('=== Send Message Debug ===');
    console.log('threadId:', threadId);
    console.log('currentUserId:', currentUserId);
    console.log('peerUserId:', peerUserId);
    console.log('message:', message);
    console.log('profile object:', profile);
    console.log('peerUser object:', peerUser);

    if (!threadId || !currentUserId || !peerUserId || !message.trim()) {
      console.log('Message validation failed:', {
        threadId: !!threadId,
        currentUserId: !!currentUserId,
        peerUserId: !!peerUserId,
        messageValid: !!message.trim(),
      });
      return;
    }

    setIsSending(true);
    try {
      await sendTextMessage({
        threadId,
        text: message,
        senderId: currentUserId,
        receiverId: peerUserId,
      });
      setMessage('');
    } catch (error) {
      console.log('Failed to send message', error);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({item}: {item: ChatMessage}) => {
    const isMe = item.senderId === currentUserId;
    const isRecipient = item.receiverId === currentUserId;
    const isOfferMessage =
      typeof item.text === 'string' &&
      /offer/i.test(item.text) &&
      /€\s*\d/.test(item.text);
    const canEditOffer = isRecipient && isOfferMessage;
    const isQuoteSummaryMessage =
      pricingBreakdown &&
      typeof item.text === 'string' &&
      item.text.includes('Original Valuation') &&
      item.text.includes('Initial Quote') &&
      item.text.includes('Your Offer');

    return (
      <View
        style={[
          styles(theme).messageRow,
          isMe ? styles(theme).messageRowRight : styles(theme).messageRowLeft,
        ]}>
        {!isMe && (
          <Image
            style={styles(theme).userProfilePic}
            source={
              peerUserAvatar ? {uri: peerUserAvatar} : IMAGES.user_placeholder
            }
          />
        )}
        {isQuoteSummaryMessage ? (
          <View style={styles(theme).quoteCardContainer}>
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.Bold}
              color={theme._323232}
              style={{marginBottom: getScaleSize(8)}}>
              {pricingBreakdown?.serviceName}
            </Text>
            <View style={styles(theme).pricingRow}>
              <Text
                size={getScaleSize(14)}
                font={FONTS.Lato.Medium}
                color={theme._6D6D6D}>
                Original Valuation
              </Text>
              <Text
                style={{marginLeft: getScaleSize(70)}}
                size={getScaleSize(16)}
                font={FONTS.Lato.Bold}
                color={theme._424242}>
                €{pricingBreakdown?.originalValuation}
              </Text>
            </View>
            <View style={styles(theme).pricingRow}>
              <Text
                size={getScaleSize(14)}
                font={FONTS.Lato.Regular}
                color={theme._6D6D6D}>
                Initial Quote
              </Text>
              <Text
                style={{marginLeft: getScaleSize(70)}}
                size={getScaleSize(16)}
                font={FONTS.Lato.Bold}
                color={theme._424242}>
                €{pricingBreakdown?.initialQuote}
              </Text>
            </View>
            <View style={styles(theme).pricingRow}>
              <Text
                size={getScaleSize(14)}
                font={FONTS.Lato.Regular}
                color={theme._6D6D6D}>
                Your Offer
              </Text>
              <Text
                style={{marginLeft: getScaleSize(70)}}
                size={getScaleSize(16)}
                font={FONTS.Lato.Bold}
                color={theme._424242}>
                €{offerAmount || pricingBreakdown?.yourOffer}
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles(theme).messageContainer,
              isMe ? styles(theme).selfBubble : styles(theme).peerBubble,
            ]}>
            <Text
              size={getScaleSize(16)}
              font={FONTS.Lato.SemiBold}
              color={isMe ? theme.white : theme._818285}>
              {item.text}
            </Text>
            <Text
              size={getScaleSize(10)}
              font={FONTS.Lato.Regular}
              color={isMe ? theme.white : theme._ACADAD}
              style={[styles(theme).messageTime]}>
              {formatTimestamp(item.createdAt)}
            </Text>
            {canEditOffer && (
              <TouchableOpacity
                style={styles(theme).editOfferButton}
                onPress={async () => {
                  if (!threadId || !currentUserId || !peerUserId) {
                    return;
                  }
                  const displayName = currentUserName || 'You';
                  const match = item.text.match(
                    /€\s*([0-9]+(?:\.[0-9]{1,2})?)/,
                  );
                  const existingAmount = match ? match[1] : '';
                  const newAmount = existingAmount || offerAmount;
                  if (!newAmount) {
                    return;
                  }
                  try {
                    await sendTextMessage({
                      threadId,
                      text: `${displayName}'s Current Offer: €${newAmount}`,
                      senderId: currentUserId,
                      receiverId: peerUserId,
                    });
                  } catch (error) {
                    console.log('Failed to send edited offer', error);
                  }
                }}>
                <Text
                  size={getScaleSize(12)}
                  font={FONTS.Lato.SemiBold}
                  color={theme.primary}>
                  Edit Offer
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {isMe && (
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
            color={theme.primary}>
            {peerUser?.status || ''}
          </Text>
        </View>
      </SafeAreaView>
      <View style={styles(theme).deviderView} />

      <View style={styles(theme).messagesWrapper}>
        {loadingMessages ? (
          <View style={styles(theme).loaderContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={messageListContentStyle}
            showsVerticalScrollIndicator={false}
          />
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
          activeOpacity={0.7}
          disabled={isSending || !message.trim()}
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
      height: getScaleSize(60),
      width: getScaleSize(60),
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
      maxWidth: '75%',
      paddingHorizontal: getScaleSize(16),
      paddingVertical: getScaleSize(16),
      borderRadius: getScaleSize(16),
      backgroundColor: theme._F5F5F5,
    },
    pricingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: getScaleSize(10),
      // paddingVertical: getScaleSize(4),
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
      marginTop: getScaleSize(6),
      alignSelf: 'flex-start',
      paddingHorizontal: getScaleSize(8),
      paddingVertical: getScaleSize(4),
      borderRadius: getScaleSize(8),
      backgroundColor: theme.white,
    },
  });
