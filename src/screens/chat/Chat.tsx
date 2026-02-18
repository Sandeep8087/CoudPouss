import React, {useContext, useEffect, useState, useMemo} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';

//ASSETS
import {FONTS, IMAGES} from '../../assets';

//CONTEXT
import {ThemeContext, ThemeContextType, AuthContext} from '../../context';

//CONSTANT
import {getScaleSize, useString} from '../../constant';

//COMPONENT
import {Header, SearchComponent, Text} from '../../components';

//SERVICES
import {
  ChatThread,
  listenToThreads,
  subscribeToThreads,
} from '../../services/chat';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

import {SCREENS} from '..';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Chat(props: any) {
  const STRING = useString();
  const {theme} = useContext<any>(ThemeContext);
  const {profile} = useContext<any>(AuthContext);

  // const [threads, setThreads] = useState<ChatThread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [_isLoading, setIsLoading] = useState(false);

  const [filteredDataSource, setFilteredDataSource] = useState<any[]>([]);
  const [masterDataSource, setMasterDataSource] = useState<any[]>([]);

  useEffect(() => {
    return listenToThreads(profile?.user?.id).onSnapshot(querySnapshot => {
      const formattedMessages = querySnapshot.docs.map(doc => {
        return {
          _id: doc.id,
          message: '',
          createdAt: new Date().getTime(),
          ...doc.data(),
        };
      });
      setFilteredDataSource(formattedMessages);
      setMasterDataSource(formattedMessages);
    });
  }, [profile?.user?.id]);

  console.log('filteredDataSource==>', filteredDataSource);

  // useEffect(() => {
  //   const userId = profile?.user?.id;
  //   if (!userId) {
  //     setThreads([]);
  //     setIsLoading(false);
  //     return;
  //   }

  //   setIsLoading(true);
  //   const unsubscribe = subscribeToThreads(
  //     userId,
  //     results => {
  //       setThreads(results);
  //       setIsLoading(false);
  //     },
  //     error => {
  //       console.log('Failed to subscribe to chats', error);
  //       setIsLoading(false);
  //     },
  //   );

  //   return unsubscribe;
  // }, [profile?.user?.id]);

  // const filteredThreads = useMemo(() => {
  //   const userId = profile?.user?.id;
  //   const query = searchQuery.trim().toLowerCase();
  //   if (!query) {
  //     return threads;
  //   }

  //   return threads.filter(thread => {
  //     const peer = getPeerMeta(thread, userId);
  //     return peer.name.toLowerCase().includes(query);
  //   });
  // }, [threads, searchQuery, profile?.user?.id]);

  // const renderThread = ({item}: {item: ChatThread}) => {
  //   const userId = profile?.user?.id;
  //   const peer = getPeerMeta(item, userId);
  //   return (
  //     <TouchableOpacity
  //       style={styles(theme).itemContainer}
  //       activeOpacity={0.85}
  //       onPress={() => {
  //         props.navigation.navigate(SCREENS.ChatDetails.identifier, {
  //           threadId: item.id,
  //           peerUser: {
  //             user_id: peer.id,
  //             name: peer.name,
  //             email: peer.email,
  //             avatarUrl: peer.avatarUrl,
  //           },
  //         });
  //       }}>
  //       <Image
  //         style={styles(theme).userImage}
  //         source={
  //           peer.avatarUrl ? {uri: peer.avatarUrl} : IMAGES.user_placeholder
  //         }
  //       />
  //       <View style={styles(theme).threadContent}>
  //         <Text
  //           size={getScaleSize(16)}
  //           font={FONTS.Lato.Medium}
  //           color={theme._2B2B2B}>
  //           {peer.name || STRING.unknown_user}
  //         </Text>
  //         <Text
  //           numberOfLines={1}
  //           size={getScaleSize(12)}
  //           font={FONTS.Lato.Regular}
  //           color={theme._ACADAD}>
  //           {item.lastMessage || STRING.no_messages_yet}
  //         </Text>
  //       </View>
  //       <View style={styles(theme).threadMeta}>
  //         <Text
  //           size={getScaleSize(10)}
  //           font={FONTS.Lato.Regular}
  //           color={theme._ACADAD}>
  //           {formatTimestamp(item.updatedAt)}
  //         </Text>
  //       </View>
  //     </TouchableOpacity>
  //   );
  // };

  const ItemView = ({item}: {item: any}) => {
    return (
      <TouchableOpacity
        style={styles(theme).itemContainer}
        activeOpacity={1}
        onPress={() => {
          console.log('item==>', item);
          props.navigation.navigate(SCREENS.ChatDetails.identifier, {
            conversationId: item._id,
            peerUser: {
              user_id: item.user.recipientId ?? '',
              name: item.user.name ?? '',
              email: item.user.email ?? '',
              avatarUrl: item.user.recipientPhoto ?? '',
            },
          });
        }}>
        <Image
          style={styles(theme).userImage}
          source={
            item.user.recipientPhoto
              ? {uri: item.user.recipientPhoto}
              : IMAGES.user_placeholder
          }
        />
        <View style={styles(theme).threadContent}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.Medium}
            color={theme._2B2B2B}>
            {item.user.name}
          </Text>
          <View style={{marginTop: getScaleSize(5)}} />
          <Text
            size={getScaleSize(12)}
            font={FONTS.Lato.Regular}
            color={theme._ACADAD}>
            {item.message}
          </Text>
        </View>
        <View style={styles(theme).messageContainer}>
          <Text
            size={getScaleSize(12)}
            font={FONTS.Lato.Medium}
            color={theme.white}>
            {'1'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles(theme).container}>
      <Header type="profile" screenName={STRING.Chat} />
      <View style={styles(theme).searchContainer}>
        <SearchComponent
          value={searchQuery}
          onChangeText={setSearchQuery}
          onPressMicrophone={() => {}}
        />
      </View>
      <FlatList
        data={filteredDataSource}
        keyExtractor={(item, index) => index.toString()}
        renderItem={ItemView}
      />

      {/* <ScrollView
        style={styles(theme).scrolledContainer}
        showsVerticalScrollIndicator={false}>
        {filteredThreads.length > 0
          ? filteredThreads.map(item => renderThread({item}))
          : ['', '', '', '', ''].map((_: any, index: number) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles(theme).itemContainer}
                  activeOpacity={1}
                  onPress={() => {
                    props.navigation.navigate(SCREENS.ChatDetails.identifier);
                  }}>
                  <Image
                    style={styles(theme).userImage}
                    source={IMAGES.user_placeholder}
                  />
                  <View style={styles(theme).threadContent}>
                    <Text
                      size={getScaleSize(16)}
                      font={FONTS.Lato.Medium}
                      color={theme._2B2B2B}>
                      {'Emily Johnson'}
                    </Text>
                    <Text
                      size={getScaleSize(12)}
                      font={FONTS.Lato.Regular}
                      color={theme._ACADAD}>
                      {'I really appreciated your feedback on the project;'}
                    </Text>
                  </View>
                  <View style={styles(theme).messageContainer}>
                    <Text
                      size={getScaleSize(12)}
                      font={FONTS.Lato.Medium}
                      color={theme.white}>
                      {'1'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
      </ScrollView> */}
    </View>
  );
}

const getPeerMeta = (thread: ChatThread, currentUserId?: string) => {
  const peerId =
    thread.participantIds.find(
      participantId => participantId !== currentUserId,
    ) ??
    thread.participantIds[0] ??
    '';

  const peerMeta = thread.participantsMeta?.[peerId] ?? {};

  return {
    id: peerId,
    name: peerMeta?.name || 'User',
    email: peerMeta?.email || '',
    avatarUrl: peerMeta?.avatarUrl || '',
  };
};

const formatTimestamp = (
  timestamp?: FirebaseFirestoreTypes.Timestamp | null,
) => {
  if (!timestamp) {
    return '';
  }

  const date = timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp as any);
  const now = new Date();

  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  }

  return date.toLocaleDateString();
};

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: theme.white},
    scrolledContainer: {
      marginHorizontal: getScaleSize(22),
      flex: 1.0,
    },
    searchContainer: {
      marginHorizontal: getScaleSize(22),
      marginVertical: getScaleSize(24),
    },
    userImage: {
      height: getScaleSize(60),
      width: getScaleSize(60),
      borderRadius: getScaleSize(30),
    },
    itemContainer: {
      marginBottom: getScaleSize(24),
      flexDirection: 'row',
      marginHorizontal: getScaleSize(20),
    },
    threadContent: {
      alignSelf: 'center',
      marginLeft: getScaleSize(12),
      flex: 1.0,
    },
    threadMeta: {
      alignSelf: 'center',
      marginRight: getScaleSize(8),
    },
    messageContainer: {
      height: getScaleSize(24),
      width: getScaleSize(24),
      borderRadius: getScaleSize(12),
      alignSelf: 'center',
      backgroundColor: theme._F0B52C,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: getScaleSize(2),
    },
  });
