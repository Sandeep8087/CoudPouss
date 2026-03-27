import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
} from 'react-native';

//CONTEXT
import { LaungageContext, ThemeContext, ThemeContextType } from '../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../assets';
import { getScaleSize, SHOW_TOAST, Storage, useString } from '../constant';

//COMPONENTS
import { Text, Header, ProgressView, Button } from '../components';

//SCREENS
import { SCREENS } from '.';

//PACKAGES
import { CommonActions } from '@react-navigation/native';

export default function LanguageSelection(props: any) {

    const STRING = useString();
    const { setLanguage, language } = useContext<any>(LaungageContext);
    const { theme } = useContext<any>(ThemeContext);

    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        getStoredLang()
    }, []);

    async function getStoredLang() {
        setLoading(true);
        const storedLang = await Storage.get(Storage.USER_LANGUAGE);
        if (storedLang) {
            console.log('storedLang==>', storedLang, JSON.parse(storedLang));
            setLanguage(JSON.parse(storedLang));
            
        } else {
            setLanguage('en');
        }
        setLoading(false);
    }

    return (
        <View style={styles(theme).container}>
            <Header
                screenName={STRING.prefered_language}
            />
            <FlatList data={[{ title: STRING.french, value: 'fr' }, { title: STRING.english, value: 'en' }]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                    return (
                        <TouchableOpacity style={[styles(theme).itemView, {
                            marginTop: index === 0 ? getScaleSize(24) : getScaleSize(16)
                        }]}
                            onPress={() => {
                                if (language === item.value) {
                                    return;
                                }
                                if (item.value === 'fr') {
                                    setLanguage('fr');
                                } else if (item.value === 'en') {
                                    setLanguage('en');
                                }
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
                                source={language === item.value ? IMAGES.ic_circle_blue : IMAGES.ic_unselect_blue} />
                        </TouchableOpacity>
                    )
                }}
            />
            <Button
                title={STRING.continue}
                style={{ margin: getScaleSize(24) }}
                onPress={() => {
                    props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [
                                {
                                    name: SCREENS.Login.identifier,
                                },
                            ],
                        }),
                    );
                }}
            />
            {loading && <ProgressView />}
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
