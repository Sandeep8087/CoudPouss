import { Dimensions, Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, useString, SHOW_TOAST } from '../../constant';

//SCREENS
import { SCREENS } from '..';

//COMPONENTS
import { Header, Input, Text, Button } from '../../components';
import { API } from '../../api';
import { CommonActions } from '@react-navigation/native';

export default function ChooseYourSubscription(props: any) {

    const STRING = useString();

    const { theme } = useContext<any>(ThemeContext);
    const { setMyPlan } = useContext<any>(AuthContext);
    const isFromSubscriptionButton: any = props?.route?.params?.isFromSubscriptionButton ?? false;
    const [selectedPlan, setSelectedPlan] = useState<any>('');
    const [allPlans, setAllPlans] = useState([]);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        getAllPlans();
    }, []);

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('beforeRemove', (e: any) => {
            // If this is already a reset action, allow it
            if (e.data.action.type === 'RESET') {
                return;
            }

            // Prevent default back behavior
            e.preventDefault();

            // Redirect to Home (BottomBar)
            props.navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: SCREENS.BottomBar.identifier }],
                }),
            );
        });

        return unsubscribe;
    }, [props.navigation]);

    async function getAllPlans() {
        try {
            setLoading(true);
            const result = await API.Instance.get(API.API_ROUTES.getAllPlans);
            setLoading(false);
            console.log('result', result.status, result)
            if (result.status) {
                const array: any = [...result?.data?.data?.professional, ...result?.data?.data?.non_professional]
                setAllPlans(array);
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

    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => {
                    if (isFromSubscriptionButton) {
                        props.navigation.goBack();
                    } else {
                        props.navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: SCREENS.BottomBar.identifier }],
                            }),
                        );
                    }
                }}
                screenName={STRING.choose_your_subscription}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles(theme).mainContainer}>
                    <View style={styles(theme).subscriptionContainer}>
                        <Text size={getScaleSize(18)}
                            font={FONTS.Lato.SemiBold}
                            color={theme._939393}
                            style={{ marginBottom: getScaleSize(16) }}>
                            {STRING.select_the_plan_that_fits_your_activity_You_can_change_it_later_in_your_profile}
                        </Text>
                        <Text
                            size={getScaleSize(19)}
                            font={FONTS.Lato.Medium}
                            color={theme._214C65}
                            style={{ marginBottom: getScaleSize(12) }}>
                            {STRING.all_premium_plans}
                        </Text>
                        {allPlans.map((item: any) => {
                            return (
                                <TouchableOpacity
                                    key={item?.id}
                                    onPress={() => {
                                        setSelectedPlan(item);
                                    }}
                                    style={styles(theme).subscriptionItem}>
                                    <View style={[styles(theme).flexView, { marginBottom: getScaleSize(16) }]}>
                                        <Text
                                            size={getScaleSize(19)}
                                            font={FONTS.Lato.Bold}
                                            color={theme._214C65}>
                                            {item.name ?? ''}
                                        </Text>
                                        <View>
                                            {selectedPlan?.type === item?.type ?
                                                <Image source={IMAGES.ic_check} style={styles(theme).selectedView} />
                                                :
                                                <View style={styles(theme).selectedView} />
                                            }
                                        </View>
                                    </View>
                                    <Text
                                        size={getScaleSize(18)}
                                        font={FONTS.Lato.Medium}
                                        color={theme._214C65}>
                                        {item?.duration ?? ''}
                                    </Text>
                                    <Text
                                        size={getScaleSize(19)}
                                        font={FONTS.Lato.Bold}
                                        color={theme._214C65}
                                        style={{ marginVertical: getScaleSize(8) }}>
                                        {`€${item?.price ?? '0.00'}`}
                                    </Text>
                                    <Text
                                        size={getScaleSize(12)}
                                        font={FONTS.Lato.Regular}
                                        color={theme._214C65}>
                                        {STRING.billed_recurring_monthly_cancel_anytime}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })}
                        <Text
                            size={getScaleSize(11)}
                            font={FONTS.Lato.Regular}
                            color={theme._2C6587}
                            lineHeight={getScaleSize(16)}>
                            {STRING.subscribe_text}
                        </Text>
                    </View>
                </View>
            </ScrollView>
            <TouchableOpacity
                onPress={() => {
                    props.navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{
                                name: SCREENS.BottomBar.identifier,
                                params: { skipSubscription: true }
                            }],
                        }),
                    );
                }}>
                <Text
                    size={getScaleSize(14)}
                    font={FONTS.Lato.SemiBold}
                    color={theme._2C6587}
                    align="center"
                    style={{ marginBottom: getScaleSize(16) }}>
                    {STRING.skip}
                </Text>
            </TouchableOpacity>
            <Button
                title={STRING.subscribe}
                style={{ marginBottom: getScaleSize(24), marginHorizontal: getScaleSize(24) }}
                onPress={() => {
                    if (!selectedPlan) {
                        SHOW_TOAST(STRING.please_select_a_plan, 'error');
                    } else {
                        props.navigation.navigate(SCREENS.SelectedPlanDetails.identifier, {
                            plan: selectedPlan,
                            isFromSubscriptionButton: isFromSubscriptionButton
                        });
                    }
                }}
            />
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
        inputContainer: {
            marginBottom: getScaleSize(16),
        },
        textInput: {
            width: getScaleSize(77),
            height: getScaleSize(54),
            borderWidth: 1,
            borderRadius: getScaleSize(12),
            borderBottomWidth: 1,
            borderColor: theme._BFBFBF,
            fontSize: getScaleSize(16),
            fontFamily: FONTS.Lato.Bold,
            color: theme._31302F,
            backgroundColor: theme.white,
        },
        subscriptionContainer: {
            marginBottom: getScaleSize(16)
        },
        subscriptionItem: {
            borderColor: theme._CCCCCC66,
            borderWidth: 1,
            borderRadius: getScaleSize(12),
            paddingVertical: getScaleSize(24),
            paddingHorizontal: getScaleSize(20),
            marginBottom: getScaleSize(20)
        },
        flexView: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        selectedView: {
            width: getScaleSize(24),
            height: getScaleSize(24),
            borderRadius: getScaleSize(24),
            borderWidth: 1,
            borderColor: theme._2C6587
        }
    });
