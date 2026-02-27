import React, {useContext} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {ThemeContext} from '../../context';
import {getScaleSize, useString} from '../../constant';
import {Header} from '../../components';

export default function ImageDetailsScreen(props: any) {
  const {itemData} = props?.route?.params;
  const {theme} = useContext<any>(ThemeContext);
  const STRING = useString();

  return (
    <View style={styles(theme).container}>
      <Header
        onBack={() => {
          props.navigation.goBack();
        }}
        screenName={'Image Details'}
      />
      <View style={styles(theme).imageContainer}>
        <Image
          source={{
            uri: itemData,
          }}
          style={styles(theme).image}
        />
      </View>
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1.0,
      backgroundColor: theme._FFF,
    },
    btnBoxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: getScaleSize(24),
      paddingVertical: getScaleSize(12),
    },
    backContainer: {
      paddingRight: getScaleSize(12),
    },
    backIcon: {
      width: getScaleSize(40),
      height: getScaleSize(40),
    },
    headerView: {
      flex: 1,
    },
    image: {
      width: '100%',
      height: '100%',
      flex: 1,
      resizeMode: 'contain',
    },
    imageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
