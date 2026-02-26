import React, {useContext, useState} from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Alert,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  SafeAreaView,
  TextInput,
} from 'react-native';

//ASSETS
import {FONTS, IMAGES} from '../../assets';

//CONTEXT
import {ThemeContext, ThemeContextType} from '../../context';

//CONSTANT
import {getScaleSize, useString} from '../../constant';

//COMPONENT
import {
  AssistanceItems,
  CalendarComponent,
  Header,
  Input,
  ProgressSlider,
  SearchComponent,
  ServiceItem,
  Text,
  TimePicker,
} from '../../components';

//PACKAGES
import {useFocusEffect} from '@react-navigation/native';

const {width} = Dimensions.get('window');
const cellSize = (width - 30) / 7;

export default function Transport(props: any) {
  const STRING = useString();
  const {theme} = useContext<any>(ThemeContext);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const servicesData = [
    {
      id: '1',
      title: 'Furniture Assembly',
      image: 'https://picsum.photos/id/1/200/300',
    },
    {
      id: '2',
      title: 'Interior Painting',
      image: 'https://picsum.photos/id/1/200/300',
    },
  ];

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        // StatusBar.setBackgroundColor(theme.white);
        // StatusBar.setBarStyle('dark-content');
      }
    }, []),
  );

  return (
    <View style={styles(theme).container}>
      {/* <SafeAreaView /> */}
      <Header
        onBack={() => {
          props.navigation.goBack();
        }}
        screenName={STRING.Transport}
      />
      <FlatList
        data={servicesData}
        ListHeaderComponent={() => {
          return (
            <>
              <View
                style={{
                  marginTop: getScaleSize(16),
                  marginHorizontal: getScaleSize(22),
                }}>
                <SearchComponent />
              </View>
              <View style={styles(theme).deviderView}></View>
              <Image
                style={styles(theme).bannerContainer}
                source={{uri: 'https://picsum.photos/id/1/200/300'}}
              />             
            </>
          );
        }}
        renderItem={({item, index}) => (
          <View style={{marginHorizontal: getScaleSize(22)}}>
            <AssistanceItems item={item} index={index} />
          </View>
        )}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => {
          return <View style={{height: 16}} />;
        }}
      />
      {/* <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          marginTop: getScaleSize(40),
          marginHorizontal: getScaleSize(22),
        }}>
        {['',''].map((item)=>{
              return (
                <AssistanceItems />
              )
            })}
      </ScrollView> */}
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: theme.white},
    deviderView: {
      marginTop: getScaleSize(30),
      height: getScaleSize(6),
      backgroundColor: '#F8F8F8',
    },
    bannerContainer: {
      height: getScaleSize(182),
      borderRadius: getScaleSize(20),
      marginTop: getScaleSize(20),
      marginHorizontal: getScaleSize(24),
    },
    itemContainer: {
      marginTop: getScaleSize(42),
      height: getScaleSize(44),
      paddingHorizontal: getScaleSize(20),
      borderRadius: getScaleSize(32),
      borderWidth: 1,
      borderColor: '#F1F1F1',
      flexDirection: 'row',
    },
    categoryImage: {
      height: getScaleSize(24),
      width: getScaleSize(24),
      alignSelf: 'center',
    },
  });
