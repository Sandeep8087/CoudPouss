import React, {useContext, useState} from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';

//ASSETS
import {FONTS, IMAGES} from '../../assets';

//CONTEXT
import {ThemeContext, ThemeContextType} from '../../context';

//CONSTANT
import {getScaleSize, useString} from '../../constant';

//COMPONENT
import {Header, SearchComponent, Text} from '../../components';

//PACKAGES
import {useFocusEffect} from '@react-navigation/native';
import {SCREENS} from '..';

export default function Chat(props: any) {
  const STRING = useString();
  const {theme} = useContext<any>(ThemeContext);

  useEffect(() => {
    if (!user?.user_id) {
      setThreads([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToThreads(
      user.user_id,
      results => {
        setThreads(results);
        setIsLoading(false);
      },
      error => {
        console.log('Failed to subscribe to chats', error);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.user_id]);

  const filteredThreads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return threads;
    }

    return threads.filter(thread => {
      const peer = getPeerMeta(thread, user?.user_id);
      return peer.name.toLowerCase().includes(query);
    });
  }, [threads, searchQuery, user?.user_id]);

  const renderThread = ({item}: {item: ChatThread}) => {
    const peer = getPeerMeta(item, user?.user_id);
    return (
      <TouchableOpacity
        style={styles(theme).itemContainer}
        activeOpacity={0.85}
        onPress={() => {
          props.navigation.navigate(SCREENS.ChatDetails.identifier, {
            threadId: item.id,
            peerUser: {
              user_id: peer.id,
              name: peer.name,
              email: peer.email,
              avatarUrl: peer.avatarUrl,
            },
          });
        }}>
        <Image
          style={styles(theme).userImage}
          source={
            peer.avatarUrl ? {uri: peer.avatarUrl} : IMAGES.user_placeholder
          }
        />
        <View style={styles(theme).threadContent}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.Medium}
            color={theme._2B2B2B}>
            {peer.name || STRING.unknown_user}
          </Text>
          <Text
            numberOfLines={1}
            size={getScaleSize(12)}
            font={FONTS.Lato.Regular}
            color={theme._ACADAD}>
            {item.lastMessage || STRING.no_messages_yet}
          </Text>
        </View>
        <View style={styles(theme).threadMeta}>
          <Text
            size={getScaleSize(10)}
            font={FONTS.Lato.Regular}
            color={theme._ACADAD}>
            {formatTimestamp(item.updatedAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles(theme).container}>
      <Header type="profile" screenName={STRING.Chat} />
      <View style={styles(theme).searchContainer}>
        <SearchComponent />
      </View>
      <ScrollView
        style={styles(theme).scrolledContainer}
        showsVerticalScrollIndicator={false}>
        {['', '', '', '', ''].map((item: any, index: number) => {
          return (
            <TouchableOpacity
              style={styles(theme).itemContainer}
              activeOpacity={1}
              onPress={() => {
                props.navigation.navigate(SCREENS.ChatDetails.identifier);
              }}>
              <Image
                style={styles(theme).userImage}
                source={IMAGES.user_placeholder}
              />
              <View
                style={{
                  alignSelf: 'center',
                  marginLeft: getScaleSize(12),
                  flex: 1.0,
                }}>
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
      </ScrollView>
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
