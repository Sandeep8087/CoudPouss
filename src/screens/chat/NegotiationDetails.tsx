import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { ThemeContext, ThemeContextType, AuthContext } from '../../context';

//CONSTANT
import { formatDecimalInput, getScaleSize, SHOW_TOAST, useString } from '../../constant';

//COMPONENT
import { Text } from '../../components';

//PACKAGES
import { useFocusEffect } from '@react-navigation/native';
import {
  acceptNegotiation,
  messagesListThread,
  removeDocument,
  removeThread,
  userNegotiationMessage,
} from '../../services/negotiationchat';
import { API } from '../../api';
import RBSheet from 'react-native-raw-bottom-sheet';

export default function NegotiationDetails(props: any) {
  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);
  const { profile } = useContext<any>(AuthContext);
  const peerUser = props?.route?.params?.peerUser;
  // const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loading, setLoading] = useState(false);
  // const [isSending, setIsSending] = useState(false);
  const mediaPickerSheetRef = useRef<any>(null);

  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [selectedNegotiation, setSelectedNegotiation] = useState<any>(null);
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
      console.log('querySnapshot', querySnapshot.docs);
      const formattedMessages = querySnapshot.docs.map((doc: any) => {
        return {
          _id: doc.id,
          text: '',
          createdAt: Date.now(),
          ...doc.data(),
        };
      });
      setLoadingMessages(false);
      console.log('formattedMessages==>', formattedMessages);
      setMessages(formattedMessages.reverse());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const closeSheet = () => {
    mediaPickerSheetRef.current?.close();
  };

  async function getServiceDetails(selectedNegotiation: any) {
    try {
      const params = {
        service_id: selectedNegotiation?.serviceId,
      };
      setLoading(true);
      const result = await API.Instance.post(
        API.API_ROUTES.getServiceDetails,
        params,
      );
      setLoading(false);
      if (result.status) {
        createNegotiationMessage(
          selectedNegotiation.serviceId,
          result?.data?.data?.quote_id,
          Number(selectedNegotiation.negotiation.currentAmount),
          selectedNegotiation._id,
        );
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
      }
    } catch (error: any) {
      setLoading(false);
      SHOW_TOAST(error?.message ?? '', 'error');
      console.log(error?.message);
    } finally {
      setLoading(false);
    }
  }

  async function createNegotiationMessage(
    services_id: string,
    quote_id: string,
    negotiation_amount: number,
    messageId: string,
  ) {
    try {
      const payload: any = {
        services_id: services_id,
        quote_id: quote_id,
        description: '',
        negotiation_amount: negotiation_amount,
      };

      setLoading(true);
      const result = await API.Instance.post(
        API.API_ROUTES.createNegotiationChat,
        payload,
      );
      setLoading(false);
      if (result.status) {
        acceptNegotiation(commanId, messageId);
        // removeDocument(profile?.user?.id, commanId);
        // removeDocument(peerUserId, commanId);
        // removeThread(commanId);
        props.navigation.goBack();
      } else {
        console.log('result error', result);
        SHOW_TOAST(result?.data?.message, 'error');
      }
    } catch (error: any) {
      setLoading(false);
      SHOW_TOAST(error?.message ?? '', 'error');
      console.log(error?.message);
    } finally {
      setLoading(false);
    }
  }

  const renderMessage = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'NEGOTIATION':
        // const isMe = item.senderId === profile?.user?.id;
        const isMe = item.negotiation.currentTurn === profile?.user?.id;
        const isServiceProvider = profile?.user?.role === 'service_provider';

        const latestNegotiationMessage = messages
          ?.filter(msg => msg?.type === 'NEGOTIATION')
          ?.sort((a: any, b: any) => b?.createdAt - a?.createdAt)[0];

        const isLatest = latestNegotiationMessage?._id === item._id;

        const isFinalized =
          item.negotiation.status === 'ACCEPTED' ||
          item.negotiation.status === 'REJECTED';

        const lastOffer =
          item.negotiation.offers?.[item.negotiation.offers.length - 1];

        const isMyTurn =
          !isFinalized &&
          isLatest &&
          item.negotiation.currentTurn === profile?.user?.id &&
          lastOffer?.by !== profile?.user?.id;

        // const canCounter = isMyTurn && !isFinalized;
        // const canAccept = isCustomer && isMyTurn && !isFinalized;
        // const canCancel = isProfessional && isMyTurn && !isFinalized;

        // return isLatest ? (
        //   <View
        //     style={
        //       profile?.user?.role === 'service_provider'
        //         ? styles(theme).negotiationCard
        //         : styles(theme).quoteCardContainer
        //     }>
        //     <Text
        //       size={getScaleSize(16)}
        //       font={FONTS.Lato.Bold}
        //       color={theme._323232}>
        //       {item.negotiation.serviceName}
        //     </Text>
        //     {item.negotiation?.offers.map((offer: any) => {
        //       return (
        //         <View style={styles(theme).pricingRow}>
        //           {offer.label === 'ORIGINAL_VALUATION' ? (
        //             <Text
        //               style={{flex: 1}}
        //               size={getScaleSize(14)}
        //               font={FONTS.Lato.Medium}
        //               color={theme._6D6D6D}>
        //               {'Original Valuation :'}
        //             </Text>
        //           ) : offer.label === 'PROVIDER_QUOTE' ? (
        //             <Text
        //               style={{flex: 1}}
        //               size={getScaleSize(14)}
        //               font={FONTS.Lato.Medium}
        //               color={theme._6D6D6D}>
        //               {'Initial Quote :'}
        //             </Text>
        //           ) : (
        //             <Text
        //               style={{flex: 1}}
        //               size={getScaleSize(14)}
        //               font={FONTS.Lato.Medium}
        //               color={theme._6D6D6D}>
        //               {offer.userName === profile?.user?.first_name
        //                 ? 'Your Previous Offer'
        //                 : offer.userName + ' Current Offer'}
        //             </Text>
        //           )}

        //           <Text
        //             size={getScaleSize(16)}
        //             font={FONTS.Lato.Bold}
        //             color={theme._424242}>
        //             €{offer.amount}
        //           </Text>
        //         </View>
        //       );
        //     })}
        //     {isMe &&
        //       item?.negotiation?.status === 'PENDING' &&
        //       (profile?.user?.role === 'service_provider' ? (
        //         <View>
        //           {!editingForMessageId && (
        //             <TouchableOpacity
        //               style={styles(theme).editOfferButton}
        //               onPress={() => {
        //                 setEditingForMessageId(!editingForMessageId);
        //               }}>
        //               <Text
        //                 size={getScaleSize(14)}
        //                 font={FONTS.Lato.SemiBold}
        //                 color={theme.primary}>
        //                 {STRING.edit_offer}
        //               </Text>
        //             </TouchableOpacity>
        //           )}

        //           {editingForMessageId && (
        //             <View>
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
        //                   disabled={buttonDisabled}
        //                   onPress={async () => {
        //                     if (!offerInputValue.trim()) {
        //                       SHOW_TOAST(
        //                         'Please enter an offer amount',
        //                         'error',
        //                       );
        //                       return;
        //                     }

        //                     setButtonDisabled(true);
        //                     const updatedNegotiation = {
        //                       ...item.negotiation,
        //                       currentAmount: offerInputValue,
        //                       currentTurn: peerUserId,
        //                       offers: [
        //                         ...item.negotiation.offers,

        //                         {
        //                           amount: offerInputValue.toString(),
        //                           by: profile?.user?.id,
        //                           label: 'EDITED',
        //                           createdAt: Date.now(),
        //                           userName: profile?.user?.first_name,
        //                         },
        //                       ],
        //                     };

        //                     userNegotiationMessage(
        //                       item.serviceId,
        //                       item.serviceName,
        //                       item.servicePhoto,
        //                       profile?.user?.id,
        //                       profile?.user?.first_name,
        //                       peerUserId,
        //                       peerUserName,
        //                       commanId,
        //                       {
        //                         type: 'NEGOTIATION',
        //                         text: `My revised offer is €${offerInputValue}`,
        //                         negotiation: updatedNegotiation,
        //                       },
        //                       peerUserAvatar ?? '',
        //                       profile?.user?.profile_photo_url || '',
        //                     );
        //                     setEditingForMessageId(false);
        //                     setOfferInputValue('');
        //                     setButtonDisabled(false);
        //                   }}>
        //                   <Text
        //                     size={getScaleSize(14)}
        //                     font={FONTS.Lato.SemiBold}
        //                     color={theme.white}>
        //                     Submit
        //                   </Text>
        //                 </TouchableOpacity>
        //                 <View style={{width: getScaleSize(12)}} />
        //                 <TouchableOpacity
        //                   style={styles(theme).actionButtonSecondary}
        //                   onPress={() => {
        //                     setEditingForMessageId(false);
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
        //         </View>
        //       ) : profile?.user?.role === 'elderly_user' ? (
        //         <View>
        //           {!editingForMessageId && (
        //             <View style={styles(theme).actionRow}>
        //               <TouchableOpacity
        //                 style={styles(theme).actionButtonSecondary}
        //                 onPress={() => {
        //                   setEditingForMessageId(true);
        //                 }}>
        //                 <Text
        //                   size={getScaleSize(14)}
        //                   font={FONTS.Lato.SemiBold}
        //                   color={theme.primary}>
        //                   {STRING.counter_offer}
        //                 </Text>
        //               </TouchableOpacity>
        //               <TouchableOpacity
        //                 style={styles(theme).actionButtonPrimary}
        //                 onPress={async () => {
        //                   mediaPickerSheetRef.current?.open();
        //                   setSelectedNegotiation(item);
        //                 }}>
        //                 <Text
        //                   size={getScaleSize(14)}
        //                   font={FONTS.Lato.SemiBold}
        //                   color={theme.white}>
        //                   {STRING.accept_offer}
        //                 </Text>
        //               </TouchableOpacity>
        //             </View>
        //           )}
        //           {editingForMessageId && (
        //             <View>
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
        //                   disabled={buttonDisabled}
        //                   onPress={async () => {
        //                     if (!offerInputValue.trim()) {
        //                       SHOW_TOAST(
        //                         STRING.please_enter_an_offer_amount,
        //                         'error',
        //                       );
        //                       return;
        //                     }
        //                     setButtonDisabled(true);
        //                     const newOffer = {
        //                       amount: offerInputValue.toString(),
        //                       by: profile?.user?.id,
        //                       label: 'COUNTER', // or ACCEPTED / REJECTED
        //                       createdAt: Date.now(),
        //                       userName: profile?.user?.first_name,
        //                     };
        //                     console.log('newOffer', newOffer);
        //                     const updatedNegotiation = {
        //                       ...item.negotiation,
        //                       currentAmount: offerInputValue,
        //                       currentTurn: peerUserId,
        //                       offers: [...item.negotiation.offers, newOffer],
        //                     };
        //                     console.log(
        //                       'updatedNegotiation',
        //                       updatedNegotiation,
        //                     );
        //                     userNegotiationMessage(
        //                       item.serviceId,
        //                       item.serviceName,
        //                       item.servicePhoto,
        //                       profile?.user?.id,
        //                       profile?.user?.first_name,
        //                       peerUserId,
        //                       peerUserName,
        //                       commanId,
        //                       {
        //                         type: 'NEGOTIATION',
        //                         text: `My revised offer is €${offerInputValue}`,
        //                         negotiation: updatedNegotiation,
        //                       },
        //                       profile?.user?.profile_photo_url || '',
        //                       peerUserAvatar ?? '',
        //                     );
        //                     console.log('message sent');

        //                     setEditingForMessageId(false);

        //                     setOfferInputValue('');
        //                     setButtonDisabled(false);
        //                   }}>
        //                   <Text
        //                     size={getScaleSize(14)}
        //                     font={FONTS.Lato.SemiBold}
        //                     color={theme.white}>
        //                     {STRING.Submit}
        //                   </Text>
        //                 </TouchableOpacity>
        //                 <View style={{width: getScaleSize(12)}} />
        //                 <TouchableOpacity
        //                   style={styles(theme).actionButtonSecondary}
        //                   onPress={() => {
        //                     setEditingForMessageId(false);
        //                     setOfferInputValue('');
        //                   }}>
        //                   <Text
        //                     size={getScaleSize(14)}
        //                     font={FONTS.Lato.SemiBold}
        //                     color={theme.primary}>
        //                     {STRING.Cancel}
        //                   </Text>
        //                 </TouchableOpacity>
        //               </View>
        //             </View>
        //           )}
        //         </View>
        //       ) : null)}
        //   </View>
        // ) : (
        return (
          <View
            style={
              isServiceProvider
                ? isMe
                  ? styles(theme).quoteCardContainer
                  : styles(theme).negotiationCard
                : isMe
                  ? styles(theme).negotiationCard
                  : styles(theme).quoteCardContainer
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
                      style={{ flex: 1 }}
                      size={getScaleSize(14)}
                      font={FONTS.Lato.Medium}
                      color={theme._6D6D6D}>
                      {`${STRING.original_valuation} : `}
                    </Text>
                  ) : offer.label === 'PROVIDER_QUOTE' ? (
                    <Text
                      style={{ flex: 1 }}
                      size={getScaleSize(14)}
                      font={FONTS.Lato.Medium}
                      color={theme._6D6D6D}>
                      {`${STRING.initial_quote} : `}
                    </Text>
                  ) : (
                    <Text
                      style={{ flex: 1, marginRight: getScaleSize(8)}}
                      size={getScaleSize(14)}
                      font={FONTS.Lato.Medium}
                      color={theme._6D6D6D}>
                      {offer.userName === profile?.user?.first_name
                        ? STRING.your_previous_offer
                        : `${offer.userName} ${STRING.current_offer}`}
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
            {isMyTurn &&
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
                        {STRING.edit_offer}
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
                          onChangeText={(text) => {
                            setOfferInputValue(formatDecimalInput(text))
                          }}
                          style={styles(theme).offerTextInput}
                          placeholder="0.00"
                          placeholderTextColor={theme._ACADAD}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <View style={[styles(theme).actionRow,{alignSelf: 'flex-end'}]}>
                        <TouchableOpacity
                          style={[styles(theme).actionButtonPrimary,{paddingHorizontal: getScaleSize(14)}]}
                          disabled={buttonDisabled}
                          onPress={async () => {
                            if (!offerInputValue.trim()) {
                              SHOW_TOAST(STRING.please_enter_an_offer_amount, 'error')
                              return;
                            }

                            setButtonDisabled(true);
                            const updatedNegotiation = {
                              ...item.negotiation,
                              currentAmount: offerInputValue,
                              currentTurn: peerUserId,
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
                                text: `${STRING.my_revised_offer_is} €${offerInputValue}`,
                                negotiation: updatedNegotiation,
                              },
                              profile?.user?.profile_photo_url || '',
                              peerUserAvatar ?? '',
                            );
                            setEditingForMessageId(false);
                            setOfferInputValue('');
                            setButtonDisabled(false);
                          }}>
                          <Text
                            size={getScaleSize(14)}
                            font={FONTS.Lato.SemiBold}
                            color={theme.white}>
                            {STRING.Submit}
                          </Text>
                        </TouchableOpacity>
                        <View style={{ width: getScaleSize(8) }} />
                        <TouchableOpacity
                          style={[styles(theme).actionButtonSecondary,{paddingHorizontal: getScaleSize(14)}]}
                          onPress={() => {
                            setEditingForMessageId(false);
                            setOfferInputValue('');
                          }}>
                          <Text
                            size={getScaleSize(14)}
                            font={FONTS.Lato.SemiBold}
                            color={theme.primary}>
                            {STRING.Cancel}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ) : profile?.user?.role === 'elderly_user' ? (
                <View style={{ flex: 1.0 }}>
                  {!editingForMessageId && (
                    <View style={[styles(theme).actionRow, { flex: 1.0 }]}>
                      <TouchableOpacity
                        style={[styles(theme).actionButtonSecondary, {flex: 1.0,}]}
                        onPress={() => {
                          setEditingForMessageId(true);
                        }}>
                        <Text
                          size={getScaleSize(12)}
                          font={FONTS.Lato.Medium}
                          color={theme.primary}>
                          {STRING.counter_offer}
                        </Text>
                      </TouchableOpacity>
                      <View style={{ width: getScaleSize(8) }} />
                      <TouchableOpacity
                        style={[styles(theme).actionButtonPrimary, {flex: 1.0,}]}
                        onPress={async () => {
                          mediaPickerSheetRef.current?.open();
                          setSelectedNegotiation(item);
                        }}>
                        <Text
                          size={getScaleSize(12)}
                          font={FONTS.Lato.Medium}
                          color={theme.white}>
                          {STRING.accept_offer}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {editingForMessageId && (
                    <View>
                      <View style={styles(theme).offerInputWrapper}>
                        <Text
                          size={getScaleSize(12)}
                          font={FONTS.Lato.Medium}
                          color={theme._424242}>
                          €
                        </Text>
                        <TextInput
                          value={offerInputValue}
                          onChangeText={(text) => {
                            setOfferInputValue(formatDecimalInput(text))
                          }

                          }
                          style={styles(theme).offerTextInput}
                          placeholder="0.00"
                          placeholderTextColor={theme._ACADAD}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <View style={[styles(theme).actionRow, {alignSelf: 'flex-end'}]}>
                        <TouchableOpacity
                          style={[styles(theme).actionButtonPrimary, { paddingHorizontal: getScaleSize(14) }]}
                          disabled={buttonDisabled}
                          onPress={async () => {
                            if (!offerInputValue.trim()) {
                              SHOW_TOAST(
                                STRING.please_enter_an_offer_amount,
                                'error',
                              );
                              return;
                            }
                            setButtonDisabled(true);
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
                              currentTurn: peerUserId,
                              offers: [...item.negotiation.offers, newOffer],
                            };

                            console.log(
                              'updatedNegotiation',
                              updatedNegotiation,
                            );
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
                                text: `${STRING.my_revised_offer_is} €${offerInputValue}`,
                                negotiation: updatedNegotiation,
                              },
                              profile?.user?.profile_photo_url || '',
                              peerUserAvatar ?? '',
                            );
                            console.log('message sent');

                            setEditingForMessageId(false);

                            setOfferInputValue('');
                            setButtonDisabled(false);
                          }}>
                          <Text
                            size={getScaleSize(14)}
                            font={FONTS.Lato.Regular}
                            color={theme.white}>
                            {STRING.Submit}
                          </Text>
                        </TouchableOpacity>
                        <View style={{ width: getScaleSize(8) }} />
                        <TouchableOpacity
                          style={[styles(theme).actionButtonSecondary, { paddingHorizontal: getScaleSize(14) }]}
                          onPress={() => {
                            setEditingForMessageId(false);
                            setOfferInputValue('');
                          }}>
                          <Text
                            size={getScaleSize(14)}
                            font={FONTS.Lato.Regular}
                            color={theme.primary}>
                            {STRING.Cancel}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ) : null)}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles(theme).container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <View style={{ flex: 1 }}>
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
              color={theme._2E7D32}>
              {STRING.available}
            </Text>
          </View>
        </SafeAreaView>
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
              removeClippedSubviews={false}
              contentContainerStyle={messageListContentStyle}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
        <RBSheet
          ref={mediaPickerSheetRef}
          closeOnPressMask
          customAvoidingViewProps={
            Platform.OS === 'android'
              ? { enabled: false }
              : { enabled: true, behavior: 'padding' }
          }
          customStyles={{
            container: styles(theme).sheetContainer,
            draggableIcon: {
              backgroundColor: theme._8A8A8A,
            },
          }}>
          <Image
            source={IMAGES.ic_alart}
            style={[styles(theme).alartIcon, { marginBottom: getScaleSize(24) }]}
          />

          <Text
            align="center"
            font={FONTS.Lato.Bold}
            size={getScaleSize(24)}
            color={theme._31302F}
            style={styles(theme).sheetTitle}>
            {STRING.are_you_sure_you_want_to_accept_this_negotiation}
          </Text>
          <View style={styles(theme).buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                closeSheet();
              }}
              style={styles(theme).btnStyle}>
              <Text
                size={getScaleSize(19)}
                font={FONTS.Lato.Bold}
                align="center"
                color={theme._214C65}>
                {STRING.cancel}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                getServiceDetails(selectedNegotiation);

                setEditingForMessageId(false);
                setOfferInputValue('');
                closeSheet();
              }}
              style={styles(theme).btnStyle}>
              <Text
                size={getScaleSize(19)}
                font={FONTS.Lato.Bold}
                align="center"
                color={theme._214C65}>
                {STRING.accept}
              </Text>
            </TouchableOpacity>
          </View>
        </RBSheet>
      </View>
    </KeyboardAvoidingView>
  );
}
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
      width: '75%',
      alignSelf: 'flex-end',
      paddingHorizontal: getScaleSize(16),
      paddingVertical: getScaleSize(16),
      borderRadius: getScaleSize(16),
      backgroundColor: theme._F5F5F5,
      marginBottom: getScaleSize(10),
    },
    negotiationCard: {
      width: '75%',
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
      flex: 1.0,
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
      marginTop: getScaleSize(10),
    },
    actionButtonPrimary: {
      paddingVertical: getScaleSize(6),
      borderRadius: getScaleSize(16),
      backgroundColor: theme.primary,
      borderWidth: 1,
      borderColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonSecondary: {
      paddingVertical: getScaleSize(6),
      borderRadius: getScaleSize(16),
      backgroundColor: theme.white,
      borderWidth: 1,
      borderColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    alartIcon: {
      width: getScaleSize(60),
      height: getScaleSize(60),
      alignSelf: 'center',
    },
    sheetContainer: {
      borderTopLeftRadius: getScaleSize(24),
      borderTopRightRadius: getScaleSize(24),
      paddingVertical: getScaleSize(20),
      height: 'auto',
      justifyContent: 'center',
      paddingHorizontal: getScaleSize(24),
    },
    sheetTitle: {
      marginBottom: getScaleSize(16),
      textAlign: 'center',
      alignSelf: 'center',
    },
    buttonContainer: {
      gap: getScaleSize(16),
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getScaleSize(8),
    },
    btnStyle: {
      borderWidth: 1,
      borderColor: theme._214C65,
      borderRadius: getScaleSize(12),
      paddingVertical: getScaleSize(18),
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1.0,
    },
  });
