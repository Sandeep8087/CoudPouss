import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
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
import {Text, RenegotiationSheet} from '../../components';

//PACKAGES
import {useFocusEffect} from '@react-navigation/native';
import {listenToThreads, messagesListThread} from '../../services/chat';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {SafeAreaView} from 'react-native-safe-area-context';

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
  // const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  // const [loadingMessages, setLoadingMessages] = useState(true);
  // const [isSending, setIsSending] = useState(false);
  // const [editingForMessageId, setEditingForMessageId] = useState<string | null>(
  //   null,
  // );
  // const [offerInputValue, setOfferInputValue] = useState('');
  // const [negotiateAmount, setNegotiateAmount] = useState('');
  // const [negotiateAmountError, setNegotiateAmountError] = useState('');
  // const negotiateSheetRef = useRef<any>(null);
  const [commanId, setCommanId] = useState<string | null>(
    props?.route?.params?.conversationId,
  );
  console.log('commanId==>', commanId);
  // Extract user data from profile
  // const currentUserId = profile?.user?.id;
  // const currentUserName = profile?.user?.first_name;
  // const currentUserEmail = profile?.user?.email;
  // const currentUserAvatar = profile?.user?.profile_photo_url;
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
        setMessages(formattedMessages);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [commanId]);
  console.log('messages==>', messages);
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

  // const handleSendMessage = async () => {
  //   console.log('=== Send Message Debug ===');
  //   console.log('threadId:', threadId);
  //   console.log('currentUserId:', currentUserId);
  //   console.log('peerUserId:', peerUserId);
  //   console.log('message:', message);
  //   console.log('profile object:', profile);
  //   console.log('peerUser object:', peerUser);

  //   if (!threadId || !currentUserId || !peerUserId || !message.trim()) {
  //     console.log('Message validation failed:', {
  //       threadId: !!threadId,
  //       currentUserId: !!currentUserId,
  //       peerUserId: !!peerUserId,
  //       messageValid: !!message.trim(),
  //     });
  //     return;
  //   }

  //   setIsSending(true);
  //   try {
  //     await sendTextMessage({
  //       threadId,
  //       text: message,
  //       senderId: currentUserId,
  //       receiverId: peerUserId,
  //     });
  //     setMessage('');
  //   } catch (error) {
  //     console.log('Failed to send message', error);
  //   } finally {
  //     setIsSending(false);
  //   }
  // };

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

  // const renderMessage = ({item}: {item: ChatMessage}) => {
  //   const isMe = item.senderId === currentUserId;
  //   const isRecipient = item.receiverId === currentUserId;
  //   if (item.type === 'negotiation') {
  //     const offers = Array.isArray(item.offers) ? item.offers : [];
  //     const latest = offers.length > 0 ? offers[offers.length - 1] : null;
  //     const status = item.status || 'pending';
  //     const canProviderEdit =
  //       status === 'pending' && currentUserRole === 'service_provider';
  //     const canElderActions =
  //       status === 'pending' && currentUserRole === 'elderly_user';
  //     const showProceed =
  //       status === 'accepted' && currentUserRole === 'elderly_user';
  //     const offerLabel = (
  //       idx: number,
  //       addedBy: 'elderly_user' | 'service_provider',
  //     ) => {
  //       const isLatest = idx === offers.length - 1;
  //       const elderName =
  //         currentUserRole === 'elderly_user'
  //           ? currentUserName || 'Elder'
  //           : peerUserName || 'Elder';
  //       const providerName =
  //         currentUserRole === 'service_provider'
  //           ? currentUserName || 'Professional'
  //           : peerUserName || 'Professional';
  //       const who = addedBy === 'elderly_user' ? elderName : providerName;
  //       const suffix = isLatest ? ' Current Offer' : ' Previous Offer';
  //       return `${who}’s${suffix}`;
  //     };
  //     return (
  //       <View
  //         style={[
  //           styles(theme).messageRow,
  //           isMe ? styles(theme).messageRowRight : styles(theme).messageRowLeft,
  //         ]}>
  //         {!isMe && (
  //           <Image
  //             style={styles(theme).userProfilePic}
  //             source={
  //               peerUserAvatar ? {uri: peerUserAvatar} : IMAGES.user_placeholder
  //             }
  //           />
  //         )}
  //         <View style={styles(theme).negotiationCard}>
  //           {!!item.serviceName && (
  //             <Text
  //               size={getScaleSize(16)}
  //               font={FONTS.Lato.Bold}
  //               color={theme._323232}
  //               style={{marginBottom: getScaleSize(8)}}>
  //               {item.serviceName}
  //             </Text>
  //           )}
  //           {!!item.originalAmount && (
  //             <View style={styles(theme).pricingRow}>
  //               <Text
  //                 size={getScaleSize(14)}
  //                 font={FONTS.Lato.Medium}
  //                 color={theme._6D6D6D}>
  //                 Original Valuation
  //               </Text>
  //               <Text
  //                 style={{marginLeft: getScaleSize(70)}}
  //                 size={getScaleSize(16)}
  //                 font={FONTS.Lato.Bold}
  //                 color={theme._424242}>
  //                 €{item.originalAmount}
  //               </Text>
  //             </View>
  //           )}
  //           {!!item.initialQuote && (
  //             <View style={styles(theme).pricingRow}>
  //               <Text
  //                 size={getScaleSize(14)}
  //                 font={FONTS.Lato.Regular}
  //                 color={theme._6D6D6D}>
  //                 Initial Quote
  //               </Text>
  //               <Text
  //                 style={{marginLeft: getScaleSize(70)}}
  //                 size={getScaleSize(16)}
  //                 font={FONTS.Lato.Bold}
  //                 color={theme._424242}>
  //                 €{item.initialQuote}
  //               </Text>
  //             </View>
  //           )}
  //           <View style={styles(theme).offersHeaderRow}>
  //             <Text
  //               size={getScaleSize(14)}
  //               font={FONTS.Lato.SemiBold}
  //               color={theme._323232}>
  //               Offers
  //             </Text>
  //             {latest && (
  //               <Text
  //                 size={getScaleSize(16)}
  //                 font={FONTS.Lato.Bold}
  //                 color={theme._424242}>
  //                 €{latest.amount}
  //               </Text>
  //             )}
  //           </View>
  //           <View style={{marginTop: getScaleSize(8)}}>
  //             {offers.map((o, idx) => (
  //               <View key={idx} style={styles(theme).offerRow}>
  //                 <Text
  //                   size={getScaleSize(12)}
  //                   font={FONTS.Lato.Medium}
  //                   color={theme._6D6D6D}>
  //                   {offerLabel(idx, o.addedBy)}
  //                 </Text>
  //                 <Text
  //                   size={getScaleSize(14)}
  //                   font={FONTS.Lato.SemiBold}
  //                   color={theme._424242}>
  //                   €{o.amount}
  //                 </Text>
  //               </View>
  //             ))}
  //           </View>
  //           <Text
  //             size={getScaleSize(10)}
  //             font={FONTS.Lato.Regular}
  //             color={theme._818285}
  //             style={[styles(theme).messageTime]}>
  //             {formatTimestamp(item.createdAt)}
  //           </Text>
  //           {canProviderEdit && editingForMessageId !== item.id && (
  //             <TouchableOpacity
  //               style={styles(theme).actionButtonSecondary}
  //               onPress={() => {
  //                 const next = latest ? String(latest.amount) : '';
  //                 setOfferInputValue(next);
  //                 setEditingForMessageId(item.id);
  //               }}>
  //               <Text
  //                 size={getScaleSize(12)}
  //                 font={FONTS.Lato.SemiBold}
  //                 color={theme.primary}>
  //                 Edit Offer
  //               </Text>
  //             </TouchableOpacity>
  //           )}
  //           {canProviderEdit && editingForMessageId === item.id && (
  //             <View style={{marginTop: getScaleSize(10)}}>
  //               <View style={styles(theme).offerInputWrapper}>
  //                 <Text
  //                   size={getScaleSize(16)}
  //                   font={FONTS.Lato.Medium}
  //                   color={theme._424242}>
  //                   €
  //                 </Text>
  //                 <TextInput
  //                   value={offerInputValue}
  //                   onChangeText={setOfferInputValue}
  //                   style={styles(theme).offerTextInput}
  //                   placeholder="0.00"
  //                   placeholderTextColor={theme._ACADAD}
  //                   keyboardType="decimal-pad"
  //                 />
  //               </View>
  //               <View style={styles(theme).actionRow}>
  //                 <TouchableOpacity
  //                   style={styles(theme).actionButtonPrimary}
  //                   onPress={async () => {
  //                     if (!threadId || !offerInputValue) {
  //                       return;
  //                     }
  //                     const amt = parseAmount(offerInputValue);
  //                     if (!amt) {
  //                       return;
  //                     }
  //                     await appendNegotiationOffer({
  //                       threadId,
  //                       messageId: item.id,
  //                       amount: amt,
  //                       addedBy: 'service_provider',
  //                     });
  //                     try {
  //                       const elderName =
  //                         currentUserRole === 'elderly_user'
  //                           ? currentUserName || 'Elder'
  //                           : peerUserName || 'Elder';
  //                       const providerName =
  //                         currentUserRole === 'service_provider'
  //                           ? currentUserName || 'Professional'
  //                           : peerUserName || 'Professional';
  //                       const base = Array.isArray(item.offers)
  //                         ? item.offers
  //                         : [];
  //                       const summary = buildOfferSummaryText({
  //                         serviceName: item.serviceName || 'service',
  //                         originalAmount: Number(item.originalAmount || 0),
  //                         initialQuote: Number(item.initialQuote || 0),
  //                         offers: [
  //                           ...base.map((o: any) => ({
  //                             amount: Number(o.amount),
  //                             addedBy: o.addedBy,
  //                           })),
  //                           {
  //                             amount: amt,
  //                             addedBy: 'service_provider',
  //                           },
  //                         ],
  //                         elderName,
  //                         providerName,
  //                       });
  //                       await sendTextMessage({
  //                         threadId,
  //                         text: summary,
  //                         senderId: currentUserId,
  //                         receiverId: peerUserId,
  //                       });
  //                     } catch (e) {}
  //                     setEditingForMessageId(null);
  //                     setOfferInputValue('');
  //                   }}>
  //                   <Text
  //                     size={getScaleSize(14)}
  //                     font={FONTS.Lato.SemiBold}
  //                     color={theme.white}>
  //                     Submit
  //                   </Text>
  //                 </TouchableOpacity>
  //                 <TouchableOpacity
  //                   style={styles(theme).actionButtonSecondary}
  //                   onPress={() => {
  //                     setEditingForMessageId(null);
  //                     setOfferInputValue('');
  //                   }}>
  //                   <Text
  //                     size={getScaleSize(14)}
  //                     font={FONTS.Lato.SemiBold}
  //                     color={theme.primary}>
  //                     Cancel
  //                   </Text>
  //                 </TouchableOpacity>
  //               </View>
  //             </View>
  //           )}
  //           {canElderActions && editingForMessageId !== item.id && (
  //             <View style={styles(theme).actionRow}>
  //               <TouchableOpacity
  //                 style={styles(theme).actionButtonSecondary}
  //                 onPress={() => {
  //                   const next = latest ? String(latest.amount) : '';
  //                   setOfferInputValue(next);
  //                   setEditingForMessageId(item.id);
  //                 }}>
  //                 <Text
  //                   size={getScaleSize(14)}
  //                   font={FONTS.Lato.SemiBold}
  //                   color={theme.primary}>
  //                   Counter Offer
  //                 </Text>
  //               </TouchableOpacity>
  //               <TouchableOpacity
  //                 style={styles(theme).actionButtonPrimary}
  //                 onPress={async () => {
  //                   if (!threadId) {
  //                     return;
  //                   }
  //                   await acceptNegotiation({
  //                     threadId,
  //                     messageId: item.id,
  //                   });
  //                 }}>
  //                 <Text
  //                   size={getScaleSize(14)}
  //                   font={FONTS.Lato.SemiBold}
  //                   color={theme.white}>
  //                   Accept Offer
  //                 </Text>
  //               </TouchableOpacity>
  //             </View>
  //           )}
  //           {canElderActions && editingForMessageId === item.id && (
  //             <View style={{marginTop: getScaleSize(10)}}>
  //               <View style={styles(theme).offerInputWrapper}>
  //                 <Text
  //                   size={getScaleSize(16)}
  //                   font={FONTS.Lato.Medium}
  //                   color={theme._424242}>
  //                   €
  //                 </Text>
  //                 <TextInput
  //                   value={offerInputValue}
  //                   onChangeText={setOfferInputValue}
  //                   style={styles(theme).offerTextInput}
  //                   placeholder="0.00"
  //                   placeholderTextColor={theme._ACADAD}
  //                   keyboardType="decimal-pad"
  //                 />
  //               </View>
  //               <View style={styles(theme).actionRow}>
  //                 <TouchableOpacity
  //                   style={styles(theme).actionButtonPrimary}
  //                   onPress={async () => {
  //                     if (
  //                       !threadId ||
  //                       !currentUserId ||
  //                       !peerUserId ||
  //                       !offerInputValue
  //                     ) {
  //                       return;
  //                     }
  //                     try {
  //                       const parsed = String(offerInputValue)
  //                         .replace(/,/g, '.')
  //                         .replace(/[^0-9.]/g, '');
  //                       const amount = Number(parsed);
  //                       if (!isFinite(amount) || isNaN(amount)) {
  //                         return;
  //                       }
  //                       await appendNegotiationOffer({
  //                         threadId,
  //                         messageId: item.id,
  //                         amount: amount,
  //                         addedBy: 'elderly_user',
  //                       });
  //                       const elderName =
  //                         currentUserRole === 'elderly_user'
  //                           ? currentUserName || 'Elder'
  //                           : peerUserName || 'Elder';
  //                       const providerName =
  //                         currentUserRole === 'service_provider'
  //                           ? currentUserName || 'Professional'
  //                           : peerUserName || 'Professional';
  //                       const base = Array.isArray(item.offers)
  //                         ? item.offers
  //                         : [];
  //                       const summary = buildOfferSummaryText({
  //                         serviceName: item.serviceName || 'service',
  //                         originalAmount: Number(item.originalAmount || 0),
  //                         initialQuote: Number(item.initialQuote || 0),
  //                         offers: [
  //                           ...base.map((o: any) => ({
  //                             amount: Number(o.amount),
  //                             addedBy: o.addedBy,
  //                           })),
  //                           {
  //                             amount: amount,
  //                             addedBy: 'elderly_user',
  //                           },
  //                         ],
  //                         elderName,
  //                         providerName,
  //                       });
  //                       await sendTextMessage({
  //                         threadId,
  //                         text: summary,
  //                         senderId: currentUserId,
  //                         receiverId: peerUserId,
  //                       });
  //                     } catch (error) {
  //                       console.log(
  //                         'Failed to save counter offer (negotiation card)',
  //                         error,
  //                       );
  //                       try {
  //                         const elderName =
  //                           currentUserRole === 'elderly_user'
  //                             ? currentUserName || 'Elder'
  //                             : peerUserName || 'Elder';
  //                         const providerName =
  //                           currentUserRole === 'service_provider'
  //                             ? currentUserName || 'Professional'
  //                             : peerUserName || 'Professional';
  //                         const base = Array.isArray(item.offers)
  //                           ? item.offers
  //                           : [];
  //                         const summary = buildOfferSummaryText({
  //                           serviceName: item.serviceName || 'service',
  //                           originalAmount: Number(item.originalAmount || 0),
  //                           initialQuote: Number(item.initialQuote || 0),
  //                           offers: [
  //                             ...base.map((o: any) => ({
  //                               amount: Number(o.amount),
  //                               addedBy: o.addedBy,
  //                             })),
  //                             {
  //                               amount: parseAmount(offerInputValue),
  //                               addedBy: 'elderly_user',
  //                             },
  //                           ],
  //                           elderName,
  //                           providerName,
  //                         });
  //                         await sendTextMessage({
  //                           threadId,
  //                           text: summary,
  //                           senderId: currentUserId,
  //                           receiverId: peerUserId,
  //                         });
  //                       } catch (e) {
  //                         console.log(
  //                           'Fallback send failed (elder negotiation card)',
  //                           e,
  //                         );
  //                       }
  //                     } finally {
  //                       setEditingForMessageId(null);
  //                       setOfferInputValue('');
  //                     }
  //                   }}>
  //                   <Text
  //                     size={getScaleSize(14)}
  //                     font={FONTS.Lato.SemiBold}
  //                     color={theme.white}>
  //                     Submit
  //                   </Text>
  //                 </TouchableOpacity>
  //                 <TouchableOpacity
  //                   style={styles(theme).actionButtonSecondary}
  //                   onPress={() => {
  //                     setEditingForMessageId(null);
  //                     setOfferInputValue('');
  //                   }}>
  //                   <Text
  //                     size={getScaleSize(14)}
  //                     font={FONTS.Lato.SemiBold}
  //                     color={theme.primary}>
  //                     Cancel
  //                   </Text>
  //                 </TouchableOpacity>
  //               </View>
  //             </View>
  //           )}
  //           {showProceed && (
  //             <TouchableOpacity
  //               style={[
  //                 styles(theme).actionButtonPrimary,
  //                 {marginTop: getScaleSize(8)},
  //               ]}
  //               onPress={() => {}}>
  //               <Text
  //                 size={getScaleSize(14)}
  //                 font={FONTS.Lato.SemiBold}
  //                 color={theme.white}>
  //                 Proceed
  //               </Text>
  //             </TouchableOpacity>
  //           )}
  //         </View>
  //         {isMe && (
  //           <Image
  //             style={styles(theme).userProfilePic}
  //             source={
  //               currentUserAvatar
  //                 ? {uri: currentUserAvatar}
  //                 : IMAGES.user_placeholder
  //             }
  //           />
  //         )}
  //       </View>
  //     );
  //   }
  //   const textStr = typeof item.text === 'string' ? item.text : '';
  //   const parseQuoteText = (txt: string) => {
  //     try {
  //       const header = txt.split(':\n')[0] || '';
  //       const originalVal = txt.match(
  //         /Original Valuation:\s*€\s*([0-9]+(?:\.[0-9]{1,2})?)/i,
  //       );
  //       const initialQuote = txt.match(
  //         /Initial Quote:\s*€\s*([0-9]+(?:\.[0-9]{1,2})?)/i,
  //       );
  //       const yourOfferLine = txt.match(
  //         /Your Offer:\s*€\s*([0-9]+(?:\.[0-9]{1,2})?)/i,
  //       );
  //       // Support summary messages that use "... Current Offer"
  //       const currentOfferMatches = Array.from(
  //         txt.matchAll(/Current Offer:\s*€\s*([0-9]+(?:\.[0-9]{1,2})?)/gi),
  //       );
  //       const currentOffer =
  //         currentOfferMatches.length > 0
  //           ? currentOfferMatches[currentOfferMatches.length - 1][1]
  //           : '';
  //       const yourOffer = yourOfferLine ? yourOfferLine[1] : currentOffer;
  //       const offersMatches = Array.from(
  //         txt.matchAll(
  //           /([^\n:]+?)[’']s\s+(Previous|Current)\s+Offer:\s*€\s*([0-9]+(?:\.[0-9]{1,2})?)/gi,
  //         ),
  //       );
  //       const offers = offersMatches.map(m => ({
  //         name: (m[1] || '').trim(),
  //         tag: (m[2] || '').trim(),
  //         amount: (m[3] || '').trim(),
  //       }));
  //       return {
  //         serviceName: header,
  //         originalValuation: originalVal ? originalVal[1] : '',
  //         initialQuote: initialQuote ? initialQuote[1] : '',
  //         yourOffer: yourOffer || '',
  //         offers,
  //       };
  //     } catch (e) {
  //       return {
  //         serviceName: '',
  //         originalValuation: '',
  //         initialQuote: '',
  //         yourOffer: '',
  //         offers: [],
  //       };
  //     }
  //   };
  //   const quoteParsed = parseQuoteText(textStr);
  //   const isOfferMessage =
  //     typeof textStr === 'string' &&
  //     /offer/i.test(textStr) &&
  //     /€\s*\d/.test(textStr);
  //   const canEditOffer =
  //     isRecipient && isOfferMessage && currentUserRole === 'service_provider';
  //   const isQuoteSummaryMessage =
  //     typeof textStr === 'string' &&
  //     textStr.includes('Original Valuation') &&
  //     textStr.includes('Initial Quote') &&
  //     (/Your Offer/i.test(textStr) || /Current Offer/i.test(textStr));

  //   return (
  //     <View
  //       style={[
  //         styles(theme).messageRow,
  //         isMe ? styles(theme).messageRowRight : styles(theme).messageRowLeft,
  //       ]}>
  //       {!isMe && (
  //         <Image
  //           style={styles(theme).userProfilePic}
  //           source={
  //             peerUserAvatar ? {uri: peerUserAvatar} : IMAGES.user_placeholder
  //           }
  //         />
  //       )}
  //       {isQuoteSummaryMessage ? (
  //         <View style={styles(theme).quoteCardContainer}>
  //           <Text
  //             size={getScaleSize(16)}
  //             font={FONTS.Lato.Bold}
  //             color={theme._323232}
  //             style={{marginBottom: getScaleSize(8)}}>
  //             {quoteParsed.serviceName || pricingBreakdown?.serviceName}
  //           </Text>
  //           <View style={styles(theme).pricingRow}>
  //             <Text
  //               size={getScaleSize(14)}
  //               font={FONTS.Lato.Medium}
  //               color={theme._6D6D6D}>
  //               Original Valuation
  //             </Text>
  //             <Text
  //               style={{marginLeft: getScaleSize(70)}}
  //               size={getScaleSize(16)}
  //               font={FONTS.Lato.Bold}
  //               color={theme._424242}>
  //               €
  //               {quoteParsed.originalValuation ||
  //                 pricingBreakdown?.originalValuation}
  //             </Text>
  //           </View>
  //           <View style={styles(theme).pricingRow}>
  //             <Text
  //               size={getScaleSize(14)}
  //               font={FONTS.Lato.Regular}
  //               color={theme._6D6D6D}>
  //               Initial Quote
  //             </Text>
  //             <Text
  //               style={{marginLeft: getScaleSize(70)}}
  //               size={getScaleSize(16)}
  //               font={FONTS.Lato.Bold}
  //               color={theme._424242}>
  //               €{quoteParsed.initialQuote || pricingBreakdown?.initialQuote}
  //             </Text>
  //           </View>
  //           {Array.isArray(quoteParsed.offers) &&
  //           quoteParsed.offers.length > 0 ? (
  //             quoteParsed.offers.map((o: any, idx: number) => (
  //               <View style={styles(theme).pricingRow} key={`offer-${idx}`}>
  //                 <Text
  //                   size={getScaleSize(14)}
  //                   font={FONTS.Lato.Regular}
  //                   color={theme._6D6D6D}>
  //                   {o.name}’s {o.tag} Offer
  //                 </Text>
  //                 <Text
  //                   style={{marginLeft: getScaleSize(70)}}
  //                   size={getScaleSize(16)}
  //                   font={FONTS.Lato.Bold}
  //                   color={theme._424242}>
  //                   €{o.amount}
  //                 </Text>
  //               </View>
  //             ))
  //           ) : (
  //             <View style={styles(theme).pricingRow}>
  //               <Text
  //                 size={getScaleSize(14)}
  //                 font={FONTS.Lato.Regular}
  //                 color={theme._6D6D6D}>
  //                 Your Offer
  //               </Text>
  //               <Text
  //                 style={{marginLeft: getScaleSize(70)}}
  //                 size={getScaleSize(16)}
  //                 font={FONTS.Lato.Bold}
  //                 color={theme._424242}>
  //                 €
  //                 {quoteParsed.yourOffer ||
  //                   offerAmount ||
  //                   pricingBreakdown?.yourOffer}
  //               </Text>
  //             </View>
  //           )}
  //           {isRecipient &&
  //             currentUserRole === 'service_provider' &&
  //             editingForMessageId !== item.id && (
  //               <TouchableOpacity
  //                 style={[
  //                   styles(theme).actionButtonSecondary,
  //                   {marginTop: getScaleSize(8)},
  //                 ]}
  //                 onPress={() => {
  //                   setOfferInputValue(
  //                     quoteParsed.yourOffer ||
  //                       String(
  //                         offerAmount || pricingBreakdown?.yourOffer || '',
  //                       ),
  //                   );
  //                   setEditingForMessageId(item.id);
  //                 }}>
  //                 <Text
  //                   align="center"
  //                   size={getScaleSize(12)}
  //                   font={FONTS.Lato.Medium}
  //                   color={theme.primary}>
  //                   Edit Offer
  //                 </Text>
  //               </TouchableOpacity>
  //             )}
  //           {isRecipient &&
  //             currentUserRole === 'service_provider' &&
  //             editingForMessageId === item.id && (
  //               <View style={{marginTop: getScaleSize(10)}}>
  //                 <View style={styles(theme).offerInputWrapper}>
  //                   <Text
  //                     size={getScaleSize(16)}
  //                     font={FONTS.Lato.Medium}
  //                     color={theme._424242}>
  //                     €
  //                   </Text>
  //                   <TextInput
  //                     value={offerInputValue}
  //                     onChangeText={setOfferInputValue}
  //                     style={styles(theme).offerTextInput}
  //                     placeholder="0.00"
  //                     placeholderTextColor={theme._ACADAD}
  //                     keyboardType="decimal-pad"
  //                   />
  //                 </View>
  //                 <View style={styles(theme).actionRow}>
  //                   <TouchableOpacity
  //                     style={styles(theme).actionButtonPrimary}
  //                     onPress={async () => {
  //                       if (
  //                         !threadId ||
  //                         !currentUserId ||
  //                         !peerUserId ||
  //                         !offerInputValue
  //                       ) {
  //                         return;
  //                       }
  //                       try {
  //                         const existingNegotiation = messages.find(
  //                           m =>
  //                             m.type === 'negotiation' &&
  //                             String((m as any).serviceId || '') ===
  //                               String(serviceIdParam || ''),
  //                         ) as any;
  //                         if (existingNegotiation) {
  //                           await appendNegotiationOffer({
  //                             threadId,
  //                             messageId: existingNegotiation.id,
  //                             amount: parseAmount(offerInputValue),
  //                             addedBy: 'service_provider',
  //                           });
  //                           const elderName =
  //                             currentUserRole === 'elderly_user'
  //                               ? currentUserName || 'Elder'
  //                               : peerUserName || 'Elder';
  //                           const providerName =
  //                             currentUserRole === 'service_provider'
  //                               ? currentUserName || 'Professional'
  //                               : peerUserName || 'Professional';
  //                           const base = Array.isArray(
  //                             existingNegotiation.offers,
  //                           )
  //                             ? existingNegotiation.offers
  //                             : [];
  //                           const summary = buildOfferSummaryText({
  //                             serviceName:
  //                               existingNegotiation.serviceName ||
  //                               quoteParsed.serviceName ||
  //                               pricingBreakdown?.serviceName ||
  //                               'service',
  //                             originalAmount:
  //                               existingNegotiation.originalAmount ??
  //                               Number(
  //                                 quoteParsed.originalValuation ||
  //                                   pricingBreakdown?.originalValuation ||
  //                                   0,
  //                               ),
  //                             initialQuote:
  //                               existingNegotiation.initialQuote ??
  //                               Number(
  //                                 quoteParsed.initialQuote ||
  //                                   pricingBreakdown?.initialQuote ||
  //                                   0,
  //                               ),
  //                             offers: [
  //                               ...base.map((o: any) => ({
  //                                 amount: Number(o.amount),
  //                                 addedBy: o.addedBy,
  //                               })),
  //                               {
  //                                 amount: parseAmount(offerInputValue),
  //                                 addedBy: 'service_provider',
  //                               },
  //                             ],
  //                             elderName,
  //                             providerName,
  //                           });
  //                           await sendTextMessage({
  //                             threadId,
  //                             text: summary,
  //                             senderId: currentUserId,
  //                             receiverId: peerUserId,
  //                           });
  //                         } else {
  //                           const elderPrev = Number(
  //                             quoteParsed.yourOffer ||
  //                               pricingBreakdown?.yourOffer ||
  //                               0,
  //                           );
  //                           if (elderPrev > 0) {
  //                             await createNegotiationMessage({
  //                               threadId,
  //                               senderId: currentUserId,
  //                               receiverId: peerUserId,
  //                               serviceId: String(serviceIdParam || ''),
  //                               serviceName:
  //                                 quoteParsed.serviceName ||
  //                                 pricingBreakdown?.serviceName,
  //                               originalAmount: Number(
  //                                 quoteParsed.originalValuation ||
  //                                   pricingBreakdown?.originalValuation ||
  //                                   0,
  //                               ),
  //                               initialQuote: Number(
  //                                 quoteParsed.initialQuote ||
  //                                   pricingBreakdown?.initialQuote ||
  //                                   0,
  //                               ),
  //                               firstOfferAmount: elderPrev,
  //                               addedBy: 'elderly_user',
  //                             });
  //                             const created = getExistingNegotiation() as any;
  //                             if (created?.id) {
  //                               await appendNegotiationOffer({
  //                                 threadId,
  //                                 messageId: created.id,
  //                                 amount: parseAmount(offerInputValue),
  //                                 addedBy: 'service_provider',
  //                               });
  //                             }
  //                           } else {
  //                             await createNegotiationMessage({
  //                               threadId,
  //                               senderId: currentUserId,
  //                               receiverId: peerUserId,
  //                               serviceId: String(serviceIdParam || ''),
  //                               serviceName:
  //                                 quoteParsed.serviceName ||
  //                                 pricingBreakdown?.serviceName,
  //                               originalAmount: Number(
  //                                 quoteParsed.originalValuation ||
  //                                   pricingBreakdown?.originalValuation ||
  //                                   0,
  //                               ),
  //                               initialQuote: Number(
  //                                 quoteParsed.initialQuote ||
  //                                   pricingBreakdown?.initialQuote ||
  //                                   0,
  //                               ),
  //                               firstOfferAmount: parseAmount(offerInputValue),
  //                               addedBy: 'service_provider',
  //                             });
  //                           }
  //                           const elderName =
  //                             currentUserRole === 'elderly_user'
  //                               ? currentUserName || 'Elder'
  //                               : peerUserName || 'Elder';
  //                           const providerName =
  //                             currentUserRole === 'service_provider'
  //                               ? currentUserName || 'Professional'
  //                               : peerUserName || 'Professional';
  //                           const summary = buildOfferSummaryText({
  //                             serviceName:
  //                               quoteParsed.serviceName ||
  //                               pricingBreakdown?.serviceName ||
  //                               'service',
  //                             originalAmount: Number(
  //                               quoteParsed.originalValuation ||
  //                                 pricingBreakdown?.originalValuation ||
  //                                 0,
  //                             ),
  //                             initialQuote: Number(
  //                               quoteParsed.initialQuote ||
  //                                 pricingBreakdown?.initialQuote ||
  //                                 0,
  //                             ),
  //                             offers: (() => {
  //                               const prev = Number(
  //                                 quoteParsed.yourOffer ||
  //                                   pricingBreakdown?.yourOffer ||
  //                                   0,
  //                               );
  //                               const arr: Array<{
  //                                 amount: number;
  //                                 addedBy: 'elderly_user' | 'service_provider';
  //                               }> = [];
  //                               if (prev > 0) {
  //                                 arr.push({
  //                                   amount: prev,
  //                                   addedBy: 'elderly_user',
  //                                 });
  //                               }
  //                               arr.push({
  //                                 amount: parseAmount(offerInputValue),
  //                                 addedBy: 'service_provider',
  //                               });
  //                               return arr;
  //                             })(),
  //                             elderName,
  //                             providerName,
  //                           });
  //                           await sendTextMessage({
  //                             threadId,
  //                             text: summary,
  //                             senderId: currentUserId,
  //                             receiverId: peerUserId,
  //                           });
  //                         }
  //                       } catch (error) {
  //                         console.log('Failed to save provider offer', error);
  //                         try {
  //                           const elderName =
  //                             currentUserRole === 'elderly_user'
  //                               ? currentUserName || 'Elder'
  //                               : peerUserName || 'Elder';
  //                           const providerName =
  //                             currentUserRole === 'service_provider'
  //                               ? currentUserName || 'Professional'
  //                               : peerUserName || 'Professional';
  //                           const summary = buildOfferSummaryText({
  //                             serviceName:
  //                               quoteParsed.serviceName ||
  //                               pricingBreakdown?.serviceName ||
  //                               'service',
  //                             originalAmount: Number(
  //                               quoteParsed.originalValuation ||
  //                                 pricingBreakdown?.originalValuation ||
  //                                 0,
  //                             ),
  //                             initialQuote: Number(
  //                               quoteParsed.initialQuote ||
  //                                 pricingBreakdown?.initialQuote ||
  //                                 0,
  //                             ),
  //                             offers: (() => {
  //                               const prev = Number(
  //                                 quoteParsed.yourOffer ||
  //                                   pricingBreakdown?.yourOffer ||
  //                                   0,
  //                               );
  //                               const arr: Array<{
  //                                 amount: number;
  //                                 addedBy: 'elderly_user' | 'service_provider';
  //                               }> = [];
  //                               if (prev > 0) {
  //                                 arr.push({
  //                                   amount: prev,
  //                                   addedBy: 'elderly_user',
  //                                 });
  //                               }
  //                               arr.push({
  //                                 amount: parseAmount(offerInputValue),
  //                                 addedBy: 'service_provider',
  //                               });
  //                               return arr;
  //                             })(),
  //                             elderName,
  //                             providerName,
  //                           });
  //                           await sendTextMessage({
  //                             threadId,
  //                             text: summary,
  //                             senderId: currentUserId,
  //                             receiverId: peerUserId,
  //                           });
  //                         } catch (e) {
  //                           console.log(
  //                             'Fallback send failed (provider offer)',
  //                             e,
  //                           );
  //                         }
  //                       } finally {
  //                         setEditingForMessageId(null);
  //                         setOfferInputValue('');
  //                       }
  //                     }}>
  //                     <Text
  //                       size={getScaleSize(14)}
  //                       font={FONTS.Lato.SemiBold}
  //                       color={theme.white}>
  //                       Submit
  //                     </Text>
  //                   </TouchableOpacity>
  //                   <TouchableOpacity
  //                     style={styles(theme).actionButtonSecondary}
  //                     onPress={() => {
  //                       setEditingForMessageId(null);
  //                       setOfferInputValue('');
  //                     }}>
  //                     <Text
  //                       size={getScaleSize(14)}
  //                       font={FONTS.Lato.SemiBold}
  //                       color={theme.primary}>
  //                       Cancel
  //                     </Text>
  //                   </TouchableOpacity>
  //                 </View>
  //               </View>
  //             )}
  //           {isRecipient &&
  //             currentUserRole === 'elderly_user' &&
  //             editingForMessageId !== item.id && (
  //               <View style={styles(theme).actionRow}>
  //                 <TouchableOpacity
  //                   style={styles(theme).actionButtonSecondary}
  //                   onPress={() => {
  //                     setOfferInputValue(quoteParsed.yourOffer || '');
  //                     setEditingForMessageId(item.id);
  //                   }}>
  //                   <Text
  //                     size={getScaleSize(14)}
  //                     font={FONTS.Lato.SemiBold}
  //                     color={theme.primary}>
  //                     Counter Offer
  //                   </Text>
  //                 </TouchableOpacity>
  //                 <TouchableOpacity
  //                   style={styles(theme).actionButtonPrimary}
  //                   onPress={async () => {
  //                     if (!threadId || !currentUserId || !peerUserId) {
  //                       return;
  //                     }
  //                     const latest = Number(quoteParsed.yourOffer || 0);
  //                     try {
  //                       let targetId: string | null = null;
  //                       const existingNegotiation = getExistingNegotiation();
  //                       if (existingNegotiation) {
  //                         targetId = existingNegotiation.id;
  //                       } else if (latest) {
  //                         await createNegotiationMessage({
  //                           threadId,
  //                           senderId: peerUserId,
  //                           receiverId: currentUserId,
  //                           serviceId: String(serviceIdParam || ''),
  //                           serviceName:
  //                             quoteParsed.serviceName ||
  //                             pricingBreakdown?.serviceName,
  //                           originalAmount: Number(
  //                             quoteParsed.originalValuation ||
  //                               pricingBreakdown?.originalValuation ||
  //                               0,
  //                           ),
  //                           initialQuote: Number(
  //                             quoteParsed.initialQuote ||
  //                               pricingBreakdown?.initialQuote ||
  //                               0,
  //                           ),
  //                           firstOfferAmount: latest,
  //                           addedBy: 'service_provider',
  //                         });
  //                         const created = getExistingNegotiation();
  //                         targetId = created?.id || null;
  //                       }
  //                       if (targetId) {
  //                         await acceptNegotiation({
  //                           threadId,
  //                           messageId: targetId,
  //                         });
  //                       }
  //                     } catch (error) {
  //                       console.log('Failed to accept negotiation', error);
  //                     }
  //                   }}>
  //                   <Text
  //                     size={getScaleSize(14)}
  //                     font={FONTS.Lato.SemiBold}
  //                     color={theme.white}>
  //                     Accept Offer
  //                   </Text>
  //                 </TouchableOpacity>
  //               </View>
  //             )}
  //           {isRecipient &&
  //             currentUserRole === 'elderly_user' &&
  //             editingForMessageId === item.id && (
  //               <View style={{marginTop: getScaleSize(10)}}>
  //                 <View style={styles(theme).offerInputWrapper}>
  //                   <Text
  //                     size={getScaleSize(16)}
  //                     font={FONTS.Lato.Medium}
  //                     color={theme._424242}>
  //                     €
  //                   </Text>
  //                   <TextInput
  //                     value={offerInputValue}
  //                     onChangeText={setOfferInputValue}
  //                     style={styles(theme).offerTextInput}
  //                     placeholder="0.00"
  //                     placeholderTextColor={theme._ACADAD}
  //                     keyboardType="decimal-pad"
  //                   />
  //                 </View>
  //                 <View style={styles(theme).actionRow}>
  //                   <TouchableOpacity
  //                     style={styles(theme).actionButtonPrimary}
  //                     onPress={async () => {
  //                       if (
  //                         !threadId ||
  //                         !currentUserId ||
  //                         !peerUserId ||
  //                         !offerInputValue
  //                       ) {
  //                         return;
  //                       }
  //                       try {
  //                         const parsed = String(offerInputValue)
  //                           .replace(/,/g, '.')
  //                           .replace(/[^0-9.]/g, '');
  //                         const amount = Number(parsed);
  //                         if (!isFinite(amount) || isNaN(amount)) {
  //                           return;
  //                         }
  //                         const existingNegotiation = messages.find(
  //                           m =>
  //                             m.type === 'negotiation' &&
  //                             String((m as any).serviceId || '') ===
  //                               String(serviceIdParam || ''),
  //                         ) as any;
  //                         if (existingNegotiation) {
  //                           await appendNegotiationOffer({
  //                             threadId,
  //                             messageId: existingNegotiation.id,
  //                             amount: amount,
  //                             addedBy: 'elderly_user',
  //                           });
  //                           const elderName =
  //                             currentUserRole === 'elderly_user'
  //                               ? currentUserName || 'Elder'
  //                               : peerUserName || 'Elder';
  //                           const providerName =
  //                             currentUserRole === 'service_provider'
  //                               ? currentUserName || 'Professional'
  //                               : peerUserName || 'Professional';
  //                           const base = Array.isArray(
  //                             existingNegotiation.offers,
  //                           )
  //                             ? existingNegotiation.offers
  //                             : [];
  //                           const summary = buildOfferSummaryText({
  //                             serviceName:
  //                               existingNegotiation.serviceName ||
  //                               pricingBreakdown?.serviceName ||
  //                               'service',
  //                             originalAmount:
  //                               existingNegotiation.originalAmount ??
  //                               Number(
  //                                 pricingBreakdown?.originalValuation || 0,
  //                               ),
  //                             initialQuote:
  //                               existingNegotiation.initialQuote ??
  //                               Number(pricingBreakdown?.initialQuote || 0),
  //                             offers: [
  //                               ...base.map((o: any) => ({
  //                                 amount: Number(o.amount),
  //                                 addedBy: o.addedBy,
  //                               })),
  //                               {
  //                                 amount: amount,
  //                                 addedBy: 'elderly_user',
  //                               },
  //                             ],
  //                             elderName,
  //                             providerName,
  //                           });
  //                           await sendTextMessage({
  //                             threadId,
  //                             text: summary,
  //                             senderId: currentUserId,
  //                             receiverId: peerUserId,
  //                           });
  //                         } else {
  //                           await createNegotiationMessage({
  //                             threadId,
  //                             senderId: currentUserId,
  //                             receiverId: peerUserId,
  //                             serviceId: String(serviceIdParam || ''),
  //                             serviceName:
  //                               quoteParsed.serviceName ||
  //                               pricingBreakdown?.serviceName,
  //                             originalAmount: Number(
  //                               quoteParsed.originalValuation ||
  //                                 pricingBreakdown?.originalValuation ||
  //                                 0,
  //                             ),
  //                             initialQuote: Number(
  //                               quoteParsed.initialQuote ||
  //                                 pricingBreakdown?.initialQuote ||
  //                                 0,
  //                             ),
  //                             firstOfferAmount: amount,
  //                             addedBy: 'elderly_user',
  //                           });
  //                           const elderName =
  //                             currentUserRole === 'elderly_user'
  //                               ? currentUserName || 'Elder'
  //                               : peerUserName || 'Elder';
  //                           const providerName =
  //                             currentUserRole === 'service_provider'
  //                               ? currentUserName || 'Professional'
  //                               : peerUserName || 'Professional';
  //                           const summary = buildOfferSummaryText({
  //                             serviceName:
  //                               quoteParsed.serviceName ||
  //                               pricingBreakdown?.serviceName ||
  //                               'service',
  //                             originalAmount: Number(
  //                               quoteParsed.originalValuation ||
  //                                 pricingBreakdown?.originalValuation ||
  //                                 0,
  //                             ),
  //                             initialQuote: Number(
  //                               quoteParsed.initialQuote ||
  //                                 pricingBreakdown?.initialQuote ||
  //                                 0,
  //                             ),
  //                             offers: [
  //                               {
  //                                 amount: amount,
  //                                 addedBy: 'elderly_user',
  //                               },
  //                             ],
  //                             elderName,
  //                             providerName,
  //                           });
  //                           await sendTextMessage({
  //                             threadId,
  //                             text: summary,
  //                             senderId: currentUserId,
  //                             receiverId: peerUserId,
  //                           });
  //                         }
  //                       } catch (error) {
  //                         console.log('Failed to save counter offer', error);
  //                         try {
  //                           const elderName =
  //                             currentUserRole === 'elderly_user'
  //                               ? currentUserName || 'Elder'
  //                               : peerUserName || 'Elder';
  //                           const providerName =
  //                             currentUserRole === 'service_provider'
  //                               ? currentUserName || 'Professional'
  //                               : peerUserName || 'Professional';
  //                           const maybeExisting = getExistingNegotiation();
  //                           const base =
  //                             (maybeExisting &&
  //                               Array.isArray(maybeExisting.offers) &&
  //                               maybeExisting.offers) ||
  //                             [];
  //                           const summary = buildOfferSummaryText({
  //                             serviceName:
  //                               quoteParsed.serviceName ||
  //                               pricingBreakdown?.serviceName ||
  //                               'service',
  //                             originalAmount: Number(
  //                               quoteParsed.originalValuation ||
  //                                 pricingBreakdown?.originalValuation ||
  //                                 0,
  //                             ),
  //                             initialQuote: Number(
  //                               quoteParsed.initialQuote ||
  //                                 pricingBreakdown?.initialQuote ||
  //                                 0,
  //                             ),
  //                             offers: [
  //                               ...base.map((o: any) => ({
  //                                 amount: Number(o.amount),
  //                                 addedBy: o.addedBy,
  //                               })),
  //                               {
  //                                 amount: parseAmount(offerInputValue),
  //                                 addedBy: 'elderly_user',
  //                               },
  //                             ],
  //                             elderName,
  //                             providerName,
  //                           });
  //                           await sendTextMessage({
  //                             threadId,
  //                             text: summary,
  //                             senderId: currentUserId,
  //                             receiverId: peerUserId,
  //                           });
  //                         } catch (e) {
  //                           console.log(
  //                             'Fallback send failed (elder quote)',
  //                             e,
  //                           );
  //                         }
  //                       } finally {
  //                         setEditingForMessageId(null);
  //                         setOfferInputValue('');
  //                       }
  //                     }}>
  //                     <Text
  //                       size={getScaleSize(14)}
  //                       font={FONTS.Lato.SemiBold}
  //                       color={theme.white}>
  //                       Submit
  //                     </Text>
  //                   </TouchableOpacity>
  //                   <TouchableOpacity
  //                     style={styles(theme).actionButtonSecondary}
  //                     onPress={() => {
  //                       setEditingForMessageId(null);
  //                       setOfferInputValue('');
  //                     }}>
  //                     <Text
  //                       size={getScaleSize(14)}
  //                       font={FONTS.Lato.SemiBold}
  //                       color={theme.primary}>
  //                       Cancel
  //                     </Text>
  //                   </TouchableOpacity>
  //                 </View>
  //               </View>
  //             )}
  //         </View>
  //       ) : (
  //         <View
  //           style={[
  //             styles(theme).messageContainer,
  //             isMe ? styles(theme).selfBubble : styles(theme).peerBubble,
  //           ]}>
  //           <Text
  //             size={getScaleSize(16)}
  //             font={FONTS.Lato.SemiBold}
  //             color={isMe ? theme.white : theme._818285}>
  //             {textStr}
  //           </Text>
  //           <Text
  //             size={getScaleSize(10)}
  //             font={FONTS.Lato.Regular}
  //             color={isMe ? theme.white : theme._ACADAD}
  //             style={[styles(theme).messageTime]}>
  //             {formatTimestamp(item.createdAt)}
  //           </Text>
  //           {canEditOffer && editingForMessageId !== item.id && (
  //             <TouchableOpacity
  //               style={styles(theme).editOfferButton}
  //               onPress={() => {
  //                 const match = textStr.match(/€\s*([0-9]+(?:\.[0-9]{1,2})?)/);
  //                 const existingAmount = match ? match[1] : '';
  //                 setOfferInputValue(existingAmount);
  //                 setEditingForMessageId(item.id);
  //               }}>
  //               <Text
  //                 size={getScaleSize(12)}
  //                 font={FONTS.Lato.SemiBold}
  //                 color={theme.primary}>
  //                 Edit Offer
  //               </Text>
  //             </TouchableOpacity>
  //           )}
  //           {canEditOffer && editingForMessageId === item.id && (
  //             <View style={{marginTop: getScaleSize(10)}}>
  //               <View style={styles(theme).offerInputWrapper}>
  //                 <Text
  //                   size={getScaleSize(16)}
  //                   font={FONTS.Lato.Medium}
  //                   color={theme._424242}>
  //                   €
  //                 </Text>
  //                 <TextInput
  //                   value={offerInputValue}
  //                   onChangeText={setOfferInputValue}
  //                   style={styles(theme).offerTextInput}
  //                   placeholder="0.00"
  //                   placeholderTextColor={theme._ACADAD}
  //                   keyboardType="decimal-pad"
  //                 />
  //               </View>
  //               <View style={styles(theme).actionRow}>
  //                 <TouchableOpacity
  //                   style={styles(theme).actionButtonPrimary}
  //                   onPress={async () => {
  //                     if (
  //                       !threadId ||
  //                       !currentUserId ||
  //                       !peerUserId ||
  //                       !offerInputValue
  //                     ) {
  //                       return;
  //                     }
  //                     try {
  //                       const existingNegotiation = getExistingNegotiation();
  //                       if (existingNegotiation) {
  //                         await appendNegotiationOffer({
  //                           threadId,
  //                           messageId: existingNegotiation.id,
  //                           amount: parseAmount(offerInputValue),
  //                           addedBy: 'service_provider',
  //                         });
  //                         const elderName =
  //                           currentUserRole === 'elderly_user'
  //                             ? currentUserName || 'Elder'
  //                             : peerUserName || 'Elder';
  //                         const providerName =
  //                           currentUserRole === 'service_provider'
  //                             ? currentUserName || 'Professional'
  //                             : peerUserName || 'Professional';
  //                         const base = Array.isArray(existingNegotiation.offers)
  //                           ? existingNegotiation.offers
  //                           : [];
  //                         const summary = buildOfferSummaryText({
  //                           serviceName:
  //                             existingNegotiation.serviceName ||
  //                             pricingBreakdown?.serviceName ||
  //                             'service',
  //                           originalAmount:
  //                             existingNegotiation.originalAmount ??
  //                             Number(pricingBreakdown?.originalValuation || 0),
  //                           initialQuote:
  //                             existingNegotiation.initialQuote ??
  //                             Number(pricingBreakdown?.initialQuote || 0),
  //                           offers: [
  //                             ...base.map((o: any) => ({
  //                               amount: Number(o.amount),
  //                               addedBy: o.addedBy,
  //                             })),
  //                             {
  //                               amount: parseAmount(offerInputValue),
  //                               addedBy: 'service_provider',
  //                             },
  //                           ],
  //                           elderName,
  //                           providerName,
  //                         });
  //                         await sendTextMessage({
  //                           threadId,
  //                           text: summary,
  //                           senderId: currentUserId,
  //                           receiverId: peerUserId,
  //                         });
  //                       } else {
  //                         const matchPrev = textStr.match(
  //                           /€\s*([0-9]+(?:\.[0-9]{1,2})?)/,
  //                         );
  //                         const elderPrev = matchPrev
  //                           ? Number(matchPrev[1])
  //                           : 0;
  //                         if (elderPrev > 0) {
  //                           await createNegotiationMessage({
  //                             threadId,
  //                             senderId: currentUserId,
  //                             receiverId: peerUserId,
  //                             serviceId: String(serviceIdParam || ''),
  //                             serviceName: pricingBreakdown?.serviceName,
  //                             originalAmount: Number(
  //                               pricingBreakdown?.originalValuation || 0,
  //                             ),
  //                             initialQuote: Number(
  //                               pricingBreakdown?.initialQuote || 0,
  //                             ),
  //                             firstOfferAmount: elderPrev,
  //                             addedBy: 'elderly_user',
  //                           });
  //                           const created = getExistingNegotiation() as any;
  //                           if (created?.id) {
  //                             await appendNegotiationOffer({
  //                               threadId,
  //                               messageId: created.id,
  //                               amount: parseAmount(offerInputValue),
  //                               addedBy: 'service_provider',
  //                             });
  //                           }
  //                         } else {
  //                           await createNegotiationMessage({
  //                             threadId,
  //                             senderId: currentUserId,
  //                             receiverId: peerUserId,
  //                             serviceId: String(serviceIdParam || ''),
  //                             serviceName: pricingBreakdown?.serviceName,
  //                             originalAmount: Number(
  //                               pricingBreakdown?.originalValuation || 0,
  //                             ),
  //                             initialQuote: Number(
  //                               pricingBreakdown?.initialQuote || 0,
  //                             ),
  //                             firstOfferAmount: parseAmount(offerInputValue),
  //                             addedBy: 'service_provider',
  //                           });
  //                         }
  //                         const elderName =
  //                           currentUserRole === 'elderly_user'
  //                             ? currentUserName || 'Elder'
  //                             : peerUserName || 'Elder';
  //                         const providerName =
  //                           currentUserRole === 'service_provider'
  //                             ? currentUserName || 'Professional'
  //                             : peerUserName || 'Professional';
  //                         const summary = buildOfferSummaryText({
  //                           serviceName:
  //                             pricingBreakdown?.serviceName || 'service',
  //                           originalAmount: Number(
  //                             pricingBreakdown?.originalValuation || 0,
  //                           ),
  //                           initialQuote: Number(
  //                             pricingBreakdown?.initialQuote || 0,
  //                           ),
  //                           offers: (() => {
  //                             const matchPrevLocal = textStr.match(
  //                               /€\s*([0-9]+(?:\.[0-9]{1,2})?)/,
  //                             );
  //                             const prevVal = matchPrevLocal
  //                               ? Number(matchPrevLocal[1])
  //                               : 0;
  //                             const arr: Array<{
  //                               amount: number;
  //                               addedBy: 'elderly_user' | 'service_provider';
  //                             }> = [];
  //                             if (prevVal > 0) {
  //                               arr.push({
  //                                 amount: prevVal,
  //                                 addedBy: 'elderly_user',
  //                               });
  //                             }
  //                             arr.push({
  //                               amount: parseAmount(offerInputValue),
  //                               addedBy: 'service_provider',
  //                             });
  //                             return arr;
  //                           })(),
  //                           elderName,
  //                           providerName,
  //                         });
  //                         await sendTextMessage({
  //                           threadId,
  //                           text: summary,
  //                           senderId: currentUserId,
  //                           receiverId: peerUserId,
  //                         });
  //                       }
  //                     } catch (error) {
  //                       console.log('Failed to save edited offer', error);
  //                       try {
  //                         const elderName =
  //                           currentUserRole === 'elderly_user'
  //                             ? currentUserName || 'Elder'
  //                             : peerUserName || 'Elder';
  //                         const providerName =
  //                           currentUserRole === 'service_provider'
  //                             ? currentUserName || 'Professional'
  //                             : peerUserName || 'Professional';
  //                         const summary = buildOfferSummaryText({
  //                           serviceName:
  //                             pricingBreakdown?.serviceName || 'service',
  //                           originalAmount: Number(
  //                             pricingBreakdown?.originalValuation || 0,
  //                           ),
  //                           initialQuote: Number(
  //                             pricingBreakdown?.initialQuote || 0,
  //                           ),
  //                           offers: (() => {
  //                             const matchPrevLocal = textStr.match(
  //                               /€\s*([0-9]+(?:\.[0-9]{1,2})?)/,
  //                             );
  //                             const prevVal = matchPrevLocal
  //                               ? Number(matchPrevLocal[1])
  //                               : 0;
  //                             const arr: Array<{
  //                               amount: number;
  //                               addedBy: 'elderly_user' | 'service_provider';
  //                             }> = [];
  //                             if (prevVal > 0) {
  //                               arr.push({
  //                                 amount: prevVal,
  //                                 addedBy: 'elderly_user',
  //                               });
  //                             }
  //                             arr.push({
  //                               amount: parseAmount(offerInputValue),
  //                               addedBy: 'service_provider',
  //                             });
  //                             return arr;
  //                           })(),
  //                           elderName,
  //                           providerName,
  //                         });
  //                         await sendTextMessage({
  //                           threadId,
  //                           text: summary,
  //                           senderId: currentUserId,
  //                           receiverId: peerUserId,
  //                         });
  //                       } catch (e) {
  //                         console.log(
  //                           'Fallback send failed (provider plain)',
  //                           e,
  //                         );
  //                       }
  //                     } finally {
  //                       setEditingForMessageId(null);
  //                       setOfferInputValue('');
  //                     }
  //                   }}>
  //                   <Text
  //                     size={getScaleSize(14)}
  //                     font={FONTS.Lato.SemiBold}
  //                     color={theme.white}>
  //                     Submit
  //                   </Text>
  //                 </TouchableOpacity>
  //                 <TouchableOpacity
  //                   style={styles(theme).actionButtonSecondary}
  //                   onPress={() => {
  //                     setEditingForMessageId(null);
  //                     setOfferInputValue('');
  //                   }}>
  //                   <Text
  //                     size={getScaleSize(14)}
  //                     font={FONTS.Lato.SemiBold}
  //                     color={theme.primary}>
  //                     Cancel
  //                   </Text>
  //                 </TouchableOpacity>
  //               </View>
  //             </View>
  //           )}
  //           {isRecipient &&
  //             currentUserRole === 'elderly_user' &&
  //             editingForMessageId !== item.id &&
  //             isOfferMessage && (
  //               <View style={styles(theme).actionRow}>
  //                 <TouchableOpacity
  //                   style={styles(theme).actionButtonSecondary}
  //                   onPress={() => {
  //                     const match = textStr.match(
  //                       /€\s*([0-9]+(?:\.[0-9]{1,2})?)/,
  //                     );
  //                     const existingAmount = match ? match[1] : '';
  //                     setOfferInputValue(existingAmount);
  //                     setEditingForMessageId(item.id);
  //                   }}>
  //                   <Text
  //                     size={getScaleSize(14)}
  //                     font={FONTS.Lato.SemiBold}
  //                     color={theme.primary}>
  //                     Counter Offer
  //                   </Text>
  //                 </TouchableOpacity>
  //                 <TouchableOpacity
  //                   style={styles(theme).actionButtonPrimary}
  //                   onPress={async () => {
  //                     if (!threadId || !currentUserId || !peerUserId) {
  //                       return;
  //                     }
  //                     const match = textStr.match(
  //                       /€\s*([0-9]+(?:\.[0-9]{1,2})?)/,
  //                     );
  //                     const latest = match ? Number(match[1]) : 0;
  //                     try {
  //                       let targetId: string | null = null;
  //                       const existingNegotiation = getExistingNegotiation();
  //                       if (existingNegotiation) {
  //                         targetId = existingNegotiation.id;
  //                       } else if (latest) {
  //                         await createNegotiationMessage({
  //                           threadId,
  //                           senderId: peerUserId,
  //                           receiverId: currentUserId,
  //                           serviceId: String(serviceIdParam || ''),
  //                           serviceName: pricingBreakdown?.serviceName,
  //                           originalAmount: Number(
  //                             pricingBreakdown?.originalValuation || 0,
  //                           ),
  //                           initialQuote: Number(
  //                             pricingBreakdown?.initialQuote || 0,
  //                           ),
  //                           firstOfferAmount: latest,
  //                           addedBy: 'service_provider',
  //                         });
  //                         const created = getExistingNegotiation();
  //                         targetId = created?.id || null;
  //                       }
  //                       if (targetId) {
  //                         await acceptNegotiation({
  //                           threadId,
  //                           messageId: targetId,
  //                         });
  //                       }
  //                     } catch (error) {
  //                       console.log('Failed to accept negotiation', error);
  //                     }
  //                   }}>
  //                   <Text
  //                     size={getScaleSize(14)}
  //                     font={FONTS.Lato.SemiBold}
  //                     color={theme.white}>
  //                     Accept Offer
  //                   </Text>
  //                 </TouchableOpacity>
  //               </View>
  //             )}
  //           {isRecipient &&
  //             currentUserRole === 'elderly_user' &&
  //             editingForMessageId === item.id &&
  //             isOfferMessage && (
  //               <View style={{marginTop: getScaleSize(10)}}>
  //                 <View style={styles(theme).offerInputWrapper}>
  //                   <Text
  //                     size={getScaleSize(16)}
  //                     font={FONTS.Lato.Medium}
  //                     color={theme._424242}>
  //                     €
  //                   </Text>
  //                   <TextInput
  //                     value={offerInputValue}
  //                     onChangeText={setOfferInputValue}
  //                     style={styles(theme).offerTextInput}
  //                     placeholder="0.00"
  //                     placeholderTextColor={theme._ACADAD}
  //                     keyboardType="decimal-pad"
  //                   />
  //                 </View>
  //                 <View style={styles(theme).actionRow}>
  //                   <TouchableOpacity
  //                     style={styles(theme).actionButtonPrimary}
  //                     onPress={async () => {
  //                       if (
  //                         !threadId ||
  //                         !currentUserId ||
  //                         !peerUserId ||
  //                         !offerInputValue
  //                       ) {
  //                         return;
  //                       }
  //                       try {
  //                         const parsed = String(offerInputValue)
  //                           .replace(/,/g, '.')
  //                           .replace(/[^0-9.]/g, '');
  //                         const amount = Number(parsed);
  //                         if (!isFinite(amount) || isNaN(amount)) {
  //                           return;
  //                         }
  //                         const existingNegotiation = messages.find(
  //                           m =>
  //                             m.type === 'negotiation' &&
  //                             String((m as any).serviceId || '') ===
  //                               String(serviceIdParam || ''),
  //                         ) as any;
  //                         if (existingNegotiation) {
  //                           await appendNegotiationOffer({
  //                             threadId,
  //                             messageId: existingNegotiation.id,
  //                             amount: amount,
  //                             addedBy: 'elderly_user',
  //                           });
  //                           const elderName =
  //                             currentUserRole === 'elderly_user'
  //                               ? currentUserName || 'Elder'
  //                               : peerUserName || 'Elder';
  //                           const providerName =
  //                             currentUserRole === 'service_provider'
  //                               ? currentUserName || 'Professional'
  //                               : peerUserName || 'Professional';
  //                           const base = Array.isArray(
  //                             existingNegotiation.offers,
  //                           )
  //                             ? existingNegotiation.offers
  //                             : [];
  //                           const summary = buildOfferSummaryText({
  //                             serviceName:
  //                               existingNegotiation.serviceName ||
  //                               pricingBreakdown?.serviceName ||
  //                               'service',
  //                             originalAmount:
  //                               existingNegotiation.originalAmount ??
  //                               Number(
  //                                 pricingBreakdown?.originalValuation || 0,
  //                               ),
  //                             initialQuote:
  //                               existingNegotiation.initialQuote ??
  //                               Number(pricingBreakdown?.initialQuote || 0),
  //                             offers: [
  //                               ...base.map((o: any) => ({
  //                                 amount: Number(o.amount),
  //                                 addedBy: o.addedBy,
  //                               })),
  //                               {
  //                                 amount: amount,
  //                                 addedBy: 'elderly_user',
  //                               },
  //                             ],
  //                             elderName,
  //                             providerName,
  //                           });
  //                           await sendTextMessage({
  //                             threadId,
  //                             text: summary,
  //                             senderId: currentUserId,
  //                             receiverId: peerUserId,
  //                           });
  //                         } else {
  //                           await createNegotiationMessage({
  //                             threadId,
  //                             senderId: currentUserId,
  //                             receiverId: peerUserId,
  //                             serviceId: String(serviceIdParam || ''),
  //                             serviceName: pricingBreakdown?.serviceName,
  //                             originalAmount: Number(
  //                               pricingBreakdown?.originalValuation || 0,
  //                             ),
  //                             initialQuote: Number(
  //                               pricingBreakdown?.initialQuote || 0,
  //                             ),
  //                             firstOfferAmount: amount,
  //                             addedBy: 'elderly_user',
  //                           });
  //                           const elderName =
  //                             currentUserRole === 'elderly_user'
  //                               ? currentUserName || 'Elder'
  //                               : peerUserName || 'Elder';
  //                           const providerName =
  //                             currentUserRole === 'service_provider'
  //                               ? currentUserName || 'Professional'
  //                               : peerUserName || 'Professional';
  //                           const maybeExisting = getExistingNegotiation();
  //                           const base =
  //                             (maybeExisting &&
  //                               Array.isArray(maybeExisting.offers) &&
  //                               maybeExisting.offers) ||
  //                             [];
  //                           const summary = buildOfferSummaryText({
  //                             serviceName:
  //                               pricingBreakdown?.serviceName || 'service',
  //                             originalAmount: Number(
  //                               pricingBreakdown?.originalValuation || 0,
  //                             ),
  //                             initialQuote: Number(
  //                               pricingBreakdown?.initialQuote || 0,
  //                             ),
  //                             offers: [
  //                               ...base.map((o: any) => ({
  //                                 amount: Number(o.amount),
  //                                 addedBy: o.addedBy,
  //                               })),
  //                               {
  //                                 amount: parseAmount(offerInputValue),
  //                                 addedBy: 'elderly_user',
  //                               },
  //                             ],
  //                             elderName,
  //                             providerName,
  //                           });
  //                           await sendTextMessage({
  //                             threadId,
  //                             text: summary,
  //                             senderId: currentUserId,
  //                             receiverId: peerUserId,
  //                           });
  //                         }
  //                       } catch (error) {
  //                         console.log('Failed to save counter offer', error);
  //                         try {
  //                           const elderName =
  //                             currentUserRole === 'elderly_user'
  //                               ? currentUserName || 'Elder'
  //                               : peerUserName || 'Elder';
  //                           const providerName =
  //                             currentUserRole === 'service_provider'
  //                               ? currentUserName || 'Professional'
  //                               : peerUserName || 'Professional';
  //                           const summary = buildOfferSummaryText({
  //                             serviceName:
  //                               pricingBreakdown?.serviceName || 'service',
  //                             originalAmount: Number(
  //                               pricingBreakdown?.originalValuation || 0,
  //                             ),
  //                             initialQuote: Number(
  //                               pricingBreakdown?.initialQuote || 0,
  //                             ),
  //                             offers: [
  //                               {
  //                                 amount: parseAmount(offerInputValue),
  //                                 addedBy: 'elderly_user',
  //                               },
  //                             ],
  //                             elderName,
  //                             providerName,
  //                           });
  //                           await sendTextMessage({
  //                             threadId,
  //                             text: summary,
  //                             senderId: currentUserId,
  //                             receiverId: peerUserId,
  //                           });
  //                         } catch (e) {
  //                           console.log(
  //                             'Fallback send failed (elder plain bubble)',
  //                             e,
  //                           );
  //                         }
  //                       } finally {
  //                         setEditingForMessageId(null);
  //                         setOfferInputValue('');
  //                       }
  //                     }}>
  //                     <Text
  //                       size={getScaleSize(14)}
  //                       font={FONTS.Lato.SemiBold}
  //                       color={theme.white}>
  //                       Submit
  //                     </Text>
  //                   </TouchableOpacity>
  //                   <TouchableOpacity
  //                     style={styles(theme).actionButtonSecondary}
  //                     onPress={() => {
  //                       setEditingForMessageId(null);
  //                       setOfferInputValue('');
  //                     }}>
  //                     <Text
  //                       size={getScaleSize(14)}
  //                       font={FONTS.Lato.SemiBold}
  //                       color={theme.primary}>
  //                       Cancel
  //                     </Text>
  //                   </TouchableOpacity>
  //                 </View>
  //               </View>
  //             )}
  //         </View>
  //       )}
  //       {isMe && (
  //         <Image
  //           style={styles(theme).userProfilePic}
  //           source={
  //             currentUserAvatar
  //               ? {uri: currentUserAvatar}
  //               : IMAGES.user_placeholder
  //           }
  //         />
  //       )}
  //     </View>
  //   );
  // };

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
    </KeyboardAvoidingView>
  );
}

// const formatTimestamp = (
//   timestamp?: FirebaseFirestoreTypes.Timestamp | null,
// ) => {
//   if (!timestamp) {
//     return '';
//   }
//   const date = timestamp.toDate
//     ? timestamp.toDate()
//     : new Date(timestamp as any);
//   return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
// };

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
