import React, { useContext, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
} from 'react-native';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, useString } from '../../constant';

//COMPONENTS
import { Text, Header } from '../../components';

export default function Language(props: any) {

    const STRING = useString();

    const { theme } = useContext<any>(ThemeContext);

    const [isLanguageSelected, setIsLanguageSelected] = useState<number>(0)

    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
                screenName={STRING.prefered_language}
            />
            <View>
                <FlatList data={[{ title: STRING.french }, { title: STRING.english }]}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => {
                        return (
                            <TouchableOpacity style={[styles(theme).itemView, {
                                marginTop: index === 0 ? getScaleSize(24) : getScaleSize(16)
                            }]}
                                onPress={() => {
                                    setIsLanguageSelected(index)
                                }}>
                                <Text
                                    size={getScaleSize(16)}
                                    font={FONTS.Lato.SemiBold}
                                    color={theme._2C6587}>
                                    {item.title}
                                </Text>
                                <View style={{ flex: 1 }}></View>
                                <Image
                                    style={styles(theme).iconStyle}
                                    resizeMode='contain'
                                    source={isLanguageSelected === index ? IMAGES.ic_circle_blue : IMAGES.ic_unselect_blue} />
                            </TouchableOpacity>
                        )
                    }}>
                </FlatList>
            </View>
        </View>
    );
}

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.white
        },
        itemView: {
            paddingVertical: getScaleSize(14),
            paddingHorizontal: getScaleSize(20),
            borderWidth: 1,
            borderColor: theme._BECFDA,
            borderRadius: getScaleSize(14),
            backgroundColor: theme.white,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: getScaleSize(24)
        },
        iconStyle: {
            height: getScaleSize(36),
            width: getScaleSize(36),
            alignSelf: 'center'
        }
    });
