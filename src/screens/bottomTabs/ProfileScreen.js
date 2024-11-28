import { ActivityIndicator, Alert, Button, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore'
import ImageResizer from '@bam.tech/react-native-image-resizer';

const ProfileScreen = () => {

  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState('');
  const [userData, setUserData] = useState(null);
  const [updateImage, setUpdateImage] = useState(false);

  useEffect(() => {
    getData()
    // console.log(userData);
  }, []);

  useEffect(() => {
    const subscriber = firestore()
      .collection('Users')
      .doc(uid)
      .onSnapshot(documentSnapshot => {
        // console.log('User data >>>>>>: ', documentSnapshot.data());
        setUserData(documentSnapshot.data())
        setUpdateImage(false)
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, [uid, updateImage]);

  const handleLogOut = () => {
    setLoading(true)
    auth().signOut()
      .then(() => {
        console.log('Signed Out!');
        navigation.navigate('LoginScreen');
      })
      .catch(error => {
        Alert.alert('Error', error)
        console.error('Error:>>>>>>>', error);
      }).finally(() => {
        setLoading(false)
      })
  }

  const onPressPlus = async () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    }).then(async image => {
      console.log('Image Path:', image.path);
      // Upload image to Firebase Storage
      const downloadURL = await uploadImageToStorage(image.path);
      updateData(downloadURL);
      setUpdateImage(true)
    }).catch(error => {
      console.log("Image Picker Error:", error);
    });
  };

  const updateData = async (downloadURL) => {
    await firestore().collection('Users').doc(uid).update({
      image: downloadURL
    })
  }

  const uploadImageToStorage = async (imagePath) => {
    const fileName = imagePath.substring(imagePath.lastIndexOf('/') + 1);
    const storageRef = storage().ref(fileName);
    try {
      const resizedImage = await ImageResizer.createResizedImage(
        imagePath, //path 
        800, //width
        600, //height
        'JPEG' || 'PNG' || 'WEBP', // Compress format
        20, // "quality" (0-100)
        0, // "rotation" angle (in degrees)
        null, // optional "output" path to save the resized image
      );
      console.log('Resized Image:', resizedImage)
      await storageRef.putFile(resizedImage.uri);
      const url = await storageRef.getDownloadURL();
      console.log('Image uploaded on firebase storage successfully:', url);
      Alert.alert('Success', 'Image uploaded successfully');
      return url;
    } catch (error) {
      console.log('Error uploading image:', error);
      throw error;
    } finally {
    }
  }

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('uid');
      if (value !== null) {
        setUid(value)
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={onPressPlus}
        style={[{ alignSelf: 'center', marginTop: 50 }]}>
        {userData !== null && userData?.image !== "" || userData?.image !== null ? <Image resizeMode='cover' source={{ uri: userData?.image }}
          style={{ width: 120, height: 120, borderRadius: 400, borderColor: 'lightgray', borderWidth: 3, padding: 10 }} /> :
          <Image resizeMode='cover' source={{ uri: "https://www.exscribe.com/wp-content/uploads/2021/08/placeholder-image-person-jpg.jpg" }}
            style={{ width: 120, height: 120, borderRadius: 200, }} />
        }
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
        <Text style={{ alignSelf: 'center', fontSize: 20, fontWeight: '600', marginTop: 8 }}>User Name: </Text>
        {userData != null && <Text style={{ alignSelf: 'center', fontSize: 20, fontWeight: '600', marginTop: 8 }}>{userData.name}</Text>}
      </View>
      <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
        <Text style={{ alignSelf: 'center', fontSize: 20, fontWeight: '600', marginTop: 8 }}>User Id: </Text>
        <Text style={{ alignSelf: 'center', fontSize: 20, fontWeight: '600', marginTop: 8 }}>{uid}</Text>
      </View>
      {loading ?
        (<ActivityIndicator style={{ marginTop: 50 }} color='blue' size='large' />)
        : (<TouchableOpacity
          style={styles.logOutButton}
          onPress={() => handleLogOut()}
        >
          <Text style={{ fontSize: 25, fontWeight: '600' }}>Log Out</Text>
        </TouchableOpacity>)
      }
    </SafeAreaView>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  descriptionView: {
    borderRadius: 200,
    height: 200,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    alignSelf: 'center',
    marginVertical: 15,
    width: '48%'
  },
  logOutButton: {
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