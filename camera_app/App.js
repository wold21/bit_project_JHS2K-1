import React, { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Text,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Camera } from 'expo-camera';
import styled from 'styled-components';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { imageTransfer } from './api';
import ProgressBar from './Screen/progressBar';
import FaceLine from './Screen/FaceLine';
import GetPhotoBtn from './Buttons/MainScreenBtns/GetPhotoBtn';
import SwitchCameraBtn from './Buttons/MainScreenBtns/SwitchCameraBtn';
import TakePhotoBtn from './Buttons/MainScreenBtns/TakePhotoBtn';
import SaveBtn from './Buttons/SaveShareCancelBtns/SaveBtn';
import ShareBtn from './Buttons/SaveShareCancelBtns/ShareBtn';
import CancelBtn from './Buttons/TransferCancelBtns/CancelBtn';
import TransferBtn from './Buttons/TransferCancelBtns/TransferBtn';
import ChangeFemaleBtn from './Buttons/ChangeBtns/ChangeFemaleBtn';
import ChangeTwoPeopleBtn from './Buttons/ChangeBtns/ChangeTwoPeopleBtn';

let currentPhoto = ''; // 찍은 사진 저장용
let photos = []; // 모델 계산후 얻은 [원본, 결과] 사진 리스트 저장용
let gender = 'female';

const { width, height } = Dimensions.get('window');

const CenterView = styled.View`
  flex: 1;
  background-color: white;
`;

const IconContainer = styled.View`
  width: 100%;
  height: 100%;
  flex: 1;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;

const ChangeFunctionContainer = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  position: absolute;
  bottom: 190px;
  justify-content: space-around;
`;

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [image, setImage] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isAfterview, setIsAfterview] = useState(false);
  const [imageSelected, setImageSelected] = useState(false);
  const [imageComeback, setImageComeback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTwoPeople, setIsTwoPeople] = useState(false);
  const cameraRef = useRef();

  useEffect(() => {
    (async () => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      setHasPermission(status == 'granted');
      const {
        picStatus,
      } = await ImagePicker.requestCameraRollPermissionsAsync();
      setImage(picStatus === 'granted');
    })();
  }, []);

  const switchCameraType = () => {
    if (isPreview) {
      return;
    }
    setCameraType((cameraType) =>
      cameraType === Camera.Constants.Type.front
        ? Camera.Constants.Type.back
        : Camera.Constants.Type.front
    );
  };

  const takePhoto = async () => {
    try {
      if (cameraRef.current) {
        const options = { quality: 1, base64: true };
        let photo = await cameraRef.current.takePictureAsync(options);
        const source = photo.uri;
        console.log(source);
        if (source) {
          await cameraRef.current.pausePreview();
          setIsPreview(true);
        }

        currentPhoto = photo.base64; // photo.base64는 촬영한 사진의 이미지 String 값
      }
      // if (photo.uri) {
      //   this.savePhoto(photo.uri);
      // }
    } catch (error) {
      alert(`error: ${error}`);
    }
  };

  const getPhotos = async () => {
    const photo = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 1,
      base64: true,
    });
    if (!photo.uri) {
      setHasPermission(true);
    } else {
      setImage(photo.uri);
      setImageSelected(true);
      setImageComeback(true);
    }
    currentPhoto = photo.base64;
    gender = 'female';
  };

  const changeToMale = () => {
    if (gender === 'female') {
      gender = 'male';
    } else {
      gender = 'female';
    }
    console.log(gender);
  };

  const changeToTwoPeople = () => {
    if (isTwoPeople) {
      setIsTwoPeople(false);
    } else {
      setIsTwoPeople(true);
    }
  };

  const getTransferImage = async () => {
    try {
      setIsLoading(true);
      photos = await imageTransfer(currentPhoto, gender);
      setIsLoading(false);

      await cameraRef.current.resumePreview();

      if (!photos) {
        setIsAfterview(false);
      } else {
        setIsAfterview(true);
      }
      setIsPreview(false);
      setImageSelected(false);
      setImageComeback(false);

      gender = 'female';
    } catch (error) {
      console.log(`getTransferImage Error: ${error}`);
    }
  };

  const cancelPreviewBtn = async () => {
    await cameraRef.current.resumePreview();
    setIsPreview(false);
    setImageSelected(false);
    setImageComeback(false);
    setIsAfterview(false);
  };

  savePhoto = async (uri) => {
    try {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status === 'granted') {
        const asset = await MediaLibrary.createAssetAsync(uri);
        let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
        if (album === null) {
          album = await MediaLibrary.createAlbumAsync(ALBUM_NAME);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album.id);
        }
      } else {
        setHasPermission(false);
      }
    } catch (error) {
      console.log(`savePhotoError: ${error}`);
    }
  };

  const saveResultPhoto = async () => {
    try {
      Alert.alert('저장완료❤', '갤러리에서 확인할 수 있습니다.');
      const base64Code = photos[1].split('data:image/png;base64,')[1];

      const filename = FileSystem.documentDirectory + 'changed.png';
      await FileSystem.writeAsStringAsync(filename, base64Code, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await MediaLibrary.saveToLibraryAsync(filename);
      setIsAfterview(false);
    } catch (error) {
      console.log(error);
    }
  };

  const openShareDialog = async () => {
    try {
      const base64Code = photos[1].split('data:image/png;base64,')[1];

      const filename = FileSystem.documentDirectory + 'changed.png';
      await FileSystem.writeAsStringAsync(filename, base64Code, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(filename);
      setIsAfterview(false);
    } catch (error) {
      console.log(error);
    }
  };

  if (hasPermission === true) {
    return isLoading ? (
      <>
        <ProgressBar />
        <ActivityIndicator />
      </>
    ) : (
      <CenterView>
        <Camera
          style={{
            alignItems: 'center',
            width: width - 1,
            height: height / 1.4,
            marginTop: 50,
          }}
          type={cameraType}
          ref={cameraRef}
        >
          <FaceLine />
        </Camera>
        <ChangeFunctionContainer>
          {!isTwoPeople && <ChangeFemaleBtn onPress={changeToMale} />}
          <ChangeTwoPeopleBtn onPress={changeToTwoPeople} />
        </ChangeFunctionContainer>
        {imageSelected && imageComeback && (
          <>
            <Image
              style={{
                width: width - 1,
                height: height / 1.4,
                marginTop: 50,
                position: 'absolute',
              }}
              source={{ uri: image }}
            />
            <FemaleMale>
              <ChangeFemaleBtn onPress={changeToMale} />
            </FemaleMale>
          </>
        )}

        {isAfterview && (
          <Image
            style={{
              width: width - 1,
              height: height / 1.4,
              marginTop: 50,
              position: 'absolute',
            }}
            source={{ uri: photos[1] }}
          />
        )}

        {!isPreview && !imageComeback && !isAfterview && !imageSelected && (
          <IconContainer>
            <GetPhotoBtn onPress={getPhotos} />
            <TakePhotoBtn onPress={takePhoto} />
            <SwitchCameraBtn onPress={switchCameraType} />
          </IconContainer>
        )}
        {isAfterview && !isPreview && (
          <IconContainer>
            <SaveBtn onPress={saveResultPhoto} />
            <ShareBtn onPress={openShareDialog} />
            <CancelBtn onPress={cancelPreviewBtn} />
          </IconContainer>
        )}
        {(imageSelected || isPreview) && (
          <IconContainer>
            <TransferBtn onPress={getTransferImage} />
            <CancelBtn onPress={cancelPreviewBtn} />
          </IconContainer>
        )}
      </CenterView>
    );
  } else if (hasPermission === false) {
    return (
      <CenterView>
        <Text>Don't have permission for this</Text>
      </CenterView>
    );
  } else {
    return (
      <CenterView>
        <ActivityIndicator />
      </CenterView>
    );
  }
}
