import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
} from 'react-native';

//CONTEXT
import { AuthContext, LaungageContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';

//COMPONENTS
import { Text, Header, ProgressView } from '../../components';
import { API } from '../../api';

export default function Language(props: any) {

    const STRING = useString();
    const { setLanguage, language } = useContext<any>(LaungageContext);
    const { fetchProfile } = useContext<any>(AuthContext);
    const { theme } = useContext<any>(ThemeContext);

    const [isLanguageSelected, setIsLanguageSelected] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (language) {
            if (language === 'fr') {
                setIsLanguageSelected(0);
            } else {
                setIsLanguageSelected(1);
            }
        }
    }, [language]);

    async function onChangeLanguage() {
        try {
            setLoading(true);
            const result = await API.Instance.post(API.API_ROUTES.onChangeLanguage);
            if (result.status) {
                SHOW_TOAST(result?.data?.message ?? '', 'success');
                fetchProfile();
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error');
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
                screenName={STRING.prefered_language}
            />
            <FlatList data={[{ title: STRING.french }, { title: STRING.english }]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                    return (
                        <TouchableOpacity style={[styles(theme).itemView, {
                            marginTop: index === 0 ? getScaleSize(24) : getScaleSize(16)
                        }]}
                            onPress={() => {
                                if (isLanguageSelected === index) {
                                    return;
                                }
                                if (item.title === STRING.french) {
                                    setLanguage('fr');
                                    onChangeLanguage();
                                } else if (item.title === STRING.english) {
                                    setLanguage('en');
                                    onChangeLanguage();
                                }
                                setIsLanguageSelected(index);
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
