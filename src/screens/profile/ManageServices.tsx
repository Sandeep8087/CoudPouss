import {
    ActivityIndicator,
    FlatList,
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';

// CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

// CONSTANTS & ASSETS
import { arrayIcons, getScaleSize, SHOW_TOAST, useString } from '../../constant';
import { FONTS, IMAGES } from '../../assets';

// COMPONENTS
import {
    BottomSheet,
    Button,
    EmptyView,
    Header,
    ProgressView,
    ServiceItem,
    Text,
} from '../../components';
import { SCREENS } from '..';
import { API } from '../../api';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ManageServices(props: any) {

    const insets = useSafeAreaInsets();

    const isFromSelectServices: boolean = props?.route?.params?.isFromSelectServices ?? false;
    const { theme } = useContext<any>(ThemeContext);
    const STRING = useString();
    const bottomSheetRef = useRef<any>(null);
    const { profile } = useContext<any>(AuthContext);

    const [isLoading, setLoading] = useState(false);
    const [services, setServices] = useState<any>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<any>(null);

    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            getServices(false);
        }
    }, [isFocused]);

    /* ================= GET SERVICES ================= */
    async function getServices(keepSelection = true) {
        try {
            setLoading(true);
            const result = await API.Instance.get(API.API_ROUTES.getAllService);

            if (result.status) {
                const serviceList = result?.data?.data?.services ?? [];

                console.log('serviceList==>', JSON.stringify(result?.data?.data))
                setServices(result?.data?.data ?? []);

                if (!keepSelection || !selectedCategoryId) {
                    setSelectedCategoryId(serviceList?.[0]?.category_id ?? null);
                } else {
                    const exists = serviceList.find(
                        (i: any) => i.category_id === selectedCategoryId
                    );

                    setSelectedCategoryId(
                        exists
                            ? exists.category_id
                            : serviceList?.[0]?.category_id ?? null
                    );
                }
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error');
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
        } finally {
            setLoading(false);
        }
    }

    /* ================= REMOVE SERVICE ================= */
    async function removeService(id: any) {
        try {
            setLoading(true);
            const result = await API.Instance.delete(
                API.API_ROUTES.removeService + `/${id}`
            );

            if (result.status) {
                SHOW_TOAST(result?.data?.message ?? '', 'success');
                getServices(true); // 🔥 KEEP SELECTED TAB
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error');
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
        } finally {
            setLoading(false);
        }
    }

    /* ================= SELECTED SERVICE ================= */
    const selectedService = services?.services?.find(
        (i: any) => i.category_id === selectedCategoryId
    );

    console.log('services==>', services, services?.services?.length > 1)

    function renderSubCategories() {
        if (selectedService?.subcategories?.length > 0) {
            return (
                <FlatList
                    data={selectedService?.subcategories ?? []}
                    keyExtractor={(item) => item.sub_category_id.toString()}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <ServiceItem
                            item={item}
                            itemContainer={
                                styles(theme).itemContainerStyle
                            }
                            isManage={true}
                            onRemove={() =>
                                removeService(item.sub_category_id)
                            }
                            onEdit={(item: any) => {

                                const subCategoryIds = services?.services?.flatMap((service: any) =>
                                    service.subcategories.map((sub: any) => sub.sub_category_id)
                                ) || [];

                                props.navigation.navigate(SCREENS.AddServices.identifier, {
                                    isFromManageServices: true,
                                    isEdit: true,
                                    categoryId: selectedCategoryId,
                                    disableServicesIds: subCategoryIds,
                                });
                            }}
                        />
                    )}
                />
            )
        } else if (isLoading) {
            return (
                <View style={styles(theme).emptyView}>
                    <ActivityIndicator size="large" color={theme.primary} style={{ margin: 20 }} />
                </View>
            )
        } else {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={IMAGES.empty} style={styles(theme).emptyImage} />
                </View>
            )
        }
    }

    return (
        <View style={[styles(theme).container, { paddingBottom: Platform.OS === 'android' ? insets.bottom : 0 }]}>
            <Header
                onBack={() => {
                    if (isFromSelectServices) {
                        props.navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{
                                    name: SCREENS.BottomBar.identifier,
                                    params: { isProfessionalProfile: true }
                                }],
                            }),
                        );
                    } else {
                        props.navigation.goBack();
                    }
                }}
                screenName={STRING.manage_services}
            />
            {profile?.has_purchased ? (
                <View style={styles(theme).mainContainer}>
                    <Text
                        size={getScaleSize(18)}
                        font={FONTS.Lato.Medium}
                        color={theme._737373}
                        style={{ marginHorizontal: getScaleSize(24) }}>
                        {profile?.user?.service_provider_type === 'professional' ?
                            STRING.all_service_categories_are_included_in_your_plan_Add_as_many_as_you_need_all_included_in_subscription_plan
                            : STRING.here_you_can_easily_manage_your_service_categories_each_additional_category_you_add_will_incur_a_monthly_fee_of}
                    </Text>
                    {services?.services?.length > 0 && (
                        <>
                            <View style={styles(theme).divider} />
                            <View style={styles(theme).serviceContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {(services?.services ?? []).map((item: any, index: number) => {
                                        const isSelected = selectedCategoryId === item.category_id;
                                        const isLast = index === services?.services.length - 1;
                                        return (
                                            <TouchableOpacity
                                                key={item.category_id}
                                                onPress={() =>
                                                    setSelectedCategoryId(
                                                        item.category_id
                                                    )
                                                }
                                                style={[
                                                    styles(theme).serviceItemContainer,
                                                    {
                                                        marginRight: isLast ? getScaleSize(24) : 0,
                                                        marginLeft: index === 0 ? getScaleSize(24) : getScaleSize(16),
                                                        backgroundColor: isSelected
                                                            ? theme._2C6587
                                                            : theme._F7F7F7,
                                                    },
                                                ]}>
                                                <Image
                                                    source={arrayIcons[item?.category_name?.toLowerCase() as keyof typeof arrayIcons] ?? arrayIcons['diy'] as any}
                                                    style={[
                                                        styles(theme).itemIcon,
                                                        {
                                                            tintColor: isSelected
                                                                ? theme.white
                                                                : theme._C1C1C1,
                                                        },
                                                    ]}
                                                />
                                                <Text
                                                    size={getScaleSize(16)}
                                                    font={FONTS.Lato.SemiBold}
                                                    color={
                                                        isSelected
                                                            ? theme.white
                                                            : theme._818285
                                                    }>
                                                    {item?.category_name ?? ''}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    }
                                    )}
                                </ScrollView>
                            </View>
                        </>
                    )}
                    <View style={{ marginVertical: getScaleSize(24), flex: 1 }}>
                        {renderSubCategories()}
                    </View>
                </View>
            ) : (
                <EmptyView
                    title={STRING.you_have_not_subscribed_to_any_plan}
                    style={styles(theme).emptyContainer}
                    onPressButton={() => {
                        props.navigation.navigate(SCREENS.ChooseYourSubscription.identifier, {
                            isFromSubscriptionButton: true,
                        });
                    }}
                />
            )}
            {profile?.has_purchased && (
                <Button
                    title={services?.services?.length > 0 ? STRING.add_more_services : STRING.add_service}
                    style={{
                        marginHorizontal: getScaleSize(24),
                        marginBottom: getScaleSize(24),
                    }}
                    onPress={() => {
                        if (profile?.user?.service_provider_type === 'professional') {
                            const subCategoryIds = services?.services?.flatMap((service: any) =>
                                service.subcategories.map((sub: any) => sub.sub_category_id)
                            ) || [];

                            props.navigation.navigate(
                                SCREENS.AddServices.identifier,
                                { isFromManageServices: true, disableServicesIds: subCategoryIds }
                            );
                        } else {
                            if (services?.services?.length > 0) {
                                bottomSheetRef.current.open();
                            } else {

                                const subCategoryIds = services?.services?.flatMap((service: any) =>
                                    service.subcategories.map((sub: any) => sub.sub_category_id)
                                ) || [];

                                props.navigation.navigate(
                                    SCREENS.AddServices.identifier,
                                    { isFromManageServices: true, disableServicesIds: subCategoryIds }
                                );
                            }
                        }
                    }}
                />
            )}
            <BottomSheet
                bottomSheetRef={bottomSheetRef}
                height={getScaleSize(330)}
                addMoreServices={true}
                title={
                    STRING.additional_category_you_add_will_incur_a_monthly_fee_of
                }
                description={
                    STRING.you_are_on_Non_professional_plan_that_s_why_you_need_to_pay_to_add_more_category_of_services
                }
                buttonTitle={STRING.proceed}
                secondButtonTitle={STRING.cancel}
                onPressButton={() => {

                    const subCategoryIds = services?.services?.flatMap((service: any) =>
                        service.subcategories.map((sub: any) => sub.sub_category_id)
                    ) || [];

                    props.navigation.navigate(SCREENS.AddServices.identifier,
                        { isFromManageServices: true, disableServicesIds: subCategoryIds }
                    );
                    bottomSheetRef.current.close();
                }}
            />

            {isLoading && <ProgressView />}
        </View>
    );
}

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.white },
        mainContainer: { flex: 1 },
        divider: {
            height: 1,
            backgroundColor: theme._D5D5D5,
            marginBottom: getScaleSize(24),
            marginTop: getScaleSize(18),
            marginHorizontal: getScaleSize(24),
        },
        serviceItemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: getScaleSize(10),
            paddingHorizontal: getScaleSize(12),
            borderRadius: getScaleSize(10),
        },
        serviceContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        itemIcon: {
            width: getScaleSize(24),
            height: getScaleSize(24),
            marginRight: getScaleSize(14),
        },
        itemContainerStyle: {
            marginBottom: getScaleSize(18),
            marginHorizontal: getScaleSize(24),
        },
        emptyImage: {
            height: getScaleSize(217),
            width: getScaleSize(184),
            alignSelf: 'center',
        },
        emptyView: {
            flex: 1.0,
            alignSelf: 'center',
            marginTop: getScaleSize(41),
        },
        emptyContainer: {
            marginHorizontal: getScaleSize(24),
            marginVertical: getScaleSize(24),
            flex: 1,
        }
    });
