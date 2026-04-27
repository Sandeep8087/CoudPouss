import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  TextInput,
} from 'react-native';

//API
import { API } from '../../api';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { AuthContext, ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { arrayIcons, formatDecimalInput, getScaleSize, SHOW_SUCCESS_TOAST, SHOW_TOAST, useString, waitForFileReady } from '../../constant';

//COMPONENT
import {
  Button,
  Header,
  Input,
  ProgressView,
  Text,
} from '../../components';

//PACKAGES
import { launchImageLibrary } from 'react-native-image-picker';
import moment from 'moment';
import { createThumbnail } from 'react-native-create-thumbnail';
import { useTranslation } from 'react-i18next';

//SCREENS
import { SCREENS } from '..';

export default function AddQuote(props: any) {

  const serviceDetails = props?.route?.params?.item
  const isItem = props?.route?.params?.isItem

  const STRING = useString();
  const { t } = useTranslation();

  const { theme } = useContext<any>(ThemeContext);

  const { profile } = useContext(AuthContext)

  const [amount, setAmount] = useState('');
  const [desctiption, setDescription] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [doc1, setDoc1] = useState<any>(null);
  const [doc2, setDoc2] = useState<any>(null);
  const [video, setVideo] = useState<any>(null);
  const [doc1Id, setDoc1Id] = useState<string | null>(null);
  const [doc2Id, setDoc2Id] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [isServiceDetails, setServiceDetails] = useState<any>(serviceDetails ?? '')
  const [amountError, setAmountError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [docError, setDocError] = useState('');
  const [videoError, setVideoError] = useState('');

  const isMediaPickerOpenRef = useRef(false);

  useEffect(() => {
    if (!isServiceDetails && isItem) {
      getServicesDetails()

    }
  }, [])

  async function getServicesDetails() {
    try {
      setLoading(true)
      const result = await API.Instance.get(API.API_ROUTES.getProfessionalServiceDetails + `/${isItem?.service_id}`);
      setLoading(false)

      if (result?.status) {
        setServiceDetails(result?.data?.data)
      }
      else {
        SHOW_TOAST(result?.data?.message, 'error')
      }
    }
    catch (error: any) {
      setLoading(false);
      SHOW_TOAST(error?.message ?? '', 'error');
    }
  }

  async function uploadFile(asset: any) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios'
          ? asset.uri.replace('file://', '')
          : asset.uri,
        name: asset.fileName || `file_${Date.now()}`,
        type: asset.type || 'image/jpeg',
      } as any);
      setLoading(true);
      await waitForFileReady();
      const result: any = await API.Instance.post(API.API_ROUTES.fileUploadProfessionalServices, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success')
        return result?.data?.id;
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error')
        return null;
      }
    }
    catch (error: any) {
      SHOW_TOAST(error?.message ?? '', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }

  // return res.data.storage_key;

  const pickDocument = async (index: number) => {
    if (isMediaPickerOpenRef.current) return;
    isMediaPickerOpenRef.current = true;
    setDocError('');
    setLoading(true);
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      async response => {
        isMediaPickerOpenRef.current = false;
        if (response.didCancel){
          setLoading(false);
          return
        } ;

        if (response.errorCode) {
          SHOW_TOAST(response.errorMessage || 'Error', 'error')
          setLoading(false);
          return
        }

        const asset = response.assets?.[0];
        if (!asset){
          setLoading(false);
          return
        };

        try {
          setLoading(true);

          const id = await uploadFile(asset);
          console.log('id==>', id, asset)
          if (id) {
            if (index === 1) {
              setDoc1(asset);
              setDoc1Id(id);
            }
            if (index === 2) {
              setDoc2(asset);
              setDoc2Id(id);
            }

            SHOW_TOAST(STRING.document_uploaded_successfully, 'success');
          } else {
            SHOW_TOAST(STRING.document_upload_failed, 'error');
          }
        } catch (e: any) {
          SHOW_TOAST(STRING.document_upload_failed, 'error');
          if (index === 1) {
            setDoc1(null);
            setDoc1Id(null);
          }
          if (index === 2) {
            setDoc2(null);
            setDoc2Id(null);
          }
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const pickVideo = () => {
    if (isMediaPickerOpenRef.current) return;
    isMediaPickerOpenRef.current = true;
    setVideoError('');
    launchImageLibrary(
      {
        mediaType: 'video',
        videoQuality: 'high',
      },
      async response => {
        isMediaPickerOpenRef.current = false;
        if (response.didCancel) return;
        if (response.errorCode) {
          SHOW_TOAST(response.errorMessage || 'Error', 'error');
          return;
        }

        const asset = response.assets?.[0];
        console.log('asset==>', asset, response)
        if (!asset) return;

        if (!asset.uri) {
          SHOW_TOAST(STRING.invalid_video_file, 'error');
          return;
        }

        if (asset.duration && asset.duration > 120) {
          SHOW_TOAST(STRING.video_must_be_less_than_2_minutes, 'error');
          return;
        }

        try {
          setLoading(true);

          //  Upload video
          const id = await uploadFile(asset);
          if (id) {
            setVideoId(id);
            setVideo(asset);
            SHOW_TOAST(STRING.video_uploaded_successfully, 'success');
          } else {
            SHOW_TOAST(STRING.video_upload_failed, 'error');
            return
          }

          //  Create thumbnail
          const thumbnail = await createThumbnail({
            url: asset.uri,
            timeStamp: 1000,
          });

          setVideoThumbnail(thumbnail.path);

          SHOW_SUCCESS_TOAST(STRING.video_uploaded_successfully);
        } catch (e: any) {
          SHOW_TOAST(e.message || STRING.upload_failed, 'error');
        } finally {
          setLoading(false);
        }
      }
    );
  };


  async function sendQuote() {

    const photoIds = [doc1Id, doc2Id].filter(Boolean)

    // amount validation only for professional
    if (!amount) {
      setAmountError(STRING.please_enter_amount);
    } else if (!desctiption) {
      setDescriptionError(STRING.please_enter_short_description);
    } else if (photoIds.length === 0) {
      setDocError(STRING.please_upload_at_least_one_document);
    } else {
      try {
        setLoading(true);

        let payload: any = {
          servicesid: isServiceDetails?.service_id,
          description: desctiption,
          provider_quote_amount: amount,
          offer_photoids: photoIds,
          offer_videoids: videoId ? [videoId] : [],
        };

        // // PROFESSIONAL PAYLOAD
        // if (profile?.user?.service_provider_type === 'professional') {
        //   payload = {
        //     ...payload,
        //     provider_quote_amount: amount,
        //     offer_photoids: photoIds,
        //     offer_videoids: videoId ? [videoId] : [],
        //   };
        // }

        // // NON-PROFESSIONAL PAYLOAD
        // if (profile?.user?.service_provider_type === 'non_professional') {
        //   payload = {
        //     ...payload,
        //     offer_photos: photoIds.map(key => ({
        //       storage_key: key,
        //     })),
        //     offer_videos: videoId
        //       ? [{ storage_key: videoId }]
        //       : [],
        //   };
        // }

        const result: any = await API.Instance.post(
          API.API_ROUTES.sendQuoteRequest,
          payload
        );

        setLoading(false);

        if (result?.status) {
          props.navigation.navigate(SCREENS.Success.identifier, {
            isFromHome: true,
          });
        } else {
          console.log('result==>', result)
         SHOW_TOAST(result?.error?.message , 'error')
        }
      } catch (e: any) {
        setLoading(false);
        console.log('e==>', e)
        SHOW_TOAST(e?.message ||
        e?.data?.detail ||
        e?.data?.message || STRING.something_went_wrong, 'error');
      }
    }
  }

  return (
    <View style={styles(theme).container}>
      <Header
        onBack={() => {
          props.navigation.goBack();
        }}
        screenName={STRING.Addquoteamount}
      />
      <ScrollView
        style={styles(theme).scrolledContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles(theme).imageContainer}>
          {isServiceDetails?.subcategory_info?.sub_category_img_url === null ?
            <View style={[styles(theme).imageView, {
              backgroundColor: 'gray'
            }]}>
            </View>
            :
            <Image
              style={styles(theme).imageView}
              resizeMode='cover'
              source={{ uri: isServiceDetails?.subcategory_info?.sub_category_img_url }}
            />
          }
          <Text
            style={{
              marginVertical: getScaleSize(12),
              marginLeft: getScaleSize(4),
            }}
            size={getScaleSize(24)}
            font={FONTS.Lato.Bold}
            color={theme.primary}>
            {t(isServiceDetails?.subcategory_info?.sub_category_name) ?? ''}
          </Text>
          <View style={styles(theme).informationView}>
            <View style={styles(theme).horizontalView}>
              <View style={styles(theme).itemView}>
                <Image
                  style={styles(theme).informationIcon}
                  source={IMAGES.calender}
                />
                <Text
                  style={{
                    marginHorizontal: getScaleSize(8),
                    alignSelf: 'center',
                  }}
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={theme.primary}>
                  {moment.utc(isServiceDetails?.date).local().format('DD MMM, YYYY')}
                </Text>
              </View>
              <View style={styles(theme).itemView}>
                <Image
                  style={styles(theme).informationIcon}
                  source={IMAGES.clock}
                />
                <Text
                  style={{
                    marginHorizontal: getScaleSize(8),
                    alignSelf: 'center',
                  }}
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={theme.primary}>
                  {moment.utc(isServiceDetails?.time, "HH:mm").local().format("hh:mm A")}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles(theme).horizontalView,
                { marginTop: getScaleSize(12) },
              ]}>
              <View style={styles(theme).itemView}>
                {isServiceDetails?.category_info?.category_logo ?
                  <Image
                    style={[styles(theme).informationIcon, { tintColor: theme._1A3D51 }]}
                    source={{uri: isServiceDetails?.category_info?.category_logo}}
                    resizeMode='cover'
                  />
                  :
                  <View style={styles(theme).informationIcon} />
                }
                <Text
                  style={{
                    marginHorizontal: getScaleSize(8),
                    alignSelf: 'center',
                  }}
                  size={getScaleSize(12)}
                  font={FONTS.Lato.Medium}
                  color={theme.primary}>
                  {`${t(isServiceDetails?.category_info?.category_name ?? '')} Services`}
                </Text>
              </View>
              <View style={styles(theme).itemView}>
                <Image
                  style={styles(theme).informationIcon}
                  source={IMAGES.pin}
                />
                <Text
                  style={{
                    marginHorizontal: getScaleSize(8),
                    alignSelf: 'center',
                  }}
                  size={getScaleSize(12)}
                  numberOfLines={4}
                  font={FONTS.Lato.Medium}
                  color={theme.primary}>
                  {isServiceDetails?.service_address}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles(theme).profileContainer}>
          <View style={styles(theme).horizontalView}>
            <Text
              style={{ flex: 1.0 }}
              size={getScaleSize(18)}
              font={FONTS.Lato.SemiBold}
              color={theme._323232}>
              {STRING.Aboutclient}
            </Text>
          </View>
          <View
            style={[
              styles(theme).horizontalView,
              { marginTop: getScaleSize(16) },
            ]}>
            {isServiceDetails?.about_client?.profile_photo ?
              <Image
                style={styles(theme).profilePicView}
                resizeMode='contain'
                source={{ uri: isServiceDetails?.about_client?.profile_photo }}
              />
              : <Image
                style={styles(theme).profilePicView}
                source={IMAGES.user_placeholder}
              />

            }
            <Text
              style={{ alignSelf: 'center', marginLeft: getScaleSize(16) }}
              size={getScaleSize(20)}
              font={FONTS.Lato.SemiBold}
              color={'#0F232F'}>
              {isServiceDetails?.about_client?.name}
            </Text>
            {/* <Image
              style={{
                height: getScaleSize(25),
                width: getScaleSize(25),
                alignSelf: 'center',
                marginLeft: getScaleSize(6),
              }}
              source={IMAGES.verify}
            /> */}
          </View>
        </View>
        <Input
          placeholder={`${isServiceDetails?.estimated_cost ? `€${isServiceDetails?.estimated_cost}` : '0'}`}
          placeholderTextColor={theme._D5D5D5}
          inputTitle={STRING.EnterQuoteAmount}
          inputColor={true}
          continerStyle={{ marginTop: getScaleSize(16) }}
          value={amount ? `${'€'}${amount}` : ''}
          keyboardType="decimal-pad"
          autoCapitalize="none"
          onChangeText={text => {
            setAmount(formatDecimalInput(text));
            setAmountError('');
          }}
          isError={amountError}
        />
        <Input
          inputTitle={STRING.Addpersonalizedshortmessage}
          placeholder={STRING.Enterdescriptionhere}
          inputColor={true}
          value={desctiption}
          continerStyle={{ marginTop: getScaleSize(16) }}
          inputContainer={styles(theme).inputContainerHeight}
          multiline={true}
          numberOfLines={8}
          onChangeText={text => {
            setDescription(text);
            setDescriptionError('');
          }}
          isError={descriptionError}
        />
        <Text
          style={{ marginTop: getScaleSize(20) }}
          size={getScaleSize(17)}
          font={FONTS.Lato.Medium}
          color={theme._424242}>
          {STRING.Attachsupportingdocuments}
        </Text>
        <View style={styles(theme).imageUploadContent}>
          <TouchableOpacity
            style={[styles(theme).uploadButton, { marginRight: getScaleSize(9), borderColor: docError ? theme._EF5350 : theme._818285 }]}
            activeOpacity={1}
            onPress={() => pickDocument(1)}>
            {doc1 ? (
              <Image source={{ uri: doc1.uri }} style={styles(theme).photosView} />
            ) : (
              <>
                <Image source={IMAGES.upload_attachment} style={styles(theme).attachmentIcon} />
                <Text
                  style={{ marginTop: getScaleSize(8) }}
                  size={getScaleSize(15)}
                  font={FONTS.Lato.Regular}
                  color={theme._818285}>
                  {STRING.upload_from_device}
                </Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles(theme).uploadButton, { marginLeft: getScaleSize(9), borderColor: docError ? theme._EF5350 : theme._818285 }]}
            activeOpacity={1}
            onPress={() => pickDocument(2)}>
            {doc2 ? (
              <Image source={{ uri: doc2.uri }} style={styles(theme).photosView} />
            ) : (
              <>
                <Image source={IMAGES.upload_attachment} style={styles(theme).attachmentIcon} />
                <Text
                  style={{ marginTop: getScaleSize(8) }}
                  size={getScaleSize(15)}
                  font={FONTS.Lato.Regular}
                  color={theme._818285}>
                  {STRING.upload_from_device}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        {docError &&
          <Text
            style={{ marginTop: getScaleSize(8) }}
            size={getScaleSize(14)}
            font={FONTS.Lato.Regular}
            color={theme._EF5350}>{docError}
          </Text>
        }
        <Text
          style={{ marginTop: getScaleSize(20) }}
          size={getScaleSize(17)}
          font={FONTS.Lato.Medium}
          color={theme._424242}>
          {STRING.Uploadashortvideo}
        </Text>
        <TouchableOpacity
          style={[
            styles(theme).uploadButton,
            { marginRight: getScaleSize(0), marginTop: getScaleSize(12), borderColor: videoError ? theme._EF5350 : theme._818285 },
          ]}
          activeOpacity={1}
          onPress={pickVideo}>
          {videoThumbnail ? (
            <Image
              source={{ uri: videoThumbnail }}
              style={styles(theme).photosView}
            />
          ) :
            <>
              <Image source={IMAGES.upload_attachment} style={styles(theme).attachmentIcon} />
              <Text
                style={{ marginTop: getScaleSize(8) }}
                size={getScaleSize(15)}
                font={FONTS.Lato.Regular}
                color={theme._818285}>
                {STRING.upload_from_device}
              </Text>
            </>
          }
        </TouchableOpacity>
        {videoError &&
          <Text
            style={{ marginVertical: getScaleSize(8) }}
            size={getScaleSize(14)}
            font={FONTS.Lato.Regular}
            color={theme._EF5350}>
            {videoError}
          </Text>
        }
      </ScrollView>
      <Button
        title={STRING.SubmitQuote}
        disabled={(amount === '') || desctiption === ''}
        style={{
          marginVertical: getScaleSize(24),
          marginHorizontal: getScaleSize(24),
          opacity: isLoading ? 0.6 : 1,
        }}
        onPress={sendQuote}
      />
      {isLoading && <ProgressView />}
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.white },
    scrolledContainer: {
      marginTop: getScaleSize(19),
      marginHorizontal: getScaleSize(24),
    },
    imageContainer: {
      paddingVertical: getScaleSize(12),
      paddingHorizontal: getScaleSize(12),
      borderRadius: getScaleSize(20),
      backgroundColor: '#EAF0F3',
    },
    imageView: {
      height: getScaleSize(172),
      borderRadius: getScaleSize(20),
      flex: 1.0,
    },
    informationView: {
      paddingVertical: getScaleSize(16),
      backgroundColor: theme.white,
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(16),
    },
    horizontalView: {
      flexDirection: 'row',
    },
    itemView: {
      flexDirection: 'row',
      flex: 1.0,
    },
    informationIcon: {
      height: getScaleSize(25),
      width: getScaleSize(25),
      alignSelf: 'center',
    },
    amountContainer: {
      marginTop: getScaleSize(32),
      paddingVertical: getScaleSize(9),
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(16),
    },
    negociateButton: {
      paddingVertical: getScaleSize(10),
      paddingHorizontal: getScaleSize(20),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: getScaleSize(8),
      backgroundColor: theme.primary,
    },
    profileContainer: {
      borderColor: '#D5D5D5',
      paddingVertical: getScaleSize(13),
      paddingHorizontal: getScaleSize(16),
      borderWidth: 1,
      borderRadius: getScaleSize(16),
      marginTop: getScaleSize(24),
    },
    likeIcon: {
      height: getScaleSize(28),
      width: getScaleSize(28),
      alignSelf: 'center',
    },
    profilePicView: {
      height: getScaleSize(56),
      width: getScaleSize(56),
      borderRadius: getScaleSize(28),
    },
    newButton: {
      flex: 1.0,
      backgroundColor: theme.primary,
      borderRadius: 8,
      height: getScaleSize(38),
      justifyContent: 'center',
      alignItems: 'center',
    },
    serviceDescriptionView: {
      marginTop: getScaleSize(12),
      borderWidth: 1,
      borderColor: theme._D5D5D5,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    imageUploadContent: {
      marginTop: getScaleSize(12),
      flexDirection: 'row',
    },
    uploadButton: {
      flex: 1.0,
      borderWidth: 1,
      borderColor: theme._818285,
      borderStyle: 'dashed',
      borderRadius: getScaleSize(8),
      justifyContent: 'center',
      alignItems: 'center',
      height: getScaleSize(160),
      overflow: 'hidden'
    },
    attachmentIcon: {
      height: getScaleSize(40),
      width: getScaleSize(40),
      alignSelf: 'center',
    },
    photosView: {
      height: getScaleSize(144),
      width: getScaleSize(180),
      borderRadius: 8,
      resizeMode: 'cover',
    },
    buttonContainer: {
      flexDirection: 'row',
      marginHorizontal: getScaleSize(22),
      marginBottom: getScaleSize(17),
    },
    backButtonContainer: {
      flex: 1.0,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: getScaleSize(12),
      paddingVertical: getScaleSize(18),
      backgroundColor: theme.white,
      marginRight: getScaleSize(8),
    },
    nextButtonContainer: {
      flex: 1.0,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: getScaleSize(12),
      paddingVertical: getScaleSize(18),
      backgroundColor: theme.primary,
      marginLeft: getScaleSize(8),
    },
    securityItemContainer: {
      paddingVertical: getScaleSize(8),
      paddingHorizontal: getScaleSize(12),
      borderRadius: getScaleSize(12),
      borderColor: '#D5D5D5',
      borderWidth: 1,
      marginTop: getScaleSize(16),
    },
    devider: {
      backgroundColor: '#E6E6E6',
      height: 1,
      marginTop: getScaleSize(18),
    },
    dotView: {
      // flex:1.0,
      borderStyle: 'dashed',
      borderColor: theme.primary,
      borderWidth: 1,
      marginTop: getScaleSize(8),
    },
    informationContainer: {
      marginTop: getScaleSize(24),
      borderWidth: 1,
      borderColor: '#D5D5D5',
      borderRadius: getScaleSize(16),
      paddingHorizontal: getScaleSize(24),
      paddingVertical: getScaleSize(24),
    },
    newHorizontalView: {
      flexDirection: 'row',
      marginTop: getScaleSize(8),
    },
    quateContainer: {
      paddingVertical: getScaleSize(16),
      paddingHorizontal: getScaleSize(62),
      borderRadius: getScaleSize(12),
      backgroundColor: theme._214C65,
    },
    inputContainer: {
      borderWidth: 1,
      borderColor: theme._D5D5D5,
      borderRadius: getScaleSize(12),
      marginTop: getScaleSize(12),
    },
    textInput: {
      fontSize: getScaleSize(18),
      color: theme._323232,
      padding: getScaleSize(16),
      minHeight: getScaleSize(240),
      textAlignVertical: 'top',
      fontFamily: FONTS.Lato.Regular,
    },
    inputContainerHeight: {
      minHeight: getScaleSize(190),
      textAlignVertical: 'top'
    },
  });
