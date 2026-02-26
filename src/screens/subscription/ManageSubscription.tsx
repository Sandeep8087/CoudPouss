import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';
import { FONTS, IMAGES } from '../../assets';
import { Button, EmptyView, Header, ProgressView, Text } from '../../components';
import { SCREENS } from '..';
import { API } from '../../api';
import moment from 'moment';

export default function ManageSubscription(props: any) {

    const STRING = useString();
    const { theme } = useContext<any>(ThemeContext);
    const { myPlan, profile } = useContext<any>(AuthContext);

    const [subscriptionPlanDetails, setSubscriptionPlanDetails] = useState<any>({});
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.has_purchased) {
            getSubscriptionPlanDetails();
        }
    }, []);

    async function getSubscriptionPlanDetails() {
        try {
            setLoading(true);
            const result = await API.Instance.get(API.API_ROUTES.getSubscriptionPlanDetails + `?provider_type=${profile?.user?.service_provider_type}`);
            if (result.status) {
                console.log('subscriptionPlanDetails==>', result?.data?.data)
                setSubscriptionPlanDetails(result?.data?.data);
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error')
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
        }
        finally {
            setLoading(false);
        }
    }

    const renderSubscriptionPlanDetails = () => {
        if (profile?.has_purchased) {
            if (isLoading) {
                return (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                )
            } else {
                return (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles(theme).mainContainer}>
                            <Text
                                size={getScaleSize(19)}
                                font={FONTS.Lato.Bold}
                                color={theme._214C65}>
                                {STRING.active_Plan}
                            </Text>
                            <View style={styles(theme).planContainer}>
                                <Text size={getScaleSize(19)}
                                    font={FONTS.Lato.Bold}
                                    color={theme._214C65}
                                    style={{ marginBottom: getScaleSize(12) }}>
                                    {subscriptionPlanDetails?.plan?.name ?? ''}
                                </Text>
                                <Text size={getScaleSize(27)}
                                    font={FONTS.Lato.ExtraBold}
                                    color={theme._214C65}>
                                    {`€${subscriptionPlanDetails?.plan?.price ?? '0.00'} `}
                                    <Text size={getScaleSize(16)}
                                        font={FONTS.Lato.Medium}
                                        color={theme._214C65}>
                                        {STRING.monthly}
                                    </Text>
                                </Text>
                            </View>
                            <Text
                                size={getScaleSize(14)}
                                font={FONTS.Lato.Medium}
                                color={theme._555555}>
                                {'Enjoy exclusive benefits with your Premium Membership. From enhanced features to priority support, this plan unlocks the full experience tailored just for you.'}
                            </Text>
                            <View style={styles(theme).planDetailsContainer} >
                                <Image source={IMAGES.ic_calander} style={styles(theme).calanderIcon} />
                                <Text size={getScaleSize(16)}
                                    font={FONTS.Lato.SemiBold}
                                    align="center"
                                    style={{ marginTop: getScaleSize(16), marginBottom: getScaleSize(8) }}
                                    color={theme.primary}>
                                    {`Your plan will end on ${subscriptionPlanDetails?.subscription_expires_at ? moment.utc(subscriptionPlanDetails?.subscription_expires_at).local().format('MMMM DD, YYYY') : ''}\nat ${subscriptionPlanDetails?.subscription_expires_at ? moment.utc(subscriptionPlanDetails?.subscription_expires_at).local().format('hh:mm A') : ''}`}
                                </Text>
                                <Text size={getScaleSize(14)}
                                    font={FONTS.Lato.Medium}
                                    align="center"
                                    color={theme._424242}>
                                    {`After that, you will be automatically billed €${subscriptionPlanDetails?.plan?.price ?? '0.00'}`}
                                </Text>
                            </View>
                            <View style={styles(theme).flexView}>
                                <Text size={getScaleSize(14)}
                                    font={FONTS.Lato.Medium}
                                    color={theme._555555}>
                                    {STRING.next_payment}
                                </Text>
                                <Text size={getScaleSize(14)}
                                    font={FONTS.Lato.SemiBold}
                                    color={theme._0F232F}>
                                    {subscriptionPlanDetails?.subscription_expires_at ? moment.utc(subscriptionPlanDetails?.subscription_expires_at).local().format('MMMM DD, YYYY') : ''}
                                </Text>
                            </View>
                            {/* <View style={styles(theme).flexView}>
                        <Text size={getScaleSize(14)}
                            font={FONTS.Lato.Medium}
                            color={theme._555555}>
                            {STRING.payment_method}
                        </Text>
                        <Image source={IMAGES.ic_card} style={styles(theme).cardIcon} />
                    </View> */}
                            <View style={styles(theme).flexView}>
                                <Text size={getScaleSize(14)}
                                    font={FONTS.Lato.Medium}
                                    color={theme._555555}>
                                    {STRING.Total}
                                </Text>
                                <Text size={getScaleSize(14)}
                                    font={FONTS.Lato.SemiBold}
                                    color={theme._0F232F}>
                                    {`€${subscriptionPlanDetails?.plan?.price ?? '0.00'}`}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                )
            }
        }
        else {
            return (
                <EmptyView
                    title={STRING.you_have_not_subscribed_to_any_plan}
                    style={styles(theme).emptyView}
                    onPressButton={() => {
                        props.navigation.navigate(SCREENS.ChooseYourSubscription.identifier, {
                            isFromSubscriptionButton: true,
                        });
                    }}
                />
            )
        }
    }

    return (
        <View style={[styles(theme).container]}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
                screenName={STRING.manage_subscription}
            />
            {renderSubscriptionPlanDetails()}
            {profile?.has_purchased && !isLoading && (
                <View style={styles(theme).buttonContainer}>
                    <TouchableOpacity
                        onPress={() => {
                            props.navigation.goBack();
                        }
                        } style={styles(theme).backButton}>
                        <Text
                            size={getScaleSize(19)}
                            font={FONTS.Lato.Bold}
                            color={theme._214C65}
                            align="center">
                            {STRING.cancel}
                        </Text>
                    </TouchableOpacity>
                    <View style={{ width: getScaleSize(16) }} />
                    <Button
                        title={STRING.manage_plan}
                        style={{ flex: 1.0 }}
                        onPress={() => {
                            props.navigation.navigate(SCREENS.ChooseYourSubscription.identifier, {
                                isFromSubscriptionButton: true,
                            });
                        }}
                    />
                </View>
            )}

        </View>
    )
}

const styles = (theme: ThemeContextType['theme']) => StyleSheet.create({
    container: {
        flex: 1.0,
        backgroundColor: theme.white,
    },
    mainContainer: {
        marginTop: getScaleSize(24),
        marginHorizontal: getScaleSize(24),
    },
    planContainer: {
        backgroundColor: theme._FEF8EA,
        borderRadius: getScaleSize(12),
        paddingVertical: getScaleSize(20),
        paddingHorizontal: getScaleSize(24),
        marginTop: getScaleSize(12),
        marginBottom: getScaleSize(18),
        borderWidth: 0.25,
        borderColor: theme._BECFDA,
    },
    planDetailsContainer: {
        backgroundColor: theme._EAF0F3,
        borderRadius: getScaleSize(12),
        paddingVertical: getScaleSize(24),
        paddingHorizontal: getScaleSize(36),
        marginTop: getScaleSize(28),
        marginBottom: getScaleSize(28),
        alignItems: 'center',
    },
    calanderIcon: {
        width: getScaleSize(56),
        height: getScaleSize(56),
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
    flexView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: getScaleSize(16),
    },
    cardIcon: {
        width: getScaleSize(36),
        height: getScaleSize(22),
    },
    emptyView: {
        marginHorizontal: getScaleSize(24),
        marginVertical: getScaleSize(24),
        flex: 1,
    }
})