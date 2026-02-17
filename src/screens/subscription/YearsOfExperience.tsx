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
import { Header, Input, Text, Button } from '../../components';
import { API } from '../../api';


export default function YearsOfExperience(props: any) {

    const STRING = useString();
    const { setSelectedServices } = useContext<any>(AuthContext);
    const { theme } = useContext<any>(ThemeContext);

    const [yearsOfExperience, setYearsOfExperience] = useState('');
    const [isLoading, setLoading] = useState(false);

    async function addYearsOfExperience() {

        const trimmedValue = yearsOfExperience.trim();

        if (!trimmedValue) {
            SHOW_TOAST('Please enter your years of experience', 'error');
            return;
        }

        try {
            const params = {
                years_of_experience: yearsOfExperience,
            }
            setLoading(true);
            const result = await API.Instance.patch(API.API_ROUTES.addYearsOfExperience, params);
            setLoading(false);
            if (result.status) {
                setSelectedServices([]);
                props.navigation.navigate(SCREENS.AddServices.identifier);
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

    const validateExperienceInput = (text: string) => {
        if (!text) return '';

        // Allow digits + dot only
        let value = text.replace(/[^0-9.]/g, '');

        // Prevent dot as first character
        if (value.startsWith('.')) {
            value = value.slice(1);
        }

        // Prevent multiple dots
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts[1];
        }

        let [integerPart = '', decimalPart] = value.split('.');

        // Remove leading zeros (but keep single 0)
        integerPart = integerPart.replace(/^0+(?=\d)/, '');

        // Limit decimal to 2 digits
        if (decimalPart !== undefined) {
            decimalPart = decimalPart.slice(0, 2);
            value = `${integerPart}.${decimalPart}`;
        } else {
            value = integerPart;
        }

        // Allow trailing dot while typing (e.g., "1.")
        if (text.endsWith('.') && !value.includes('.')) {
            value = integerPart + '.';
        }

        // Max value 99
        if (parseFloat(value) > 99) {
            value = '99';
        }

        return value;
    };

    return (
        <View style={styles(theme).container}>
            <Header
                onBack={() => {
                    props.navigation.goBack();
                }}
                screenName={STRING.additional_details}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles(theme).mainContainer}>
                    <Text size={getScaleSize(24)}
                        font={FONTS.Lato.Bold}
                        color={theme._2C6587}
                        style={{ marginBottom: getScaleSize(12) }}>
                        {STRING.years_of_experience}
                    </Text>
                    <Text size={getScaleSize(16)}
                        font={FONTS.Lato.SemiBold}
                        color={theme._939393}
                        style={{ marginBottom: getScaleSize(24) }}>
                        {STRING.tell_us_more_about_your_professional_background_Enter_your_years_of_experience_to_showcase_your_expertise}
                    </Text>
                    <Input
                        placeholder={STRING.experience}
                        inputTitle={STRING.years_of_experience}
                        inputColor={true}
                        keyboardType="decimal-pad"
                        value={yearsOfExperience}
                        onChangeText={(text) => {
                            const cleanedValue = validateExperienceInput(text);
                            setYearsOfExperience(cleanedValue);
                        }}
                    />
                </View>
            </ScrollView>
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
                        addYearsOfExperience()
                    }}
                />
            </View>
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
    });
