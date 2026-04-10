import { Alert, Dimensions, FlatList, Image, Linking, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

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
import { CommonActions } from '@react-navigation/native';

export default function AddServices(props: any) {

    const STRING = useString();

    const isFromManageServices: boolean = props?.route?.params?.isFromManageServices ?? false;
    const isEdit: boolean = props?.route?.params?.isEdit ?? false;
    const categoryId: string = props?.route?.params?.categoryId ?? '';
    const disableServicesIds: string[] = props?.route?.params?.disableServicesIds ?? [];

    const { setSelectedServices, selectedServices, profile } = useContext<any>(AuthContext);
    const { theme } = useContext<any>(ThemeContext);

    const bottomSheetRef = useRef<any>(null);
    const [allCategories, setAllCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [isLoading, setLoading] = useState(false);
    const [subCategoryList, setSubCategoryList] = useState([]);
    const [paymentPopup, setPaymentPopup] = useState(false);
    const [localSelectedServices, setLocalSelectedServices] = useState<any[]>(selectedServices ?? []);
    const lastServiceTapRef = useRef<Record<string, number>>({});
    const SERVICE_TAP_GUARD_MS = 250;


    useEffect(() => {
        if (isEdit) {
            setSelectedCategory(allCategories?.find((item: any) => item.id === categoryId));
            getSubCategoryData(categoryId);
        }
    }, [isEdit, categoryId, allCategories]);


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

            if (url.includes('categories-updated')) {
                const params = parseParams(url);
                const type = params.type;
                if (type == 'update') {
                    setTimeout(() => {
                        props?.navigation?.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{
                                    name: SCREENS.ManageServices.identifier,
                                    params: {
                                        isFromSelectServices: true,
                                    },
                                }],
                            }),
                        );
                    }, 2000);
                }
            }

            if (url.includes('categories-cancelled')) {
                const params = parseParams(url);
                const error = params.error || 'Payment cancelled';
                const type = params.type;

                if (type == 'update') {
                    SHOW_TOAST(error ?? 'Payment cancelled', 'error');
                }
            }
        });

        const handleUrl = ({ url }: { url: string }) => {
            console.log('Deep link:', url);
            // ✅ PAYMENT SUCCESS
            if (url.startsWith('coudpouss://categories-updated')) {
                const params = parseParams(url);
                const type = params.type;

                if (type == 'update') {
                    setTimeout(() => {
                        props?.navigation?.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{
                                    name: SCREENS.ManageServices.identifier,
                                    params: {
                                        isFromSelectServices: true,
                                    },
                                }],
                            }),
                        );
                    }, 2000);
                } else {

                }
                return;
            }
            // ❌ PAYMENT CANCEL
            if (url.startsWith('coudpouss://categories-cancelled')) {
                const params = parseParams(url);
                const error = params.error || 'Payment cancelled';
                const type = params.type;

                if (type == 'update') {
                    SHOW_TOAST(error ?? 'Payment cancelled', 'error');
                }
                return;
            }
        };

        const linkingSubscription = Linking.addEventListener('url', handleUrl);

        return () => {
            linkingSubscription.remove()
        };
    }, []);

    async function getAllCategories() {
        try {
            setLoading(true);
            const result = await API.Instance.get(API.API_ROUTES.allCategories);
            setLoading(false);
            if (result.status) {
                const sortedData: any = [...(result?.data?.data || [])].sort(
                    (a: any, b: any) =>
                        a.category_name?.toLowerCase().localeCompare(b.category_name?.toLowerCase())
                );
                setAllCategories(sortedData);
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error')
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
            if (result.status) {
                setSubCategoryList(result?.data?.data?.subcategories ?? []);
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error')
            }
        } catch (error: any) {
            setLoading(false);
            SHOW_TOAST(error?.message ?? '', 'error');
            console.log(error?.message)
        } finally {
            setLoading(false);
        }
    }


    const selectedServiceIds = useMemo(() => {
        if (!selectedCategory?.id || !localSelectedServices?.length) {
            return new Set<string>();
        }
        const categoryItem = localSelectedServices.find((e: any) => e?.category?.id === selectedCategory?.id);
        const ids = (categoryItem?.service ?? []).map((service: any) => service?.id).filter(Boolean);
        return new Set<string>(ids);
    }, [selectedCategory?.id, localSelectedServices]);

    const isServiceSelected = useCallback((item: any) => {
        return selectedServiceIds.has(item?.id);
    }, [selectedServiceIds]);

    const onSelectServices = useCallback((item: any) => {
        if (!selectedCategory) return;

        setLocalSelectedServices((prev: any[] = []) => {
            const categoryItemIndex = prev.findIndex((e: any) => e?.category?.id === selectedCategory?.id);

            if (categoryItemIndex === -1) {
                return [
                    ...prev,
                    {
                        category: selectedCategory,
                        service: [item],
                    },
                ];
            }

            const categoryItem = prev[categoryItemIndex];
            const currentServices: any[] = categoryItem?.service ?? [];
            const isAlreadySelected = currentServices.some((e: any) => e?.id === item?.id);
            const updatedServices = isAlreadySelected
                ? currentServices.filter((e: any) => e?.id !== item?.id)
                : [...currentServices, item];

            if (updatedServices.length === 0) {
                return prev.filter((_: any, index: number) => index !== categoryItemIndex);
            }

            const updated = [...prev];
            updated[categoryItemIndex] = {
                ...categoryItem,
                category: selectedCategory,
                service: updatedServices,
            };
            return updated;
        });
    }, [selectedCategory]);

    const onSelectServicesForManageServices = useCallback((item: any) => {
        if (!selectedCategory) return;

        setLocalSelectedServices((prev: any[] = []) => {
            const current = prev[0];

            // reset services if category changed
            const currentServices: any[] =
                current?.category?.id === selectedCategory?.id
                    ? (current?.service ?? [])
                    : [];

            const exists = currentServices.some((e: any) => e?.id === item?.id);
            const services = exists
                ? currentServices.filter((e: any) => e?.id !== item?.id)
                : [...currentServices, item];

            if (services.length === 0) {
                return [];
            }

            // always save ONE category
            return [
                {
                    category: selectedCategory,
                    service: services,
                },
            ];
        });
    }, [selectedCategory]);

    const canHandleServiceTap = useCallback((serviceId?: string) => {
        if (!serviceId) return true;
        const now = Date.now();
        const lastTappedAt = lastServiceTapRef.current[serviceId] ?? 0;
        if (now - lastTappedAt < SERVICE_TAP_GUARD_MS) {
            return false;
        }
        lastServiceTapRef.current[serviceId] = now;
        return true;
    }, []);

    const handleServicePress = useCallback((e: any) => {
        if (!canHandleServiceTap(e?.id)) {
            return;
        }
        if (isFromManageServices) {
            onSelectServicesForManageServices(e);
        } else {
            onSelectServices(e);
        }
    }, [canHandleServiceTap, isFromManageServices, onSelectServices, onSelectServicesForManageServices]);

    async function onSelectedCategoriesProfessional() {
        const output = localSelectedServices.map((item: any) => ({
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
                setLocalSelectedServices([]);
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
        const output = localSelectedServices.map((item: any) => ({
            category_id: item.category.id,
            sub_category_ids: item.service.map((e: any) => e.id),
        }));
        const params = {
            categories_subcategory_ids: output
        }
        console.log('params==>', params)
        try {
            setLoading(true);
            const result = await API.Instance.post(API.API_ROUTES.onSelectedCategoriesNonProfessional + `?platform=app&action=update`, params);
            if (result.status) {
                if (result?.data?.data?.checkout_url) {
                    const STRIPE_URL = result?.data?.data?.checkout_url ?? '';
                    openStripeCheckout(STRIPE_URL);
                    setLocalSelectedServices([]);
                    setSelectedServices([]);
                    bottomSheetRef.current.close();
                } else {
                    props?.navigation?.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{
                                name: SCREENS.ManageServices.identifier,
                                params: {
                                    isFromSelectServices: true,
                                },
                            }],
                        }),
                    );
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
                        // if (localSelectedServices.length > 0) {
                        //     const categoryItem = localSelectedServices.find((e: any) => e?.category?.id === selectedCategory?.id);
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
                            extraData={`${selectedCategory?.id ?? ''}:${selectedServiceIds.size}`}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(item: any, index: number) => item?.id?.toString?.() ?? index.toString()}
                            removeClippedSubviews={true}
                            initialNumToRender={12}
                            maxToRenderPerBatch={10}
                            windowSize={7}
                            renderItem={({ item, index }) => {
                                const isSelected = isServiceSelected(item);
                                const isDisabled = disableServicesIds.includes(item?.id);
                                return (
                                    <ServiceItem
                                        item={item}
                                        itemContainer={styles(theme).itemContainer}
                                        isSelectedBox={true}
                                        isSelected={isSelected}
                                        isDisabled={isDisabled}
                                        onPress={handleServicePress}
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
                        setLocalSelectedServices([]);
                        setSelectedServices([]);
                    }}
                    style={styles(theme).backButton}>
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
                    disabled={localSelectedServices?.length == 0}
                    onPress={() => {
                        if (localSelectedServices?.length == 0) {
                            return
                        }
                        if (isFromManageServices) {
                            if (profile?.user?.service_provider_type === 'professional') {
                                onSelectedCategoriesProfessional();
                            } else {
                                if (localSelectedServices.length > 1) {
                                    bottomSheetRef.current.open();
                                } else {
                                    onSelectedCategoriesNonProfessional();
                                }
                            }
                        } else {
                            setSelectedServices(localSelectedServices);
                            props.navigation.navigate(SCREENS.ReviewServices.identifier);
                        }
                    }}
                />
            </View>
            <BottomSheet
                bottomSheetRef={bottomSheetRef}
                height={getScaleSize(380)}
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