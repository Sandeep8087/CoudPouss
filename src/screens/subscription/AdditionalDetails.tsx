import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { FONTS, IMAGES } from '../../assets';
import { getScaleSize, useString, SHOW_TOAST } from '../../constant';

//SCREENS
import { SCREENS } from '..';

//COMPONENTS
import { Header, Input, Text, Button } from '../../components';

//PACKAGES
import { CommonActions } from '@react-navigation/native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { API } from '../../api';


export default function AdditionalDetails(props: any) {

    const STRING = useString();
    const { theme } = useContext<any>(ThemeContext);

    const planDetails: any = props?.route?.params?.planDetails ?? {};
    const isFromApplicationStatus: any = props?.route?.params?.isFromApplicationStatus ?? false;
    const [copyOfId, setCopyOfId] = useState<any>([]);
    const [kbisExtract, setKbisExtract] = useState<any>([]);
    const [proofOfResidence, setProofOfResidence] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const pickDocument = async (type: string) => {
        try {
            const result = await pick({
                type: [types.allFiles],
            });

            if (type === 'id') {
                setCopyOfId(result);
            } else if (type === 'kbis') {
                setKbisExtract(result);
            } else if (type === 'address_proof') {
                setProofOfResidence(result);
            }
        } catch (err) {
            if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                console.log('User cancelled');
            } else {
                console.log('Error:', err);
            }
        }
    };

    console.log('copyOfId', copyOfId)
    console.log('kbisExtract', kbisExtract)
    console.log('proofOfResidence', proofOfResidence)

    async function uploadDocuments() {
        if (copyOfId?.length === 0 || kbisExtract?.length === 0 || proofOfResidence?.length === 0) {
            SHOW_TOAST('Please upload all the required documents', 'error')
            return;
        }
        try {
            const formData = new FormData();
            formData.append('id_document', {
                uri: copyOfId?.[0]?.uri,
                name: copyOfId?.[0]?.name,
                type: copyOfId?.[0]?.type,
            });
            formData.append('kbis_extract', {
                uri: kbisExtract?.[0]?.uri,
                name: kbisExtract?.[0]?.name,
                type: kbisExtract?.[0]?.type,
            });
            formData.append('proof_of_residence', {
                uri: proofOfResidence?.[0]?.uri,
                name: proofOfResidence?.[0]?.name,
                type: proofOfResidence?.[0]?.type,
            });
            console.log('formData==>', formData)
            setLoading(true);
            const result = await API.Instance.post(API.API_ROUTES.uploadDocuments, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setLoading(false);
            console.log('result', result.status, result)
            if (result.status) {
                if (isFromApplicationStatus) {
                    props.navigation.navigate(SCREENS.ApplicationStatus.identifier);
                } else {
                    props.navigation.navigate(SCREENS.YearsOfExperience.identifier, {
                        planDetails: planDetails,
                    });
                }
            } else {
                SHOW_TOAST(result?.data?.message ?? '', 'error')
            }
            console.log('error==>', result?.data?.message)
        }
        catch (error: any) {
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
                    props.navigation.goBack();
                }}
                screenName={STRING.additional_details}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles(theme).mainContainer}>
                    <Text size={getScaleSize(16)}
                        font={FONTS.Lato.SemiBold}
                        color={theme._939393}
                        style={{ marginBottom: getScaleSize(32) }}>
                        {STRING.upload_the_required_documents_to_complete_your_profile_and_gain_the_Certified_badge}
                    </Text>
                    <Text size={getScaleSize(17)}
                        font={FONTS.Lato.Medium}
                        color={theme._424242}
                        style={{ marginBottom: getScaleSize(8) }}>
                        {STRING.a_copy_of_ID}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            pickDocument('id')
                        }}
                        style={[styles(theme).itemContainer, { paddingVertical: copyOfId?.[0]?.uri ? getScaleSize(24) : getScaleSize(47), }]}>
                        {copyOfId?.length > 0 ? (
                            <Image source={{ uri: copyOfId?.[0]?.uri }} style={styles(theme).imageIcon} />
                        ) : (
                            <>
                                <Image source={IMAGES.ic_file_uplord} style={styles(theme).fileIcon} />
                                <Text size={getScaleSize(12)}
                                    font={FONTS.Lato.Regular}
                                    color={theme._818285}>
                                    {STRING.upload_from_device}
                                </Text>
                            </>
                        )}

                    </TouchableOpacity>
                    <Text size={getScaleSize(17)}
                        font={FONTS.Lato.Medium}
                        color={theme._424242}
                        style={{ marginBottom: getScaleSize(8) }}>
                        {STRING.kbis_extract}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            pickDocument('kbis')
                        }}
                        style={[styles(theme).itemContainer, { paddingVertical: kbisExtract?.[0]?.uri ? getScaleSize(24) : getScaleSize(47), }]}>
                        {kbisExtract?.length > 0 ? (
                            <Image source={{ uri: kbisExtract?.[0]?.uri }} style={styles(theme).imageIcon} />
                        ) : (
                            <>
                                <Image source={IMAGES.ic_file_uplord} style={styles(theme).fileIcon} />
                                <Text size={getScaleSize(12)}
                                    font={FONTS.Lato.Regular}
                                    color={theme._818285}>
                                    {STRING.upload_from_device}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <Text size={getScaleSize(17)}
                        font={FONTS.Lato.Medium}
                        color={theme._424242}
                        style={{ marginBottom: getScaleSize(4) }}>
                        {STRING.proof_of_residence}
                    </Text>
                    <Text size={getScaleSize(12)}
                        font={FONTS.Lato.Regular}
                        color={theme._D32F2F}
                        style={{ marginBottom: getScaleSize(8) }}>
                        {STRING.less_than_3_months_old_e_g_water_or_electricity_bill}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            pickDocument('address_proof')
                        }}
                        style={[styles(theme).itemContainer, { paddingVertical: proofOfResidence?.[0]?.uri ? getScaleSize(24) : getScaleSize(47), }]}>
                        {proofOfResidence?.length > 0 ? (
                            <Image source={{ uri: proofOfResidence?.[0]?.uri }} style={styles(theme).imageIcon} />
                        ) : (
                            <>
                                <Image source={IMAGES.ic_file_uplord} style={styles(theme).fileIcon} />
                                <Text size={getScaleSize(12)}
                                    font={FONTS.Lato.Regular}
                                    color={theme._818285}>
                                    {STRING.upload_from_device}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <View style={styles(theme).buttonContainer}>
                <TouchableOpacity
                    onPress={() => {
                        props.navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: SCREENS.YearsOfExperience.identifier }],
                            }),
                        );
                    }} style={styles(theme).backButton}>
                    <Text
                        size={getScaleSize(19)}
                        font={FONTS.Lato.Bold}
                        color={theme._214C65}
                        align="center">
                        {STRING.skip}
                    </Text>
                </TouchableOpacity>
                <View style={{ width: getScaleSize(16) }} />
                <Button
                    title={STRING.next}
                    style={{ flex: 1.0 }}
                    onPress={() => {
                        uploadDocuments();
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
        itemContainer: {
            paddingHorizontal: getScaleSize(20),
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: getScaleSize(24),
            borderWidth: 1,
            borderColor: theme._818285,
            borderStyle: 'dashed',
            borderRadius: getScaleSize(8),
        },
        fileIcon: {
            width: getScaleSize(24),
            height: getScaleSize(24),
            marginBottom: getScaleSize(8)
        },
        imageIcon: {
            width: getScaleSize(100),
            height: getScaleSize(100),
        }
    });
