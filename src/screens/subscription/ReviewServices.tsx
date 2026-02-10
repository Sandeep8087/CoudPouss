import { Dimensions, FlatList, Image, Linking, ScrollView, SectionList, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, useString, SHOW_TOAST, arrayIcons, openStripeCheckout } from '../../constant';

//SCREENS
import { SCREENS } from '..';

//COMPONENTS
import { Header, Input, Text, Button, ServiceItem } from '../../components';
import { API } from '../../api';
import { CommonActions } from '@react-navigation/native';


export default function ReviewServices(props: any) {

    const STRING = useString();

    const { theme } = useContext<any>(ThemeContext);
    const { selectedServices, setSelectedServices, myPlan, profile } = useContext<any>(AuthContext);

    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        const parseParams = (url: string) => {
            const queryString = url.split('?')[1] || '';
            const params: Record<string, string> = {};

            queryString.split('&').forEach(item => {
                if (!item) return;
                const [key, value] = item.split('=');
                params[key] = decodeURIComponent(value || '');
            });

            return params;
        };

        Linking.getInitialURL().then((url: any) => {
            if (!url) return;

            if (url.includes('categories-added')) {
                const params = parseParams(url);
                const type = params.type;
                if (type == 'add') {
                    props.navigation.navigate(SCREENS.AccountCreatedSuccessfully.identifier);
                }
            }

            if (url.includes('categories-cancelled')) {
                const params = parseParams(url);
                const error = params.error || 'Payment cancelled';
                const type = params.type;

                if (type == 'add') {
                    SHOW_TOAST(error ?? 'Payment cancelled', 'error');
                }
            }
        });

        const handleUrl = ({ url }: { url: string }) => {
            console.log('Deep link:', url);
            // ✅ PAYMENT SUCCESS
            if (url.startsWith('coudpouss://categories-added')) {
                const params = parseParams(url);
                const type = params.type;

                if (type == 'add') {
                    props.navigation.navigate(SCREENS.AccountCreatedSuccessfully.identifier);
                } else {

                }
                return;
            }
            // ❌ PAYMENT CANCEL
            if (url.startsWith('coudpouss://categories-cancelled')) {
                const params = parseParams(url);
                const error = params.error || 'Payment cancelled';
                const type = params.type;

                if (type == 'add') {
                    SHOW_TOAST(error ?? 'Payment cancelled', 'error');
                }
                return;
            }
        };

        Linking.addEventListener('url', handleUrl);

        return () => {
            Linking.removeAllListeners('url')
        };
    }, []);

    const onDeleteService = (service: any) => {
        const updated = selectedServices
            .map((section: any) => ({
                ...section,
                service: section?.service?.filter((s: any) => s?.id !== service?.id)
            }))
            .filter((section: any) => section?.service?.length > 0);

        setSelectedServices(updated);
    };

    async function onSelectedCategoriesProfessional() {
        const output = selectedServices.map((item: any) => ({
            category_id: item.category.id,
            sub_category_ids: item.service.map((e: any) => e.id),
        }));
        const params = {
            services: output
        }
        try {
            setLoading(true);
            const result = await API.Instance.post(API.API_ROUTES.onSendCategoryIds + `?action=add`, params);
            if (result.status) {
                setSelectedServices([]);
                if (myPlan === 'professional') {
                    props.navigation.navigate(SCREENS.AddBankDetails.identifier);
                } else {
                    props.navigation.navigate(SCREENS.AccountCreatedSuccessfully.identifier);
                }
            } else {
                SHOW_TOAST(result?.data?.message, 'error')
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
            console.log(error?.message)
        } finally {
            setLoading(false);
        }
    }

    async function onSelectedCategoriesNonProfessional() {
        const output = selectedServices.map((item: any) => ({
            category_id: item.category.id,
            sub_category_ids: item.service.map((e: any) => e.id),
        }));
        const params = {
            categories_subcategory_ids: output
        }
        try {
            setLoading(true);
            const result = await API.Instance.post(API.API_ROUTES.onSelectedCategoriesNonProfessional + `?platform=app&action=add`, params);
            if (result.status) {
                const STRIPE_URL = result?.data?.data?.checkout_url ?? '';
                openStripeCheckout(STRIPE_URL);
            } else {
                SHOW_TOAST(result?.data?.message, 'error')
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
            console.log(error?.message)
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
                screenName={STRING.add_services}
            />
            <View style={styles(theme).mainContainer}>
                <Text size={getScaleSize(24)}
                    font={FONTS.Lato.Bold}
                    color={theme._2C6587}
                    style={{ marginBottom: getScaleSize(12) }}>
                    {STRING.select_a_service}
                </Text>
                <Text size={getScaleSize(16)}
                    font={FONTS.Lato.SemiBold}
                    color={theme._939393}
                    style={{ marginBottom: getScaleSize(24) }}>
                    {STRING.review_your_selected_services_You_can_go_back_to_make_changes_or_continue_to_confirm_your_choices}
                </Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ flex: 1.0 }}>
                        {selectedServices.map((section: any, index: number) => {
                            return (
                                <View key={index} style={styles(theme).itemContainer}>
                                    <View style={styles(theme).sectionHeaderContainer}>
                                        <Image
                                            source={arrayIcons[section?.category?.category_name?.toLowerCase() as keyof typeof arrayIcons] ?? arrayIcons['diy'] as any}
                                            style={[styles(theme).sectionHeaderIcon, { tintColor: theme._2C6587 }]}
                                            resizeMode='cover' />
                                        <Text size={getScaleSize(16)}
                                            font={FONTS.Lato.SemiBold}
                                            color={theme._2C6587}>
                                            {section?.category?.category_name ?? ''}
                                        </Text>
                                    </View>
                                    {(section?.service ?? []).map((item: any, index: number) => {
                                        return (
                                            <ServiceItem
                                                key={index}
                                                item={item}
                                                itemContainer={{ marginBottom: getScaleSize(20) }}
                                                isReview={true}
                                                onPress={() => {
                                                    onDeleteService(item);
                                                }}
                                            />
                                        )
                                    })}
                                </View>
                            )
                        })}
                    </View>
                </ScrollView>
            </View>
            <View style={styles(theme).buttonContainer}>
                <TouchableOpacity
                    onPress={() => {
                        props.navigation.goBack();
                    }} style={styles(theme).backButton}>
                    <Text
                        size={getScaleSize(19)}
                        font={FONTS.Lato.Bold}
                        color={theme._214C65}
                        align="center">
                        {STRING.back}
                    </Text>
                </TouchableOpacity>
                <View style={{ width: getScaleSize(16) }} />
                <Button
                    title={STRING.next}
                    style={{ flex: 1.0 }}
                    onPress={() => {
                        if (profile?.user?.service_provider_type === 'professional') {
                            onSelectedCategoriesProfessional();
                        } else {
                            onSelectedCategoriesNonProfessional();
                        }
                    }}
                />
            </View>
        </View >
    );
}

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        container: {
            flex: 1.0,
            backgroundColor: theme.white,
            justifyContent: 'center'
        },
        mainContainer: {
            flex: 1.0,
            marginHorizontal: getScaleSize(24),
            marginVertical: getScaleSize(14),
            justifyContent: 'center'
        },
        buttonContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: getScaleSize(24),
            marginBottom: getScaleSize(24)
        },
        backButton: {
            flex: 1.0,
            borderWidth: 1,
            borderRadius: getScaleSize(12),
            borderColor: theme._214C65,
            paddingVertical: getScaleSize(18),
            alignItems: 'center',
            justifyContent: 'center',
        },
        itemContainer: {
            marginBottom: getScaleSize(24),
            borderWidth: 1,
            borderColor: theme._E6E6E6,
            borderRadius: getScaleSize(12),
            paddingTop: getScaleSize(24),
            paddingHorizontal: getScaleSize(24),
            paddingBottom: getScaleSize(4),
        },
        sectionHeaderContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme._2C6587,
            borderRadius: getScaleSize(10),
            paddingVertical: getScaleSize(10),
            paddingHorizontal: getScaleSize(16),
            marginBottom: getScaleSize(16),
            alignSelf: 'flex-start'
        },
        sectionHeaderIcon: {
            width: getScaleSize(24),
            height: getScaleSize(24),
            marginRight: getScaleSize(14)
        }
    });



