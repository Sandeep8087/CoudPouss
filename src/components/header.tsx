import { Image, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../context'

//CONSTANTS & ASSETS
import { getScaleSize } from '../constant'
import { FONTS, IMAGES } from '../assets'

//COMPONENTS
import Text from './Text'

interface HeaderProps {
    onBack?: () => void
    screenName?: string,
    type?: string,
    rightIcon?: {
        icon: any,
        title: string
    },
    onPress?: () => void,
    icon?: any,
    isFromRequest?: boolean
}

const Header = (props: HeaderProps) => {

    const { theme } = useContext(ThemeContext)
    const { userType } = useContext<any>(AuthContext)

    if (props.type == 'profile') {
        return (
            <View>
                <SafeAreaView />
                <View style={styles(theme).statusBar}>
                    <StatusBar
                        translucent={true}
                        backgroundColor={theme.white}
                        barStyle={'dark-content'} />
                </View>
                <View style={[styles(theme).container, { zIndex: 99999 }]}>
                    <View style={styles(theme).mainContainer}>
                        {props.screenName &&
                            <Text
                                size={getScaleSize(24)}
                                style={{ flex: 1.0 }}
                                font={FONTS.Lato.Bold}
                                color={theme._2C6587}>
                                {props.screenName}
                            </Text>
                        }
                        {props.rightIcon &&
                            <TouchableOpacity style={styles(theme).flexRow} onPress={props.onPress}>
                                <Image
                                    source={props.rightIcon.icon}
                                    style={[styles(theme).rightIcon, { tintColor: userType === 'service_provider' ? theme._F0B52C : theme._D32F2F }]} />
                                <Text
                                    size={getScaleSize(16)}
                                    font={FONTS.Lato.SemiBold}
                                    color={userType === 'service_provider' ? theme._F0B52C : theme._D32F2F}>
                                    {props.rightIcon.title}
                                </Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </View>
        )
    } else {
        return (
            <View>
                <SafeAreaView />
                <View style={styles(theme).statusBar}>
                    <StatusBar
                        translucent={true}
                        backgroundColor={theme.white}
                        barStyle={'dark-content'} />
                </View>
                <View style={[styles(theme).container, { zIndex: 99999 }]}>
                    <View style={styles(theme).mainContainer}>
                        {props.onBack &&
                            <TouchableOpacity onPress={props.onBack}>
                                <Image source={IMAGES.ic_back} style={styles(theme).backIcon} />
                            </TouchableOpacity>
                        }
                        {props.screenName &&
                            <TouchableOpacity style={{ flex: 1.0 }} onPress={props.onBack}>
                                <Text
                                    size={props.isFromRequest === true ? getScaleSize(24) : getScaleSize(20)}
                                    font={props.isFromRequest === true ? FONTS.Lato.Bold : FONTS.Lato.SemiBold}
                                    color={props.isFromRequest === true ? theme._2C6587 : theme._323232}
                                    style={{ textTransform: 'capitalize' }}>
                                    {props.screenName}
                                </Text>
                            </TouchableOpacity>
                        }
                        {props.rightIcon &&
                            <TouchableOpacity style={styles(theme).flexRow} onPress={props.onPress}>
                                <Image source={props.rightIcon.icon} style={styles(theme).rightIcon} />
                                <Text
                                    size={getScaleSize(16)}
                                    font={FONTS.Lato.SemiBold}
                                    color={theme._D32F2F}>
                                    {props.rightIcon.title}
                                </Text>
                            </TouchableOpacity>
                        }
                        {props.icon &&
                            <TouchableOpacity style={styles(theme).flexRow} onPress={props.onPress}>
                                <Image source={props.icon} style={styles(theme).icon} />
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </View>
        )
    }
}

export default Header

const styles = (theme: ThemeContextType['theme']) => StyleSheet.create({
    container: {
        paddingHorizontal: getScaleSize(24),
        paddingVertical: getScaleSize(8),
        // alignSelf:'center'
    },
    mainContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    statusBar: {
        height: StatusBar.currentHeight
    },
    backIcon: {
        width: getScaleSize(40),
        height: getScaleSize(40),
        marginRight: getScaleSize(16)
    },
    rightIcon: {
        width: getScaleSize(24),
        height: getScaleSize(24),
        marginRight: getScaleSize(4)
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    icon: {
        width: getScaleSize(32),
        height: getScaleSize(32),
    }
})