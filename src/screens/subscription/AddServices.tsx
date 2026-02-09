import { Alert, Dimensions, FlatList, Image, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, useString, SHOW_TOAST, openStripeCheckout } from '../../constant';

//SCREENS
import { SCREENS } from '..';

//COMPONENTS
import { Header, Input, Text, Button, CategoryDropdown, ServiceItem, BottomSheet, ProgressView } from '../../components';
import { API } from '../../api';
import { EventRegister } from 'react-native-event-listeners';


export default function AddServices(props: any) {

    const STRING = useString();

    const isFromManageServices: boolean = props?.route?.params?.isFromManageServices ?? false;

    const { setSelectedServices, selectedServices, profile } = useContext<any>(AuthContext);
    const { theme } = useContext<any>(ThemeContext);

    console.log('profile==>', profile)

    const bottomSheetRef = useRef<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [isLoading, setLoading] = useState(false);
    const [allCategories, setAllCategories] = useState([]);
    const [subCategoryList, setSubCategoryList] = useState([]);
    const [paymentPopup, setPaymentPopup] = useState(false);

    useEffect(() => {
        getAllCategories();
    }, []);

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

            if (url.includes('payment-success')) {
                const params = parseParams(url);
                const type = params.type;
                if (type == 'subscription_payment') {
                    Alert.alert('Payment successful');
                    props.navigation.navigate(SCREENS.SubscriptionSuccessful.identifier, {
                        planDetails: params,
                    });
                }
            }

            if (url.includes('payment-cancel')) {
                const params = parseParams(url);
                const error = params.error || 'Payment cancelled';
                const type = params.type;

                if (type == 'subscription_payment') {
                    Alert.alert(error ?? 'Payment cancelled');
                }
            }
        });

        const handleUrl = ({ url }: { url: string }) => {
            console.log('Deep link:', url);
            // ✅ PAYMENT SUCCESS
            if (url.startsWith('coudpouss://payment-success')) {
                const params = parseParams(url);
                const type = params.type;

                if (type == 'subscription') {
                    setTimeout(() => {
                        props.navigation.navigate(SCREENS.SubscriptionSuccessful.identifier, {
                            planDetails: params,
                        });
                    }, 2000);
                } else {

                }
                return;
            }
            // ❌ PAYMENT CANCEL
            if (url.startsWith('coudpouss://payment-cancel')) {
                const params = parseParams(url);
                const error = params.error || 'Payment cancelled';
                const type = params.type;

                if (type == 'subscription') {
                    EventRegister.emit('onPaymentCancel', {
                        message: error,
                    });
                }
                return;
            }
        };

        Linking.addEventListener('url', handleUrl);

        return () => {
            Linking.removeAllListeners('url')
        };
    }, []);

    async function getAllCategories() {
        try {
            setLoading(true);
            const result = await API.Instance.get(API.API_ROUTES.allCategories);
            setLoading(false);
            console.log('result', result.status, result)
            if (result.status) {
                console.log('allCategories==', result?.data?.data)
                setAllCategories(result?.data?.data);
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error')
                console.log('error==>', result?.data?.message)
            }
        } catch (error: any) {
            setLoading(false);
            SHOW_TOAST(error?.message ?? '', 'error');
            console.log(error?.message)
        } finally {
            setLoading(false);
        }
    }

    async function getSubCategoryData(id: string) {
        try {
            setLoading(true);
            const result = await API.Instance.get(API.API_ROUTES.getHomeData + `/${id}`);
            setLoading(false);
            console.log('result', result.status, result)
            if (result.status) {
                console.log('subcategoryList==', result?.data?.data)
                setSubCategoryList(result?.data?.data?.subcategories ?? []);
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error')
                console.log('error==>', result?.data?.message)
            }
        } catch (error: any) {
            setLoading(false);
            SHOW_TOAST(error?.message ?? '', 'error');
            console.log(error?.message)
        } finally {
            setLoading(false);
        }
    }


    const isServiceSelected = (item: any) => {
        if (selectedServices && selectedServices.length > 0) {
            const categoryItem = selectedServices.find((e: any) => e?.category?.id === selectedCategory?.id);
            if (categoryItem) {
                return categoryItem?.service?.some((f: any) => f?.id === item?.id);
            }
        }
        return false;
    }

    async function onSelectServices(item: any) {
        if (selectedServices && selectedServices.length > 0) {
            const categoryItem = selectedServices.find((e: any) => e?.category?.id === selectedCategory?.id);
            if (categoryItem) {
                const newCategoryItem = { ...categoryItem };

                let services: any[] = newCategoryItem?.service ?? [];
                const serviceItem = services?.find((e: any) => e?.id === item?.id);
                if (serviceItem) {
                    services = services.filter((e: any) => e.id !== item.id);
                }
                else {
                    services = [...services, item];
                }

                newCategoryItem.service = services;

                const categoryItemIndex = selectedServices.findIndex((e: any) => e?.category?.id === selectedCategory?.id);
                if (newCategoryItem.service && newCategoryItem.service.length > 0) {
                    selectedServices.splice(categoryItemIndex, 1, newCategoryItem);
                    setSelectedServices([...selectedServices]);
                }
                else {
                    selectedServices.splice(categoryItemIndex, 1);
                    setSelectedServices([...selectedServices]);
                }
            }
            else {
                const newCategoryItem = {
                    category: selectedCategory,
                    service: [item],
                }

                setSelectedServices([...selectedServices, newCategoryItem]);
            }
        }
        else {
            const categoryItem = {
                category: selectedCategory,
                service: [item],
            }

            setSelectedServices([...selectedServices, categoryItem]);
        }
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
            const result = await API.Instance.post(API.API_ROUTES.onSendCategoryIds + `?action=update`, params);
            if (result.status) {
                props.navigation.goBack();
                setSelectedServices([]);
                SHOW_TOAST(result?.data?.message, 'success')
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
            const result = await API.Instance.post(API.API_ROUTES.onSelectedCategoriesNonProfessional + `?platform=app&action=update`, params);
            if (result.status) {
                const STRIPE_URL = result?.data?.data?.checkout_url ?? '';
                openStripeCheckout(STRIPE_URL);
                setSelectedServices([]);
                bottomSheetRef.current.close();
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
                    {selectedCategory ? STRING.select_a_service : STRING.select_a_category}
                </Text>
                <Text size={getScaleSize(16)}
                    font={FONTS.Lato.SemiBold}
                    color={theme._939393}
                    style={{ marginBottom: getScaleSize(24) }}>
                    {selectedCategory ?
                        STRING.thank_you_for_choosing_a_category_Now_select_the_services_you_want_to_provide_within_this_category
                        :
                        STRING.choose_a_category_that_best_matches_your_services_This_helps_us_connect_you_with_the_right_clients
                    }
                </Text>
                <CategoryDropdown
                    onChange={(item) => {
                        // if (selectedServices.length > 0) {
                        //     const categoryItem = selectedServices.find((e: any) => e?.category?.id === selectedCategory?.id);
                        //     if (categoryItem) {
                        //         bottomSheetRef.current.open();
                        //     } else {
                        //         setSelectedCategory(item);
                        //         getSubCategoryData(item?.id);
                        //     }
                        // } else {
                        //     setSelectedCategory(item);
                        //     getSubCategoryData(item?.id);
                        // }

                        setSelectedCategory(item);
                        getSubCategoryData(item?.id);

                    }}
                    selectedItem={selectedCategory}
                    container={{}}
                    data={allCategories}
                />
                {selectedCategory && (
                    <View style={styles(theme).divider} />
                )}
                <View style={{ flex: 1.0 }}>
                    {selectedCategory && (
                        <FlatList
                            data={subCategoryList}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item: any, index: number) => index.toString()}
                            renderItem={({ item, index }) => {
                                const isSelected = isServiceSelected(item);
                                return (
                                    <ServiceItem
                                        item={item}
                                        itemContainer={styles(theme).itemContainer}
                                        isSelectedBox={true}
                                        isSelected={isSelected}
                                        onPress={(e: any) => {
                                            onSelectServices(e);
                                        }}
                                    />

                                )
                            }}
                        />
                    )}
                </View>
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
                        if (isFromManageServices) {
                            if (profile?.user?.service_provider_type === 'professional') {
                                onSelectedCategoriesProfessional();
                            } else {
                                if (selectedServices.length > 1) {
                                    bottomSheetRef.current.open();
                                } else {
                                    onSelectedCategoriesNonProfessional();
                                }
                            }
                        } else {
                            props.navigation.navigate(SCREENS.ReviewServices.identifier);
                        }
                    }}
                />
            </View>
            <BottomSheet
                bottomSheetRef={bottomSheetRef}
                height={getScaleSize(350)}
                type="payment"
                title={STRING.want_to_add_more_service_categories}
                description={STRING.additional_category_you_add_will_incur_a_monthly_fee_of}
                buttonTitle={STRING.proceed_to_pay}
                secondButtonTitle={STRING.cancel}
                onPressButton={() => {
                    onSelectedCategoriesNonProfessional()

                }}
                onPressSecondButton={() => {
                    bottomSheetRef.current.close();
                }}
            />
            {isLoading && <ProgressView />}
        </View>
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
            marginBottom: getScaleSize(16)
        },
        divider: {
            height: 1,
            backgroundColor: theme._D5D5D5,
            marginVertical: getScaleSize(24)
        }
    });