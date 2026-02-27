import { Dimensions, Image, StyleSheet, View } from 'react-native'
import React, { useContext, useEffect } from 'react'

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context'

//CONSTANT & ASSETS
import { getScaleSize, useString } from '../../constant'
import { FONTS, IMAGES } from '../../assets'

//SCREENS
import { SCREENS } from '..'

//COMPONENTS
import { Header, Input, Text, Button } from '../../components';
import { CommonActions } from '@react-navigation/native'

export default function AccountCreatedSuccessfully(props: any) {

  const isWithdrawal = props.route.params?.isWithdrawal || false;
  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  useEffect(() => {
    if (isWithdrawal) {
      setTimeout(() => {
        props.navigation.goBack();
        props.navigation.goBack();
      }, 2000)

    } else {
      setTimeout(() => {
        props.navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              { name: SCREENS.BottomBar.identifier }
            ],
          }),
        );
      }, 2000);
    }
  }, [])

  return (
    <View style={styles(theme).container}>
      <Header />
      <Image source={IMAGES.accountSuccessfully} style={styles(theme).successIcon} />
      <Text size={getScaleSize(24)}
        font={FONTS.Lato.Bold}
        color={theme._939393}
        align="center">
        {isWithdrawal ? STRING.withdrawal_completed_successfully : STRING.great_job_Your_account_is_now_created_successfully}
      </Text>
    </View>
  )
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1.0,
      backgroundColor: theme.white,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: getScaleSize(29)
    },
    successIcon: {
      width: Dimensions.get('window').width - getScaleSize(58),
      height: ((Dimensions.get('window').width - getScaleSize(58)) * getScaleSize(333)) / getScaleSize(373),
      marginBottom: getScaleSize(40),
    }
  })