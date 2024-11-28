import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';

const UploadVideoScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uid, setUid] = useState('');



  useEffect(() => {
    getData();
    // console.log(uid, '<<<<UID');
    setDisabled(!title || !description || !selectedVideo);
  }, [title, description, selectedVideo]);


  const uploadVideo = async (title, description, downloadURL, uid) => {
    // Store title, description, and image URL in Firestore
    const videoRef = await firestore().collection('Posts').add({
      title,
      description,
      videoUrl: downloadURL,
      authorId: uid,
      timestamp: firestore.FieldValue.serverTimestamp(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      likes: [],
      comments: [],
      share: [],
      type: 'video'
    });
    videoRef.update({ postId: videoRef.id })
    try {
      setTitle('');
      setDescription('');
      setSelectedVideo(null);

      Alert.alert('Success', 'Video uploaded successfully!');
      navigation.navigate('Home')
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', 'Failed to upload video.');
    } finally {
      setLoading(false);
    }
  }


  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('uid');
      if (value !== null) {
        setUid(value)
      }
      // console.log('VideoValue', value);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpload = async () => {
    if (!title || !description || !selectedVideo) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    else if (uid == '') {
      Alert.alert('Error', 'Uid is undefined')
      return;
    }
    setLoading(true);
    // Upload image to Firebase Storage
    const downloadURL = await uploadVideoToStorage(selectedVideo);
    uploadVideo(title, description, downloadURL, uid);
  };


  const onPressPlus = () => {
    ImagePicker.openPicker({
      mediaType: 'video',
    }).then((video) => {
      console.log('VideoData :', video);
      console.log('Video :', video.duration);
      console.log('Video Path:', video.path);
      setSelectedVideo(video.path);
    }).catch(error => {
      console.error('Video Picker Error:', error);
    });
  };


  const uploadVideoToStorage = async (videoPath) => {
    setLoading(true);
    const fileName = videoPath.substring(videoPath.lastIndexOf('/') + 1);
    const storageRef = storage().ref(fileName);
    try {
      await storageRef.putFile(videoPath);
      const url = await storageRef.getDownloadURL();
      console.log('Video uploaded in fireStore successfully:', url);
      return url;
    } catch (error) {
      console.log('Error uploading video:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.headerStyle}>Upload Video</Text>
        <TextInput
          style={styles.textInputStyle}
          placeholder="Enter title"
          value={title}
          onChangeText={setTitle}
        />
        <View style={styles.descriptionView}>
          <TextInput
            multiline
            style={{ fontSize: 20, height: 200, width: '100%', alignSelf: 'center' }}
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
          />
        </View>
        {selectedVideo ?
          (<TouchableOpacity
            onPress={onPressPlus}
            style={[styles.descriptionView, { justifyContent: 'center' }]}>
            <Video
              source={{ uri: selectedVideo }}
              style={{ width: '100%', height: 180, borderRadius: 8, alignSelf: 'center' }}
              controls={true}
              resizeMode="cover"
              autoplay={true}
              loop={true}
              muted={false}
            />
          </TouchableOpacity>)
          : (
            <TouchableOpacity
              onPress={onPressPlus}
              style={styles.descriptionView}>
              <Text style={{ color: 'gray', fontSize: 20, alignSelf: 'center', marginTop: 60 }}>Select video</Text>
              <Text style={{ color: 'gray', fontSize: 50, alignSelf: 'center' }}>+</Text>
            </TouchableOpacity>)
        }
        {loading ? (
          <ActivityIndicator style={{ marginTop: 50, marginVertical: 20, }} size="large" color="blue" />
        ) : (
          <TouchableOpacity
            disabled={disabled}
            style={[styles.uploadButton, { backgroundColor: disabled ? 'gray' : 'skyblue' }]}
            onPress={handleUpload}
          >
            <Text style={{ fontSize: 25, fontWeight: '600' }}>Upload</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default UploadVideoScreen;

const styles = StyleSheet.create({
  headerStyle: {
    fontSize: 30,
    marginVertical: 50,
    textAlign: 'center',
    fontWeight: '800'
  },
  textInputStyle: {
    height: 60,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 20,
    width: '90%',
    alignSelf: 'center'
  },
  descriptionView: {
    borderRadius: 8,
    height: 200,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    width: '90%',
    alignSelf: 'center',
    marginVertical: 5,
  },
  uploadButton: {
    alignSelf: 'center',
    marginVertical: 35,
    backgroundColor: 'skyblue',
    padding: 15,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 200,
  },
})