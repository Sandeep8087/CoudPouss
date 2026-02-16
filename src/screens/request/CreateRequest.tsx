import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Alert,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  SafeAreaView,
  TextInput,
} from 'react-native';

//ASSETS
import { FONTS, IMAGES } from '../../assets';

//CONTEXT
import { ThemeContext, ThemeContextType } from '../../context';

//CONSTANT
import { formatDecimalInput, getScaleSize, SHOW_TOAST, useString } from '../../constant';

//COMPONENT
import {
  AssistanceItems,
  CalendarComponent,
  CategoryDropdown,
  Header,
  Input,
  ProgressSlider,
  ProgressView,
  SearchComponent,
  ServiceItem,
  Text,
  TimePicker,
} from '../../components';

//PACKAGES
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { SCREENS } from '..';
import { API } from '../../api';
import { launchImageLibrary } from 'react-native-image-picker';
import moment from 'moment';
import { createThumbnail } from 'react-native-create-thumbnail';

const { width } = Dimensions.get('window');
const cellSize = (width - 30) / 7;

export default function CreateRequest(props: any) {
  const STRING = useString();
  const { theme } = useContext<any>(ThemeContext);

  const category = props.route.params?.category;
  const subCategory = props.route.params?.subCategory;


  useEffect(() => {
    setSelectedCategoryItem(category ?? null);
    setSelectSubCategoryItem(subCategory ?? null);
  }, [category, subCategory]);

  const patterns = ['small', 'large', 'large', 'small'];

  const [selectedProgress, setSelectedProgress] = useState(category ? 3 : 1);
  const [selectedCategory, setSelectedCategory] = useState('professional');
  const [selectedCategoryItem, setSelectedCategoryItem] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [valuation, setValuation] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [selectSubCategoryItem, setSelectSubCategoryItem] = useState<any>(null);
  const [firstImage, setFirstImage] = useState<any>(null);
  const [secondImage, setSecondImage] = useState<any>(null);
  const [firstImageURL, setFirstImageURL] = useState<any>(null);
  const [secondImageURL, setSecondImageURL] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [productName, setProductName] = useState('')
  const [productNameError, setProductNameError] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [quantityError, setQuantityError] = useState('')
  const [firstProductImage, setFirstProductImage] = useState<any>(null);
  const [secondProductImage, setSecondProductImage] = useState<any>(null);
  const [firstProductImageURL, setFirstProductImageURL] = useState<any>(null);
  const [secondProductImageURL, setSecondProductImageURL] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('')

  useEffect(() => {
    getAllCategories();
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

  async function getSubCategoryData(id: any) {
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

  const pickImage = async (type: string) => {
    setLoading(true);
    launchImageLibrary(
      {
        mediaType: 'mixed', // 👈 image + video
        selectionLimit: 1,
      },
      async (response) => {
        if (!response.didCancel && !response.errorCode && response.assets) {
          const asset: any = response.assets[0];
          console.log('asset', asset);

          // 👇 ADD thumbnail handling
          const finalAsset = await handleThumbnail(asset);

          if (type === 'first') {
            setFirstImage(finalAsset);
            uploadProfileImage(finalAsset, type);
          } else if (type === 'second') {
            setSecondImage(finalAsset);
            uploadProfileImage(finalAsset, type);
          } else if (type === 'firstProduct') {
            setFirstProductImage(finalAsset);
            uploadProfileImage(finalAsset, type);
          } else if (type === 'secondProduct') {
            setSecondProductImage(finalAsset);
            uploadProfileImage(finalAsset, type);
          }
        } else {
          setLoading(false);
        }
      }
    );
  };

  const handleThumbnail = async (asset: any) => {
    // IMAGE → return same asset
    if (asset?.type?.startsWith('image')) {
      return asset;
    }

    // VIDEO → create thumbnail
    if (asset?.type?.startsWith('video')) {
      try {
        const thumbnail = await createThumbnail({
          url: asset.uri,
          timeStamp: 1000, // 1 second
        });

        return {
          ...asset,
          thumbnailUri: thumbnail.path,
          thumbnailType: 'image/jpeg',
        };
      } catch (e) {
        console.log('Thumbnail error:', e);
        return asset;
      }
    }

    return asset;
  };

  async function uploadProfileImage(asset: any, type: string) {
    try {
      const formData = new FormData();

      const isVideo = asset?.type?.startsWith('video');

      formData.append('file', {
        uri: isVideo ? asset.thumbnailUri : asset.uri,
        name: isVideo
          ? `video_thumb_${Date.now()}.jpg`
          : asset?.fileName || 'profile_image.jpg',
        type: isVideo ? 'image/jpeg' : asset?.type || 'image/jpeg',
      });
      setLoading(true);
      const result = await API.Instance.post(API.API_ROUTES.uploadServiceRequestImage, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (result.status) {
        if (type === 'first') setFirstImageURL(result?.data);
        else if (type === 'second') setSecondImageURL(result?.data);
        else if (type === 'firstProduct') setFirstProductImageURL(result?.data);
        else if (type === 'secondProduct') setSecondProductImageURL(result?.data);
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error');
        if (type === 'first') setFirstImage(null);
        else if (type === 'second') setSecondImage(null);
        else if (type === 'firstProduct') setFirstProductImage(null);
        else if (type === 'secondProduct') setSecondProductImage(null);
      }
    } catch (error: any) {
      if (type === 'first') setFirstImage(null);
      else if (type === 'second') setSecondImage(null);
      else if (type === 'firstProduct') setFirstProductImage(null);
      else if (type === 'secondProduct') setSecondProductImage(null);
      SHOW_TOAST(error?.message ?? '', 'error');
    } finally {
      setLoading(false);
    }
  }

  function onNextProfessional() {
    if (selectedProgress === 1) {
      if (!selectedCategoryItem) {
        SHOW_TOAST('Please select a category', 'error');
        return;
      } else {
        setSelectedProgress(2);
      }
    } else if (selectedProgress === 2) {
      if (!selectSubCategoryItem) {
        SHOW_TOAST('Please select a service', 'error');
        return;
      } else {
        setSelectedProgress(3);
      }
    } else if (selectedProgress === 3) {
      if (!selectedCategory) {
        SHOW_TOAST('Please select a service provider', 'error');
        return;
      } else {
        setSelectedProgress(4);
      }
    } else if (selectedProgress === 4) {
      if (!address) {
        setAddressError('Please enter an address');
        return;
      } else if (!firstImageURL) {
        SHOW_TOAST('Please upload a photo', 'error');
        return;
      } else if (!description) {
        SHOW_TOAST('Please enter a description', 'error');
        return;
      } else {
        setSelectedProgress(5);
      }
    } else if (selectedProgress == 5) {
      if (!valuation) {
        SHOW_TOAST('Please enter a valuation', 'error');
        return;
      } else if (!selectedDate) {
        SHOW_TOAST('Please select a date', 'error');
        return;
      } else if (!selectedTime) {
        SHOW_TOAST('Please select a time', 'error');
        return;
      } else {
        setSelectedProgress(6);
      }
    } else if (selectedProgress == 6) {
      if (!isLoading) {
        onCreateRequest();
      }
    }
  }

  function onNextNonProfessional() {
    if (selectedProgress === 1) {
      if (!selectedCategoryItem) {
        SHOW_TOAST('Please select a category', 'error');
        return;
      } else {
        setSelectedProgress(2);
      }
    } else if (selectedProgress === 2) {
      if (!selectSubCategoryItem) {
        SHOW_TOAST('Please select a service', 'error');
        return;
      } else {
        setSelectedProgress(3);
      }
    } else if (selectedProgress === 3) {
      if (!selectedCategory) {
        SHOW_TOAST('Please select a service provider', 'error');
        return;
      } else {
        setSelectedProgress(4);
      }
    } else if (selectedProgress === 4) {
      if (!firstImageURL) {
        SHOW_TOAST('Please upload a photo', 'error');
        return;
      } else if (!description) {
        SHOW_TOAST('Please enter a description', 'error');
        return;
      } else {
        setSelectedProgress(5);
      }
    } else if (selectedProgress == 5) {
      if (!selectedDate) {
        SHOW_TOAST('Please select a date', 'error');
        return;
      } else if (!selectedTime) {
        SHOW_TOAST('Please select a time', 'error');
        return;
      } else {
        setSelectedProgress(6);
      }
    } else if (selectedProgress == 6) {
      if (!productName) {
        setProductNameError('Please enter a product name');
        return;
      } else if (!quantity) {
        setQuantityError('Please enter a quantity');
        return;
      } else if (!firstProductImageURL) {
        SHOW_TOAST('Please upload a photo', 'error');
        return;
      } else {
        setSelectedProgress(7);
      }
    } else if (selectedProgress == 7) {
      if (!isLoading) {
        onCreateRequest();
      }

    }
  }

  function onBackProfessional() {
    if (selectedProgress === 1) {
      props.navigation.goBack();
    } else if (selectedProgress === 2) {
      setSelectedProgress(1);
    } else if (selectedProgress === 3) {
      if (category && subCategory) {
        props.navigation.goBack();
      } else {
        setSelectedProgress(2);
      }
    } else if (selectedProgress === 4) {
      setSelectedProgress(3);
    } else if (selectedProgress == 5) {
      setSelectedProgress(4);
    } else if (selectedProgress === 6) {
      setSelectedProgress(4);
    }
  }

  function onBackNonProfessional() {
    if (selectedProgress === 1) {
      props.navigation.goBack();
    } else if (selectedProgress === 2) {
      setSelectedProgress(1);
    } else if (selectedProgress === 3) {
      if (category && subCategory) {
        props.navigation.goBack();
      } else {
        setSelectedProgress(2);
      }
    } else if (selectedProgress === 4) {
      setSelectedProgress(3);
    } else if (selectedProgress == 5) {
      setSelectedProgress(4);
    } else if (selectedProgress === 6) {
      setSelectedProgress(5);
    } else if (selectedProgress === 7) {
      setSelectedProgress(4);
    }
  }

  async function onCreateRequest() {
    try {
      setLoading(true);
      const date = moment(selectedDate).format("YYYY-MM-DD");
      const time = moment(selectedTime).format("hh:mm A");
      const dateTime = moment(`${date} ${time}`, "YYYY-MM-DD hh:mm A").utc().format();
      const productImageUrls = [];
      const imageUrls = [];

      if (firstProductImageURL) {
        productImageUrls.push({ storage_key: firstProductImageURL?.storage_key });
      }

      if (secondProductImageURL) {
        productImageUrls.push({ storage_key: secondProductImageURL?.storage_key });
      }

      if (firstImageURL) {
        imageUrls.push({ storage_key: firstImageURL?.storage_key });
      }

      if (secondImageURL) {
        imageUrls.push({ storage_key: secondImageURL?.storage_key });
      }

      let params = {};
      if (selectedCategory == 'professional') {
        params = {
          is_professional: true,
          category_id: selectedCategoryItem?.id,
          sub_category_id: selectSubCategoryItem?.id,
          description: description.trim(),
          description_files: imageUrls,
          service_address: address.trim(),
          latitude: 23.2156,
          longitude: 72.6369,
          validation_amount: valuation,
          chosen_datetime: dateTime
        }
      } else if (selectedCategory == 'non_professional') {
        params = {
          is_professional: false,
          category_id: selectedCategoryItem?.id,
          sub_category_id: selectSubCategoryItem?.id,
          description: description.trim(),
          description_files: imageUrls,
          chosen_datetime: dateTime,
          service_address: address.trim(),
          latitude: 23.2156,
          longitude: 72.6369,
          barter_product: {
            product_name: productName,
            quantity: quantity,
            barter_photo_files: productImageUrls
          }
        }
      }

      const result = await API.Instance.post(API.API_ROUTES.onServiceRequest, params);
      console.log('result', result.status, result)
      if (result.status) {
        SHOW_TOAST(result?.data?.message ?? '', 'success')
        props?.navigation?.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: SCREENS.Thankyou.identifier }],
          }),
        );
      } else {
        SHOW_TOAST(result?.data?.message ?? '', 'error')
        console.log('error==>', result?.data?.message)
      }
    } catch (error: any) {
      setLoading(false);
      SHOW_TOAST(error?.message ?? '', 'error');

      console.log('erro sbqwhdr==>', error?.message)
    } finally {
      setLoading(false);
    }
  }

  function renderProfessional() {
    if (selectedProgress === 1) {
      return renderCategoryView();
    } else if (selectedProgress === 2) {
      return renderServiceView();
    } else if (selectedProgress === 3) {
      return renderServiceProviderView()
    } else if (selectedProgress === 4) {
      return renderDescriptionView();
    } else if (selectedProgress === 5) {
      return renderValuationOfJOB();
    } else if (selectedProgress === 6) {
      return renderPreview();
    }
  }

  function renderNonProfessional() {
    if (selectedProgress === 1) {
      return renderCategoryView();
    } else if (selectedProgress === 2) {
      return renderServiceView();
    } else if (selectedProgress === 3) {
      return renderServiceProviderView();
    } else if (selectedProgress === 4) {
      return renderDescriptionView();
    } else if (selectedProgress === 5) {
      return renderValuationOfJOB();
    } else if (selectedProgress === 6) {
      return renderBarterProductDetails();
    } else if (selectedProgress === 7) {
      return renderPreview();
    }
  }

  const getPreviewUri = (asset: any) => {
    return asset?.thumbnailUri || asset?.uri;
  };

  function renderPreview() {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles(theme).serviceProviderCotainer, { marginHorizontal: getScaleSize(22) }]}>
          <Text
            size={getScaleSize(24)}
            font={FONTS.Lato.Bold}
            color={theme.primary}>
            {STRING.Preview}
          </Text>
          <Text
            style={{ marginTop: getScaleSize(12) }}
            size={getScaleSize(16)}
            font={FONTS.Lato.SemiBold}
            color={theme._939393}>
            {STRING.Preview_message}
          </Text>
          <Text
            style={{ marginTop: getScaleSize(16) }}
            size={getScaleSize(24)}
            font={FONTS.Lato.Bold}
            color={theme.primary}>
            {selectedCategoryItem?.category_name ?? 'No Category Selected'}
          </Text>
          <View style={styles(theme).categoryView}>
            {selectSubCategoryItem?.image ?
              <Image
                style={styles(theme).imageView}
                source={{ uri: selectSubCategoryItem?.image }}
              />
              :
              <View style={[styles(theme).imageView, { backgroundColor: theme._D5D5D5 }]} />
            }
            <Text
              style={{
                marginTop: getScaleSize(16),
                marginHorizontal: getScaleSize(12),
              }}
              size={getScaleSize(20)}
              font={FONTS.Lato.SemiBold}
              color={theme.primary}>
              {selectSubCategoryItem?.subcategory_name ?? 'No Service Selected'}
            </Text>
          </View>
          <Text
            style={{ marginTop: getScaleSize(24) }}
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={theme._323232}>
            {STRING.JobDetails}
          </Text>
          <View style={styles(theme).detailsView}>
            <View style={styles(theme).itemView}>
              <Text
                size={getScaleSize(18)}
                font={FONTS.Lato.SemiBold}
                color={theme._989898}>
                {selectedCategory === 'professional' ? STRING.Valuation : STRING.product}
              </Text>
              <Text
                style={{ marginTop: getScaleSize(6) }}
                size={getScaleSize(20)}
                font={FONTS.Lato.SemiBold}
                color={theme.primary}>
                {selectedCategory === 'professional' ? `€${valuation}` : productName}
              </Text>
            </View>
            <View style={styles(theme).deviderVerticalView} />
            <View style={styles(theme).itemView}>
              <Text
                size={getScaleSize(18)}
                font={FONTS.Lato.SemiBold}
                color={theme._989898}>
                {STRING.JobDate}
              </Text>
              <Text
                style={{ marginTop: getScaleSize(6) }}
                size={getScaleSize(20)}
                font={FONTS.Lato.SemiBold}
                color={theme.primary}>
                {moment(selectedDate).format('DD MMM')}
              </Text>
            </View>
            <View style={styles(theme).deviderVerticalView} />
            <View style={styles(theme).itemView}>
              <Text
                size={getScaleSize(18)}
                font={FONTS.Lato.SemiBold}
                color={theme._989898}>
                {STRING.JobTime}
              </Text>
              <Text
                style={{ marginTop: getScaleSize(6) }}
                size={getScaleSize(20)}
                font={FONTS.Lato.SemiBold}
                color={theme.primary}>
                {moment(selectedTime).format('hh:mm A')}
              </Text>
            </View>
          </View>
          {selectedCategory == 'non_professional' && (
            <View style={{ marginTop: getScaleSize(24) }}>
              <Input
                placeholder={STRING.enter_name}
                placeholderTextColor={theme._939393}
                inputTitle={STRING.quantity}
                inputColor={true}
                continerStyle={{}}
                value={quantity.toString()}
                editable={false}
              />
              <Text
                style={{ marginTop: getScaleSize(16) }}
                size={getScaleSize(18)}
                font={FONTS.Lato.SemiBold}
                color={theme._323232}>
                {STRING.product_images}
              </Text>
              <View style={styles(theme).photosViewContainer}>
                {firstProductImage && (
                  <Image
                    style={[styles(theme).photosView]}
                    source={{ uri: getPreviewUri(firstProductImage) }}
                  />
                )}
                {secondProductImage && (
                  <Image
                    style={[styles(theme).photosView]}
                    source={{ uri: getPreviewUri(secondProductImage) }}
                  />
                )}

              </View>
            </View>
          )}
          <Text
            style={{ marginTop: getScaleSize(24) }}
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={theme._323232}>
            {STRING.Servicedescription}
          </Text>
          <View style={styles(theme).serviceDescriptionView}>
            <Text
              size={getScaleSize(18)}
              font={FONTS.Lato.Regular}
              color={theme._555555}>
              {description ?? 'No Description'}
            </Text>
          </View>
          <Text
            style={{ marginTop: getScaleSize(24) }}
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={theme._323232}>
            {STRING.Jobphotos}
          </Text>
          <View style={styles(theme).photosViewContainer}>
            {firstImage && (
              <Image
                style={[styles(theme).photosView]}
                source={{ uri: getPreviewUri(firstImage) }}
              />
            )}
            {secondImage && (

              <Image
                style={[styles(theme).photosView]}
                source={{ uri: getPreviewUri(secondImage) }}
              />
            )}
          </View>
          <View style={{ height: 16 }} />
        </View>
      </ScrollView>
    );
  }

  function renderValuationOfJOB() {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles(theme).serviceProviderCotainer, { marginHorizontal: getScaleSize(22), }]}>
          <Text
            size={getScaleSize(24)}
            font={FONTS.Lato.Bold}
            color={theme.primary}>
            {selectedCategory === 'professional' ? STRING.ValuationofJob : STRING.Choose_Date_Time}
          </Text>
          <Text
            style={{ marginTop: getScaleSize(12) }}
            size={getScaleSize(16)}
            font={FONTS.Lato.SemiBold}
            color={theme._939393}>
            {STRING.valuation_message}
          </Text>
          {selectedCategory === 'professional' && (
            <View style={styles(theme).textInputContainer}>
              <Input
                placeholder={STRING.EnterValuation}
                placeholderTextColor={theme._939393}
                inputTitle={STRING.EnterValuation}
                inputColor={theme._555555}
                value={valuation ? `${'€'}${valuation}` : ''}
                keyboardType="numeric"
                autoCapitalize="none"
                onChangeText={text => {
                  setValuation(formatDecimalInput(text));
                }}
              />
            </View>
          )}
          <Text
            style={{ marginTop: getScaleSize(12) }}
            size={getScaleSize(16)}
            font={FONTS.Lato.SemiBold}
            color={theme._555555}>
            {STRING.ChooseDate}
          </Text>
          <CalendarComponent
            selectedDate={selectedDate}
            onDateChange={(date: any) => {
              setSelectedDate(date);
            }}
          />
          <View style={styles(theme).deviderView} />
          <Text
            style={{ marginTop: getScaleSize(4) }}
            size={getScaleSize(16)}
            font={FONTS.Lato.SemiBold}
            color={theme._555555}>
            {STRING.ChooseTime}
          </Text>
          <TimePicker
            selectedDate={selectedDate}
            onTimeChange={(hour: number, minute: number, am: boolean) => {
              let hour24 = hour % 12;
              if (!am) hour24 += 12;
              const utcString = moment()
                .hour(hour24)
                .minute(minute)
                .second(0)
                .utc()
                .format();
              setSelectedTime(new Date(utcString));
            }}
          />
          <View style={{ height: 16 }} />
        </View>
      </ScrollView>
    );
  }

  function renderDescriptionView() {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles(theme).serviceProviderCotainer, { marginHorizontal: getScaleSize(22) }]}>
          <Text
            size={getScaleSize(24)}
            font={FONTS.Lato.Bold}
            color={theme.primary}>
            {STRING.DescribeAboutService}
          </Text>
          <Text
            style={{ marginTop: getScaleSize(12) }}
            size={getScaleSize(16)}
            font={FONTS.Lato.SemiBold}
            color={theme._939393}>
            {STRING.descriptionMessage}
          </Text>
          <Input
            placeholder={'search address'}
            placeholderTextColor={theme._939393}
            inputTitle={STRING.enter_address}
            inputColor={true}
            searchBox={IMAGES.search}
            continerStyle={{ marginTop: getScaleSize(12) }}
            value={address}
            onChangeText={(text: any) => {
              setAddress(text);
              setAddressError('');
            }}
            isError={addressError}
          />
          <Text
            style={{ marginTop: getScaleSize(12) }}
            size={getScaleSize(17)}
            font={FONTS.Lato.Medium}
            color={theme._424242}>
            {STRING.EnterServicedescription}
          </Text>
          <View style={styles(theme).inputContainer}>
            <TextInput
              style={styles(theme).textInput}
              value={description}
              onChangeText={(text: any) => {
                if (text.startsWith(' ')) return;
                setDescription(text);
              }}
              placeholder={STRING.Enterdescriptionhere}
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={8}
              textAlignVertical="top"
              returnKeyType="default"
            />
          </View>
          <Text
            style={{ marginTop: getScaleSize(20) }}
            size={getScaleSize(17)}
            font={FONTS.Lato.Medium}
            color={theme._424242}>
            {STRING.UploadPhotosofaJob}
          </Text>
          <View style={styles(theme).imageUploadContent}>
            <TouchableOpacity
              style={[styles(theme).uploadButton, { marginRight: getScaleSize(9) }]}
              activeOpacity={1}
              onPress={() => {
                pickImage('first');
              }}>
              {firstImage ? (
                <Image
                  resizeMode='cover'
                  style={styles(theme).viewImage}
                  source={{ uri: getPreviewUri(firstImage) }}
                />
              ) : (
                <>
                  <Image
                    style={styles(theme).attachmentIcon}
                    source={IMAGES.upload_attachment}
                  />
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
              style={[styles(theme).uploadButton, { marginLeft: getScaleSize(9) }]}
              activeOpacity={1}
              onPress={() => {
                pickImage('second');
              }}>
              {secondImage ? (
                <Image
                  resizeMode='cover'
                  style={styles(theme).viewImage}
                  source={{ uri: getPreviewUri(secondImage) }}
                />
              ) : (
                <>
                  <Image
                    style={styles(theme).attachmentIcon}
                    source={IMAGES.upload_attachment}
                  />
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
          <Text
            style={{ marginTop: getScaleSize(8) }}
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={theme._939393}>
            {STRING.upload_message}
          </Text>
          <Text
            style={{}}
            size={getScaleSize(18)}
            font={FONTS.Lato.SemiBold}
            color={theme._939393}>
            {STRING.you_can_also_upload_a_video}
          </Text>
        </View>
      </ScrollView>
    );
  }

  function renderBarterProductDetails() {
    return (
      <ScrollView showsVerticalScrollIndicator={false} >
        <View style={[styles(theme).serviceProviderCotainer, { marginHorizontal: getScaleSize(22) }]}>
          <Text
            size={getScaleSize(24)}
            font={FONTS.Lato.Bold}
            color={theme.primary}>
            {STRING.barter_product_details}
          </Text>
          <Text
            style={{ marginTop: getScaleSize(12) }}
            size={getScaleSize(16)}
            font={FONTS.Lato.SemiBold}
            color={theme._939393}>
            {STRING.add_details_of_the_product_or_thing_you_want_to_offer_in_exchange_for_the_service}
          </Text>
          <View style={styles(theme).deviderView} />
          <Input
            placeholder={STRING.enter_name}
            placeholderTextColor={theme._939393}
            inputTitle={STRING.add_product_name}
            inputColor={true}
            continerStyle={{ marginBottom: getScaleSize(22) }}
            value={productName}
            onChangeText={text => {
              setProductName(text.trim());
            }}
            isError={productNameError}
          />
          <Input
            placeholder={STRING.enter_name}
            placeholderTextColor={theme._939393}
            inputTitle={STRING.quantity}
            inputColor={true}
            quantityIcon={true}
            continerStyle={{ marginBottom: getScaleSize(22) }}
            value={quantity.toString()}
            onChangeText={(text: any) => {
              const cleaned = text.replace(/[^0-9]/g, '');
              setQuantity(cleaned === '' ? 0 : Number(cleaned));
            }}
            isError={quantityError}
            onPressQuantityRemove={() => {
              setQuantity(prev => (prev > 0 ? prev - 1 : 0));
            }}
            onPressQuantityAdd={() => {
              setQuantity(prev => prev + 1);
            }}
          />
          <Text
            style={{ marginTop: getScaleSize(20) }}
            size={getScaleSize(17)}
            font={FONTS.Lato.Medium}
            color={theme._424242}>
            {STRING.upload_photos_of_a_product}
          </Text>
          <View style={styles(theme).imageUploadContent}>
            <TouchableOpacity
              style={[styles(theme).uploadButton, { marginRight: getScaleSize(9) }]}
              activeOpacity={1}
              onPress={() => {
                pickImage('firstProduct');
              }}>
              {firstProductImage ? (
                <Image
                  resizeMode='cover'
                  style={styles(theme).viewImage}
                  source={{ uri: getPreviewUri(firstProductImage) }}
                />
              ) : (
                <>
                  <Image
                    style={styles(theme).attachmentIcon}
                    source={IMAGES.upload_attachment}
                  />
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
              style={[styles(theme).uploadButton, { marginLeft: getScaleSize(9) }]}
              activeOpacity={1}
              onPress={() => {
                pickImage('secondProduct');
              }}>
              {secondProductImage ? (
                <Image
                  resizeMode='cover'
                  style={styles(theme).viewImage}
                  source={{ uri: getPreviewUri(secondProductImage) }}
                />
              ) : (
                <>
                  <Image
                    style={styles(theme).attachmentIcon}
                    source={IMAGES.upload_attachment}
                  />
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
        </View>
      </ScrollView>
    );
  }

  function renderServiceView() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ marginHorizontal: getScaleSize(22) }}>
          <Text
            size={getScaleSize(24)}
            font={FONTS.Lato.Bold}
            color={theme.primary}>
            {STRING.SelectAService}
          </Text>
          <Text
            style={{ marginTop: getScaleSize(12) }}
            size={getScaleSize(16)}
            font={FONTS.Lato.SemiBold}
            color={theme._939393}>
            {STRING.serviceMessage}
          </Text>
          {/* <Text
            style={{ marginTop: getScaleSize(12) }}
            size={getScaleSize(17)}
            font={FONTS.Lato.Medium}
            color={theme._555555}>
            {STRING.select_a_category}
          </Text> */}
          {/* <View style={{ marginTop: getScaleSize(18) }}>
            <SearchComponent />
          </View> */}
          <View style={{ marginTop: getScaleSize(22) }} />
        </View>
        <View style={{ flex: 1 }}>
          <FlatList
            data={subCategoryList}
            numColumns={2}
            contentContainerStyle={{ marginTop: getScaleSize(-20) }}
            keyExtractor={(item: any, index: number) => index.toString()}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ paddingLeft: getScaleSize(6) }}
            ListFooterComponent={() => {
              return <View style={{ height: getScaleSize(50) }} />;
            }}
            renderItem={({ item, index }) => {
              const type = patterns[index % 4];
              return (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    setSelectSubCategoryItem(item);
                  }}
                  style={[
                    styles(theme).cardContainer,
                    {
                      borderWidth: selectSubCategoryItem?.id === item?.id ? 2 : 0,

                      height: type === 'small' ? getScaleSize(188) : getScaleSize(233),
                      marginTop: type === 'large' && index % 2 == 0 ? getScaleSize(-25) : getScaleSize(20),
                    }
                  ]}>
                  {item?.image ?
                    <Image
                      style={styles(theme).imageViewc}
                      source={{ uri: item?.image }}
                    />
                    :
                    <View style={[styles(theme).imageViewc, { backgroundColor: theme._D5D5D5 }]} />
                  }
                  <Text
                    style={{
                      marginVertical: getScaleSize(14),
                      marginHorizontal: getScaleSize(14),
                    }}
                    size={getScaleSize(16)}
                    font={FONTS.Lato.Bold}
                    color={theme.primary}>
                    {item?.subcategory_name}
                  </Text>
                </TouchableOpacity>
              )
            }}
          />
        </View>
      </View>
    );
  }

  function renderCategoryView() {
    return (
      <View style={[styles(theme).serviceProviderCotainer, { marginHorizontal: getScaleSize(22) }]}>
        <Text
          size={getScaleSize(24)}
          font={FONTS.Lato.Bold}
          color={theme.primary}>
          {STRING.SelectACategory}
        </Text>
        <Text
          style={{ marginTop: getScaleSize(12) }}
          size={getScaleSize(16)}
          font={FONTS.Lato.SemiBold}
          color={theme._939393}>
          {STRING.category_message}
        </Text>
        <Text
          style={{ marginTop: getScaleSize(12) }}
          size={getScaleSize(17)}
          font={FONTS.Lato.Medium}
          color={theme._424242}>
          {STRING.Selectacategory}
        </Text>
        <View style={{ marginTop: getScaleSize(8) }}>
          <CategoryDropdown
            onChange={item => {
              setSelectedCategoryItem(item);
              getSubCategoryData(item?.id);
            }}
            selectedItem={selectedCategoryItem}
            container={{}}
            data={allCategories}
          />
        </View>
      </View>
    );
  }

  function renderServiceProviderView() {
    return (
      <View style={[styles(theme).serviceProviderCotainer, { marginHorizontal: getScaleSize(22) }]}>
        <Text
          size={getScaleSize(24)}
          font={FONTS.Lato.Bold}
          color={theme.primary}>
          {STRING.select_your_service_provider}
        </Text>
        <Text
          style={{ marginTop: getScaleSize(12) }}
          size={getScaleSize(16)}
          font={FONTS.Lato.SemiBold}
          color={theme._939393}>
          {STRING.service_provider_message}
        </Text>
        <TouchableOpacity
          style={styles(theme).radioButtonContainer}
          activeOpacity={1}
          onPress={() => {
            setSelectedCategory('professional');
          }}>
          <Text
            style={{ flex: 1.0 }}
            size={getScaleSize(18)}
            font={FONTS.Lato.Medium}
            color={theme.primary}>
            {STRING.Professional}
          </Text>
          <Image
            style={styles(theme).radioButton}
            source={
              selectedCategory == 'professional' ? IMAGES.ic_radio_select : IMAGES.ic_radio_unselect
            }
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles(theme).radioButtonContainer}
          activeOpacity={1}
          onPress={() => {
            setSelectedCategory('non_professional');
          }}>
          <Text
            style={{ flex: 1.0 }}
            size={getScaleSize(18)}
            font={FONTS.Lato.Medium}
            color={theme.primary}>
            {STRING.Nonprofessional}
          </Text>
          <Image
            style={styles(theme).radioButton}
            source={
              selectedCategory == 'non_professional' ? IMAGES.ic_radio_select : IMAGES.ic_radio_unselect
            }
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles(theme).container}>
      <Header
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: getScaleSize(22), marginBottom: getScaleSize(40) }}>
        <View style={styles(theme).progressSlider}>
          <ProgressSlider
            fillCount={selectedProgress}
            totalCount={selectedCategory == 'professional' ? 6 : 7} />
        </View>
        <Text
          size={getScaleSize(12)}
          font={FONTS.Lato.Medium}
          color={theme.primary}
          style={{ alignSelf: 'center', marginTop: getScaleSize(9) }}>
          {`${((selectedProgress * 100) / (selectedCategory == 'professional' ? 6 : 7)).toFixed(2)}%`}
        </Text>
      </View>
      <View
        style={[styles(theme).container, {}]}>
        <>
          {selectedCategory == 'professional' ? renderProfessional() : renderNonProfessional()}
        </>
      </View>
      <View style={styles(theme).buttonContainer}>
        <TouchableOpacity
          style={styles(theme).backButtonContainer}
          activeOpacity={1}
          onPress={() => {
            if (selectedCategory == 'professional') {
              onBackProfessional();
            } else {
              onBackNonProfessional();
            }
          }}>
          <Text
            size={getScaleSize(19)}
            font={FONTS.Lato.Bold}
            color={theme.primary}
            style={{ alignSelf: 'center' }}>
            {selectedProgress === (selectedCategory == 'professional' ? 6 : 7) ? 'Edit' : STRING.Back}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles(theme).nextButtonContainer}
          activeOpacity={1}
          onPress={() => {
            if (selectedCategory == 'professional') {
              onNextProfessional();
            } else {
              onNextNonProfessional();
            }
          }}>
          <Text
            size={getScaleSize(19)}
            font={FONTS.Lato.Bold}
            color={theme.white}
            style={{ alignSelf: 'center' }}>
            {selectedProgress === (selectedCategory == 'professional' ? 6 : 7) ? 'Submit' : STRING.Next}
          </Text>
        </TouchableOpacity>
      </View>
      {isLoading && <ProgressView />}
    </View>
  );
}

const styles = (theme: ThemeContextType['theme']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.white },
    progressSlider: {
      marginTop: getScaleSize(16),
      marginHorizontal: getScaleSize(22),
      flex: 1.0,
    },
    buttonContainer: {
      flexDirection: 'row',
      marginHorizontal: getScaleSize(22),
      marginVertical: getScaleSize(17),
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
    serviceProviderCotainer: {
      flexDirection: 'column',
    },
    radioButtonContainer: {
      marginTop: getScaleSize(20),
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme._D5D5D5,
      paddingVertical: getScaleSize(12),
      paddingHorizontal: getScaleSize(17),
      borderRadius: getScaleSize(12),
    },
    radioButton: {
      height: getScaleSize(36),
      width: getScaleSize(36),
      alignSelf: 'center',
    },
    listContainer: {
      marginTop: getScaleSize(16),
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
    },
    attachmentIcon: {
      height: getScaleSize(24),
      width: getScaleSize(24),
      alignSelf: 'center',
    },
    textInputContainer: {
      marginTop: getScaleSize(12),
    },
    calenderHeader: {
      marginTop: getScaleSize(12),
      paddingVertical: getScaleSize(8),
      paddingHorizontal: getScaleSize(12),
      borderRadius: getScaleSize(18),
      backgroundColor: '#FBFBFB',
      flexDirection: 'row',
    },
    nextImage: {
      height: getScaleSize(24),
      width: getScaleSize(24),
    },
    categoryView: {
      height: getScaleSize(228),
      backgroundColor: '#EAF0F3',
      borderRadius: getScaleSize(20),
      marginTop: getScaleSize(18),
    },
    imageView: {
      height: getScaleSize(172),
      borderRadius: getScaleSize(20),
    },

    imageViewc: {
      flex: 1.0,
      borderRadius: getScaleSize(20),
    },

    detailsView: {
      paddingVertical: getScaleSize(21),
      flexDirection: 'row',
      borderRadius: getScaleSize(16),
      backgroundColor: '#FBFBFB',
      marginTop: getScaleSize(18),
    },
    itemView: {
      flex: 1.0,
      alignSelf: 'center',
      flexDirection: 'column',
      alignItems: 'center',
    },
    deviderView: {
      height: getScaleSize(1),
      backgroundColor: '#D6D6D6',
      marginVertical: getScaleSize(18),
    },
    serviceDescriptionView: {
      marginTop: getScaleSize(18),
      borderWidth: 1,
      borderColor: theme._D5D5D5,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    photosView: {
      height: getScaleSize(144),
      width: (Dimensions.get('window').width - getScaleSize(70)) / 2,
      borderRadius: 8,
    },
    cardContainer: {
      borderRadius: getScaleSize(20),
      backgroundColor: theme._EAF0F3,
      width: (Dimensions.get('window').width - getScaleSize(64)) / 2,
      marginLeft: getScaleSize(16),
      borderColor: theme.primary,
    },
    viewImage: {
      width: '100%',
      height: '100%',
      borderRadius: getScaleSize(8),
      overflow: 'hidden',
    },
    photosViewContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getScaleSize(26),
      marginTop: getScaleSize(18),
    },
    deviderVerticalView: {
      height: '100%',
      backgroundColor: '#D6D6D6',
      width: getScaleSize(1),
    },
  });
