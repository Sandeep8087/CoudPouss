import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, useString, SHOW_TOAST } from '../../constant';

//SCREENS
import { SCREENS } from '..';

//COMPONENTS
import { Header, Input, Text, Button, ProgressView } from '../../components';


export default function SubscriptionSuccessful(props: any) {

    const STRING = useString();

    const { theme } = useContext<any>(ThemeContext);
    const { profile, fetchProfile } = useContext<any>(AuthContext);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            fetchProfile().then(() => {
                setLoading(false);
            });
        }, 2000);
    }, []);

    return (
        <View style={styles(theme).container}>
            <Header
                screenName={STRING.payment_method}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles(theme).mainContainer}>
                    <Image source={IMAGES.ic_success} style={styles(theme).successIcon} />
                    <Text size={getScaleSize(19)}
                        font={FONTS.Lato.Medium}
                        color={theme._424242}
                        align="center"
                        style={{ marginBottom: getScaleSize(16) }}>
                        {STRING.welcome_aboard_your_subscription_is_now_active_you_can_start_exploring_all_features_immediately}
                    </Text>
                    {/* <View style={styles(theme).infoContainer}>
                        <View style={[styles(theme).flexView, { marginBottom: getScaleSize(16) }]}>
                            <Text size={getScaleSize(16)}
                                font={FONTS.Lato.Bold}
                                color={theme._2C6587}>
                                {STRING.subcription_details}
                            </Text>
                        </View>
                        <View style={[styles(theme).flexView, { marginBottom: getScaleSize(16) }]}>
                            <Text size={getScaleSize(14)}
                                font={FONTS.Lato.SemiBold}
                                color={theme._595959}>
                                {STRING.plan}
                            </Text>
                            <Text size={getScaleSize(16)}
                                font={FONTS.Lato.Bold}
                                color={theme._424242}>
                                {planDetails?.name ?? ''}
                            </Text>
                        </View>
                        <View style={[styles(theme).flexView, { marginBottom: getScaleSize(16) }]}>
                            <Text size={getScaleSize(14)}
                                font={FONTS.Lato.SemiBold}
                                color={theme._595959}>
                                {STRING.mode_of_payment}
                            </Text>
                            <Text size={getScaleSize(16)}
                                font={FONTS.Lato.Bold}
                                color={theme._424242}>
                                {"Google Pay"}
                            </Text>
                        </View>
                        <View style={[styles(theme).flexView, { marginBottom: getScaleSize(16) }]}>
                            <Text size={getScaleSize(14)}
                                font={FONTS.Lato.SemiBold}
                                color={theme._595959}>
                                {STRING.transaction_id}
                            </Text>
                            <Text size={getScaleSize(16)}
                                font={FONTS.Lato.Bold}
                                color={theme._424242}>
                                {"TXN-20250926-784531"}
                            </Text>
                        </View>
                        <View style={[styles(theme).flexView, { marginBottom: getScaleSize(16) }]}>
                            <Text size={getScaleSize(14)}
                                font={FONTS.Lato.SemiBold}
                                color={theme._595959}>
                                {STRING.start_date}
                            </Text>
                            <Text size={getScaleSize(16)}
                                font={FONTS.Lato.Bold}
                                color={theme._424242}>
                                {"26 July 2025"}
                            </Text>
                        </View>
                        <View style={[styles(theme).flexView, { marginBottom: getScaleSize(16) }]}>
                            <Text size={getScaleSize(14)}
                                font={FONTS.Lato.SemiBold}
                                color={theme._595959}>
                                {STRING.billing_cycle}
                            </Text>
                            <Text size={getScaleSize(16)}
                                font={FONTS.Lato.Bold}
                                color={theme._424242}>
                                {"Monthly"}
                            </Text>
                        </View>
                        <View style={[styles(theme).flexView]}>
                            <Text size={getScaleSize(14)}
                                font={FONTS.Lato.SemiBold}
                                color={theme._595959}>
                                {STRING.first_charge_date}
                            </Text>
                            <Text size={getScaleSize(16)}
                                font={FONTS.Lato.Bold}
                                color={theme._424242}>
                                {"26 Sept 2025"}
                            </Text>
                        </View>
                    </View> */}

                    {/* <View style={{flexDirection: 'row'}}>
                        <Image source={IMAGES.ic_info} style={styles(theme).infoIcon} />
                        <Text size={getScaleSize(16)}
                            font={FONTS.Lato.Bold}
                            color={theme._424242}>
                            {STRING.info}
                        </Text>
                    </View>
                    <Text size={getScaleSize(14)}
                        font={FONTS.Lato.Medium}
                        color={theme._555555}
                        style={{ marginTop: getScaleSize(8) }}>
                        {STRING.no_paymentwas_taken_today_your_first_month_is_free}
                    </Text> */}
                </View>
            </ScrollView>
            <Button
                title={STRING.complete_profile_now}
                style={{ marginBottom: getScaleSize(24), marginHorizontal: getScaleSize(24) }}
                onPress={() => {
                    if (profile?.user?.service_provider_type === 'professional') {
                        props.navigation.navigate(SCREENS.AdditionalDetails.identifier);
                    } else {
                        props.navigation.navigate(SCREENS.YearsOfExperience.identifier);
                    }
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
            justifyContent: 'center',
            alignItems: 'center'
        },
        successIcon: {
            width: getScaleSize(120),
            height: getScaleSize(120),
            alignSelf: 'center',
            marginBottom: getScaleSize(20)
        },
        infoContainer: {
            borderWidth: 1,
            borderColor: theme._E6E6E6,
            borderRadius: getScaleSize(12),
            paddingVertical: getScaleSize(13),
            paddingHorizontal: getScaleSize(16),
            marginBottom: getScaleSize(20)
        },
        flexView: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        infoIcon: {
            width: getScaleSize(24),
            height: getScaleSize(24),
            marginRight: getScaleSize(12)
        }
    });
