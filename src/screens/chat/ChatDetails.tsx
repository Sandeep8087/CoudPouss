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
  listenToThreads,
  messagesListThread,
  messagesNegotiationListThread,
  userMessage,
} from '../../services/chat';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export default function ChatDetails(props: any) {
  const STRING = useString();
  const {theme} = useContext<any>(ThemeContext);
  const {profile} = useContext<any>(AuthContext);
  const peerUser = props?.route?.params?.peerUser;
  // const existingThreadId = props?.route?.params?.threadId;
  // const offerAmount = props?.route?.params?.offerAmount;
  // const pricingBreakdown = props?.route?.params?.pricingBreakdown;
  // const serviceIdParam =
  //   props?.route?.params?.serviceId || pricingBreakdown?.serviceId || '';
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [negotiationMessages, setNegotiationMessages] = useState<any[]>([]);

  const [loadingMessages, setLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  // const [editingForMessageId, setEditingForMessageId] = useState<string | null>(
  //   null,
  // );
  // const [offerInputValue, setOfferInputValue] = useState('');
  // const [negotiateAmount, setNegotiateAmount] = useState('');
  // const [negotiateAmountError, setNegotiateAmountError] = useState('');
  // const negotiateSheetRef = useRef<any>(null);
  const [commanId, setCommanId] = useState<string | ''>(
    props?.route?.params?.conversationId || '',
  );
  console.log('commanId==>', commanId);
  // Extract user data from profile
  // const currentUserId = profile?.user?.id;
  // const currentUserName = profile?.user?.first_name;
  // const currentUserEmail = profile?.user?.email;
  const currentUserAvatar = profile?.user?.profile_photo_url;
  // const currentUserRole = profile?.user?.role;

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

  // const threadId = useMemo(() => {
  //   if (existingThreadId) {
  //     return existingThreadId;
  //   }

  //   if (currentUserId && peerUserId) {
  //     return buildThreadId(currentUserId, peerUserId);
  //   }

  //   return undefined;
  // }, [existingThreadId, currentUserId, peerUserId]);

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
      setLoadingMessages(false);
      setNegotiationMessages(formattedMessages);
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
  // useEffect(() => {
  //   if (!threadId || !currentUserId || !peerUserId) {
  //     return;
  //   }

  //   ensureThreadDocument(threadId, [
  //     {
  //       user_id: currentUserId,
  //       name: currentUserName,
  //       email: currentUserEmail,
  //       avatarUrl: currentUserAvatar,
  //     },
  //     {
  //       user_id: peerUserId,
  //       name: peerUserName,
  //       email: peerUserEmail,
  //       avatarUrl: peerUserAvatar,
  //     },
  //   ]);
  // }, [
  //   threadId,
  //   currentUserId,
  //   currentUserName,
  //   currentUserEmail,
  //   currentUserAvatar,
  //   peerUserId,
  //   peerUserName,
  //   peerUserEmail,
  //   peerUserAvatar,
  // ]);

  // useEffect(() => {
  //   if (!threadId) {
  //     setMessages([]);
  //     setLoadingMessages(false);
  //     return;
  //   }

  //   setLoadingMessages(true);
  //   const unsubscribe = subscribeToMessages(
  //     threadId,
  //     list => {
  //       setMessages(list);
  //       setLoadingMessages(false);
  //     },
  //     error => {
  //       console.log('Failed to subscribe to messages', error);
  //       setLoadingMessages(false);
  //     },
  //   );

  //   return unsubscribe;
  // }, [threadId]);

  // // Send the quote summary as the very first message after navigating from RequestDetails
  // useEffect(() => {
  //   if (
  //     !threadId ||
  //     !currentUserId ||
  //     !peerUserId ||
  //     !offerAmount ||
  //     !pricingBreakdown ||
  //     messages.length > 0
  //   ) {
  //     return;
  //   }

  //   const sendInitialQuoteMessage = async () => {
  //     try {
  //       const text = `${
  //         pricingBreakdown?.serviceName || 'service'
  //       }:\nOriginal Valuation: €${
  //         pricingBreakdown?.originalValuation
  //       }\nInitial Quote: €${
  //         pricingBreakdown?.initialQuote
  //       }\nYour Offer: €${offerAmount}`;

  //       await sendTextMessage({
  //         threadId,
  //         text,
  //         senderId: currentUserId,
  //         receiverId: peerUserId,
  //       });
  //     } catch (error) {
  //       console.log('Failed to send initial quote message', error);
  //     }
  //   };

  //   sendInitialQuoteMessage();
  // }, [
  //   threadId,
  //   currentUserId,
  //   peerUserId,
  //   offerAmount,
  //   pricingBreakdown,
  //   messages.length,
  //   currentUserName,
  // ]);

  const handleSendMessage = async () => {
    setIsSending(true);

    try {
      await userMessage(
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

  // const buildOfferSummaryText = ({
  //   serviceName,
  //   originalAmount,
  //   initialQuote,
  //   offers,
  //   elderName,
  //   providerName,
  // }: {
  //   serviceName: string;
  //   originalAmount: number;
  //   initialQuote: number;
  //   offers: Array<{
  //     amount: number;
  //     addedBy: 'elderly_user' | 'service_provider';
  //   }>;
  //   elderName: string;
  //   providerName: string;
  // }) => {
  //   const lines: string[] = [
  //     `${serviceName || 'service'}:`,
  //     `Original Valuation: €${Number(originalAmount || 0)}`,
  //     `Initial Quote: €${Number(initialQuote || 0)}`,
  //   ];
  //   offers.forEach((o, idx) => {
  //     const who = o.addedBy === 'elderly_user' ? elderName : providerName;
  //     const tag =
  //       idx === offers.length - 1 ? 'Current Offer' : 'Previous Offer';
  //     lines.push(`${who}’s ${tag}: €${Number(o.amount)}`);
  //   });
  //   return lines.join('\n');
  // };

  // const getExistingNegotiation = () => {
  //   const list = messages.filter(
  //     m =>
  //       m.type === 'negotiation' &&
  //       (!serviceIdParam ||
  //         String((m as any).serviceId || '') === String(serviceIdParam)),
  //   );
  //   return list.length ? (list[list.length - 1] as any) : null;
  // };

  // const parseAmount = (v: string) => {
  //   const parsed = String(v)
  //     .replace(/,/g, '.')
  //     .replace(/[^0-9.]/g, '');
  //   const n = Number(parsed);
  //   return isFinite(n) ? n : NaN;
  // };

  // const renderMessage = ({item}: {item: any}) => {
  //   console.log('item==>', item);
  //   return (
  //     <View style={styles(theme).messageContainer}>
  //       <Text>{item.text}</Text>
  //     </View>
  //   );
  // };
  const renderMessage = ({item}: {item: any}) => {
    const isMe = item.senderId === profile?.user?.id;
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
        <View
          style={[
            styles(theme).messageContainer,
            isMe ? styles(theme).selfBubble : styles(theme).peerBubble,
          ]}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.SemiBold}
            color={isMe ? theme.white : theme._818285}>
            {item?.text}
          </Text>
          <Text
            size={getScaleSize(10)}
            font={FONTS.Lato.Regular}
            color={isMe ? theme.white : theme._ACADAD}
            style={[styles(theme).messageTime]}>
            {formatTimestamp(item.createdAt)}
          </Text>
        </View>
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

  const renderNegotiationMessage = ({item}: {item: any}) => {
    const isMe = item.senderId === profile?.user?.id;
    return (
      <View
        style={[
          styles(theme).messageRow,
          isMe ? styles(theme).messageRowRight : styles(theme).messageRowLeft,
        ]}>
        {/* <Text
          size={getScaleSize(16)}
          font={FONTS.Lato.Bold}
          color={theme._323232}
          style={{marginBottom: getScaleSize(8)}}>
          {item.serviceName}
        </Text> */}
        <View style={styles(theme).pricingRow}>
          <Text
            size={getScaleSize(14)}
            font={FONTS.Lato.Medium}
            color={theme._6D6D6D}>
            {item.title}
          </Text>
          <Text
            style={{marginLeft: getScaleSize(70)}}
            size={getScaleSize(16)}
            font={FONTS.Lato.Bold}
            color={theme._424242}>
            €{item.text}
          </Text>
        </View>
        {/* <View style={styles(theme).pricingRow}>
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
            €{item.text}
          </Text>
        </View> */}
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
      {/* <SafeAreaView style={styles(theme).hearderContainer}>
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
      <RenegotiationSheet
        onRef={negotiateSheetRef}
        onClose={() => {
          negotiateSheetRef.current?.close?.();
        }}
        onProcessPress={async () => {
          const n = Number((negotiateAmount || '').replace(/[^0-9.]/g, ''));
          if (!n || !threadId || !currentUserId || !peerUserId) {
            setNegotiateAmountError('Enter a valid amount');
            return;
          }
          await createNegotiationMessage({
            threadId,
            senderId: currentUserId,
            receiverId: peerUserId,
            serviceId: String(serviceIdParam || ''),
            serviceName: pricingBreakdown?.serviceName,
            originalAmount: Number(pricingBreakdown?.originalValuation || 0),
            initialQuote: Number(pricingBreakdown?.initialQuote || 0),
            firstOfferAmount: n,
            addedBy: 'elderly_user',
          });
          negotiateSheetRef.current?.close?.();
        }}
        onChangeNewQuoteAmount={setNegotiateAmount}
        newQuoteAmount={negotiateAmount}
        newQuoteAmountError={negotiateAmountError}
        item={{
          finalized_quote_amount: pricingBreakdown?.initialQuote || 0,
          platform_fee: 0,
          taxes: 0,
          total: pricingBreakdown?.initialQuote || 0,
        }}
        type="renegotiate"
      /> */}
      <View style={styles(theme).messagesWrapper}>
        {loadingMessages ? (
          <View style={styles(theme).loaderContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        ) : (
          <View>
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={messageListContentStyle}
              showsVerticalScrollIndicator={false}
            />
            <FlatList
              data={negotiationMessages}
              renderItem={renderNegotiationMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={messageListContentStyle}
              showsVerticalScrollIndicator={false}
            />
          </View>
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
      maxWidth: '75%',
      paddingHorizontal: getScaleSize(16),
      paddingVertical: getScaleSize(16),
      borderRadius: getScaleSize(16),
      backgroundColor: theme._F5F5F5,
    },
    negotiationCard: {
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
      marginTop: getScaleSize(6),
      alignSelf: 'flex-start',
      paddingHorizontal: getScaleSize(8),
      paddingVertical: getScaleSize(4),
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
