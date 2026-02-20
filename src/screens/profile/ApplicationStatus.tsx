import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//CONSTANT & ASSETS
import { getScaleSize, SHOW_TOAST, useString } from '../../constant';
import { FONTS, IMAGES } from '../../assets';

//COMPONENTS
import { BottomSheet, Button, DocumentStatusItem, EmptyView, Header, StatusItem, Text, UploadDocumentsSheet } from '../../components';
import { SCREENS } from '..';
import { API } from '../../api';
import { useIsFocused } from '@react-navigation/native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';


export default function ApplicationStatus(props: any) {
    const { theme } = useContext<any>(ThemeContext);
    const STRING = useString();

    const bottomSheetRef = useRef<any>(null);
    const successBottomSheetRef = useRef<any>(null);

    const [isLoading, setLoading] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState<any>(null);
    const [statsData, setStatsData] = useState<any>(null);
    const [certificate, setCertificate] = useState<any>([]);
    const [kbisExtract, setKbisExtract] = useState<any>([]);

    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            getApplicationStatus();
        }
    }, [isFocused]);

    async function getApplicationStatus() {
        try {
            setLoading(true);
            const result = await API.Instance.get(API.API_ROUTES.getApplicationStatus);
            if (result.status) {
                console.log('applicationStatus==>', result?.data?.data);
                setApplicationStatus(result?.data?.data ?? {});
            } else {
                SHOW_TOAST(result?.data?.message, 'error');
            }
        } catch (error: any) {
            SHOW_TOAST(error?.message ?? '', 'error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getStatsData();
    }, [applicationStatus]);

    function getStatsData() {

        const status = []

        if (applicationStatus?.subscription) {
            status.push({
                id: 1,
                name: "Subscribed",
                description: "You are successfully subscribed.",
                completed: true,
            });
        }

        if (applicationStatus?.subscription && !applicationStatus?.doc_status || applicationStatus?.doc_status == 'null') {
            status.push({
                id: 2,
                name: "Upload Documents",
                description: "Upload your documents to get verified.",
                completed: false,
            });
        }

        if (applicationStatus?.subscription && applicationStatus?.doc_status == 'uploaded') {
            status.push({
                id: 2,
                name: "Documents Uploaded",
                description: "Your documents have been received and are being processed.",
                completed: true,
            });

            status.push({
                id: 3,
                name: "Under Review",
                description: "Your profile is in review and will be assessed by a system administrator within 72 hours. After approval, you can begin sending quotes for service requests.",
                serviceRunning: true,
            });
        }

        if (applicationStatus?.subscription && applicationStatus?.doc_status == 'accepted') {
            status.push({
                id: 2,
                name: "Documents Uploaded",
                description: "All documents verified.",
                completed: true,
            });

            status.push({
                id: 4,
                name: "Accepted",
                description: "Your profile is active.",
                completed: true,
            });
        }

        if (applicationStatus?.subscription && applicationStatus?.doc_status == 'rejected') {
            status.push({
                id: 2,
                name: "Documents Uploaded",
                description: "Documents verified.",
                completed: true,
            });
            status.push({
                id: 5,
                name: "Rejected",
                description: "Some documents are currently missing. Please upload the required documents within the next 15 days to avoid account deletion and a €30 fee charged to your registered card.",
                isRejected: true,
            });
        }
        setStatsData(status);
    }

    const pickDocument = async (type: string) => {
        try {
            const result = await pick({
                type: [types.allFiles],
            });

            if (type === 'id') {
                setCertificate(result);
            } else if (type === 'kbis') {
                setKbisExtract(result);
            }
        } catch (err) {
            if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
                console.log('User cancelled');
            } else {
                console.log('Error:', err);
            }
        }
    };

    async function uploadDocuments() {
        if (kbisExtract?.length === 0 || certificate?.length === 0) {
            SHOW_TOAST('Please upload all the required documents', 'error')
            return;
        }
        try {
            const formData = new FormData();
            formData.append('id_document', {
                uri: certificate?.[0]?.uri,
                name: certificate?.[0]?.name,
                type: certificate?.[0]?.type,
            });
            formData.append('certificate', {
                uri: kbisExtract?.[0]?.uri,
                name: kbisExtract?.[0]?.name,
                type: kbisExtract?.[0]?.type,
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
                bottomSheetRef.current?.close();
                setTimeout(() => {
                    successBottomSheetRef.current?.open();
                }, 1000);
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
                screenName={STRING.application_status}
            />
            {applicationStatus?.subscription ? (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={styles(theme).scrolledContainer}>
                    <Text
                        size={getScaleSize(18)}
                        font={FONTS.Lato.Medium}
                        color={theme._737373}>
                        {STRING.unfortunately_your_application_could_not_be_approved_due_to_missing_or_invalid_documents}
                    </Text>

                    <View style={styles(theme).statusContainer}>
                        {statsData && statsData.map((item: any, index: number) => (
                            <DocumentStatusItem
                                key={item.id}
                                item={item}
                                index={index}
                                isLast={index === statsData.length - 1}
                            />
                        ))}
                        {(!applicationStatus?.doc_status || applicationStatus?.doc_status == 'null') && (
                            <TouchableOpacity
                                onPress={() => {
                                    props.navigation.navigate(SCREENS.AdditionalDetails.identifier, {
                                        isFromApplicationStatus: true,
                                    });
                                }}
                                style={styles(theme).uploadDocumentsButton}>
                                <Text
                                    size={getScaleSize(16)}
                                    font={FONTS.Lato.SemiBold}
                                    align="center"
                                    color={theme.white}>
                                    {STRING.upload_documents}
                                </Text>
                            </TouchableOpacity>
                        )}
                        {applicationStatus?.doc_status == 'rejected' && (
                            <TouchableOpacity
                                onPress={() => {
                                    bottomSheetRef.current?.open();
                                }}
                                style={styles(theme).uploadDocumentsButton}>
                                <Text
                                    size={getScaleSize(16)}
                                    font={FONTS.Lato.SemiBold}
                                    align="center"
                                    color={theme.white}>
                                    {STRING.upload_documents}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            ) : (
                <EmptyView
                    title={STRING.you_have_not_subscribed_to_any_plan}
                    style={styles(theme).emptyView}
                    onPressButton={() => {
                        props.navigation.navigate(SCREENS.ChooseYourSubscription.identifier, {
                            isFromSubscriptionButton: true,
                        });
                    }}
                />
            )}

            <UploadDocumentsSheet
                bottomSheetRef={bottomSheetRef}
                height={470}
                buttonTitle={STRING.upload}
                onPressDocument={(type: string) => { pickDocument(type) }}
                certificate={certificate}
                kbisExtract={kbisExtract}
                onPressButton={() => {
                    uploadDocuments()
                }}
            />
            <BottomSheet
                bottomSheetRef={successBottomSheetRef}
                height={300}
                isStatus={true}
                title={STRING.documents_uploaded_successfully_your_documents_will_be_reviewed_within_72_hours}
                buttonTitle={STRING.proceed}
                onPressButton={() => {
                    successBottomSheetRef.current?.close();
                    props.navigation.goBack();
                }}
            />
        </View>
    )
}

const styles = (theme: ThemeContextType['theme']) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.white },
        scrolledContainer: {
            marginHorizontal: getScaleSize(24),
            marginVertical: getScaleSize(24),
        },
        statusContainer: {
            marginTop: getScaleSize(24),
            borderWidth: 1,
            borderColor: theme._E6E6E6,
            borderRadius: getScaleSize(12),
            padding: getScaleSize(24),
        },
        uploadDocumentsButton: {
            backgroundColor: theme._214C65,
            borderRadius: getScaleSize(8),
            padding: getScaleSize(12),
            alignSelf: 'flex-end',
        },
        emptyView: {
            marginHorizontal: getScaleSize(24),
            marginVertical: getScaleSize(24),
            flex: 1,
        },
    })

