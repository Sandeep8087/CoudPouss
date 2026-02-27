import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
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
import {listenToThreads} from '../../services/chat';

import {SCREENS} from '..';
import {listenToNegotiationThreads} from '../../services/negotiationchat';

export default function Chat(props: any) {
  const STRING = useString();
  const {theme} = useContext<any>(ThemeContext);
  const {profile} = useContext<any>(AuthContext);

  // const [threads, setThreads] = useState<ChatThread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [_isLoading, setIsLoading] = useState(false);

  const [filteredDataSource, setFilteredDataSource] = useState<any>([]);
  const [filteredNegotiationDataSource, setFilteredNegotiationDataSource] =
    useState<any>([]);
  const [masterDataSource, setMasterDataSource] = useState<any>([]);
  const [masterNegotiationDataSource, setMasterNegotiationDataSource] =
    useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('chat');

  useEffect(() => {
    if (selectedTab === 'chat') {
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
    } else {
      return listenToNegotiationThreads(profile?.user?.id).onSnapshot(
        querySnapshot => {
          const formattedMessages = querySnapshot.docs.map(doc => {
            return {
              _id: doc.id,
              message: '',
              createdAt: new Date().getTime(),
              ...doc.data(),
            };
          });
          setFilteredNegotiationDataSource(formattedMessages);
          setMasterNegotiationDataSource(formattedMessages);
        },
      );
    }
  }, [selectedTab]);

  const ItemView = ({item}: {item: any}) => {
    return (
      <TouchableOpacity
        style={styles(theme).itemContainer}
        activeOpacity={1}
        onPress={() => {
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
        {item.readCount > 0 && (
          <View style={styles(theme).messageContainer}>
            <Text
              size={getScaleSize(12)}
              font={FONTS.Lato.Medium}
              color={theme.white}>
              {`${item.readCount}`}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const ItemViewNegotiation = ({item}: {item: any}) => {
    return (
      <TouchableOpacity
        style={styles(theme).itemContainer}
        activeOpacity={1}
        onPress={() => {
          props.navigation.navigate(SCREENS.NegotiationDetails.identifier, {
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
          style={styles(theme).serviceImage}
          source={
            item.user.servicePhoto
              ? {uri: item.user.servicePhoto}
              : IMAGES.user_placeholder
          }
        />
        <View style={styles(theme).threadContent}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.Medium}
            color={theme._2B2B2B}>
            {item.user.serviceName}
          </Text>
          <View style={{marginTop: getScaleSize(5)}} />
          <Text
            size={getScaleSize(12)}
            font={FONTS.Lato.Regular}
            color={theme._ACADAD}>
            {item.message}
          </Text>
          <View style={{marginTop: getScaleSize(5)}} />
          <View
            style={{
              flexDirection: 'row',
              gap: getScaleSize(5),
              alignItems: 'center',
            }}>
            <Image
              style={{
                height: getScaleSize(20),
                width: getScaleSize(20),
                borderRadius: getScaleSize(10),
              }}
              source={
                item.user.recipientPhoto
                  ? {uri: item.user.recipientPhoto}
                  : IMAGES.user_placeholder
              }
            />
            <Text
              size={getScaleSize(12)}
              font={FONTS.Lato.Regular}
              color={theme._ACADAD}>
              {item.user.name}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const searchFilterFunction = (text: string) => {
    // Check if searched text is not blank
    if (text) {
      // Inserted text is not blank
      // Filter the masterDataSource and update FilteredDataSource
      if (selectedTab === 'chat') {
        const newData = masterDataSource.filter(function (item: any) {
          // Applying filter for the inserted text in search bar
          const itemData = item.user.name
            ? item.user.name.toUpperCase()
            : ''.toUpperCase();
          const textData = text.toUpperCase();
          return itemData.indexOf(textData) > -1;
        });
        setFilteredDataSource(newData);
      } else {
        const newData = masterNegotiationDataSource.filter(function (
          item: any,
        ) {
          // Applying filter for the inserted text in search bar
          const itemData = item.user.serviceName
            ? item.user.serviceName.toUpperCase()
            : ''.toUpperCase();
          const textData = text.toUpperCase();
          return itemData.indexOf(textData) > -1;
        });
        setFilteredNegotiationDataSource(newData);
      }

      setSearchQuery(text);
    } else {
      // Inserted text is blank
      // Update FilteredDataSource with masterDataSource
      if (selectedTab === 'chat') {
        setFilteredDataSource(masterDataSource);
      } else {
        setFilteredNegotiationDataSource(masterNegotiationDataSource);
      }
      setSearchQuery(text);
    }
  };

  return (
    <View style={styles(theme).container}>
      <Header type="profile" screenName={STRING.Chat} />
      <View style={styles(theme).searchContainer}>
        <SearchComponent
          value={searchQuery}
          onChangeText={(text: string) => searchFilterFunction(text)}
          onPressMicrophone={() => {}}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: getScaleSize(22),
          backgroundColor: theme._F7F7F7,
          borderRadius: getScaleSize(10),
        }}>
        <TouchableOpacity
          style={[
            styles(theme).unselectedContainer,
            {
              backgroundColor:
                selectedTab === 'chat' ? theme.primary : theme._F7F7F7,
            },
          ]}
          activeOpacity={1}
          onPress={() => {
            setSelectedTab('chat');
          }}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.Regular}
            color={selectedTab === 'chat' ? theme.white : theme._818285}>
            {'Chat'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles(theme).unselectedContainer,
            {
              backgroundColor:
                selectedTab === 'negotiation' ? theme.primary : theme._F7F7F7,
            },
          ]}
          activeOpacity={1}
          onPress={() => {
            setSelectedTab('negotiation');
          }}>
          <Text
            size={getScaleSize(16)}
            font={FONTS.Lato.Regular}
            color={selectedTab === 'negotiation' ? theme.white : theme._818285}>
            {'Negotiation'}
          </Text>
        </TouchableOpacity>
      </View>
      {selectedTab === 'chat' ? (
        <View>
          <View style={{marginTop: getScaleSize(8)}} />
          <FlatList
            data={filteredDataSource}
            keyExtractor={(item, index) => index.toString()}
            renderItem={ItemView}
          />
        </View>
      ) : (
        <View>
          <View style={{marginTop: getScaleSize(8)}} />
          <FlatList
            data={filteredNegotiationDataSource}
            keyExtractor={(item, index) => index.toString()}
            renderItem={ItemViewNegotiation}
          />
        </View>
      )}
    </View>
  );
}

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
    serviceImage: {
      height: getScaleSize(70),
      width: getScaleSize(70),
      borderRadius: getScaleSize(12),
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
    unselectedContainer: {
      paddingVertical: getScaleSize(18),
      paddingHorizontal: getScaleSize(18),
      flex: 1.0,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: getScaleSize(10),
      backgroundColor: '#F7F7F7',
    },
  });
