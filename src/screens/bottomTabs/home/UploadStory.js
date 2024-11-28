// In Screen B
import { StyleSheet, Text, TouchableOpacity, SafeAreaView, Alert, Image, ActivityIndicator, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateExpiryDate } from '../../../utills/Global';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import ImageResizer from '@bam.tech/react-native-image-resizer';

const UploadStory = () => {

    const navigation = useNavigation();

    const route = useRoute();
    const id = route.params?.data;
    const isStory = route.params?.isMyStory;

    const [uid, setUid] = useState('');
    const [selectedStory, setSelectedStory] = useState(null);
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getUid();
        // console.log(createResizedImage, 'createResizedImage');
    }, [])


    const getUid = async () => {
        try {
            const value = await AsyncStorage.getItem('uid');
            if (value !== null) {
                setUid(value)
                usersData(value);
            }
        } catch (error) {
            console.log(error, 'uid ERROR');
        }
    };

    const usersData = (uid) => {
        const subscriber = firestore()
            .collection('Users')
            .doc(uid)
            .onSnapshot(documentSnapshot => {
                setUserData(documentSnapshot.data())
            });
        return () => subscriber();
    }

    const updateStoryArray = async (downloadURL, id, type, duration) => {
        setLoading(true)
        try {
            const storyRef = firestore().collection('Story').doc(id);
            const storyId = firestore().collection('Story').doc().id;
            const storyObj = {
                storyId: storyId, // You can generate a unique ID or use the one from Firestore
                storyUrl: downloadURL,
                sendTime: new Date(),
                expireTime: calculateExpiryDate(new Date(), 24), // Set actual expiry time
                storyType: type.includes('video') ? 'video' : 'image',
                duration: duration
            };

            // Step 3: Add the story object to the story array using arrayUnion
            await storyRef.update({
                story: firestore.FieldValue.arrayUnion(storyObj),
            });
            navigation.goBack();
            Alert.alert('Success', 'Story uploaded successfully!');
        } catch (error) {
            console.error('Error uploading story:', error);
            Alert.alert('Error', 'Failed to upload story.');
        }
        setLoading(false);
    }

    const uploadStory = async (downloadURL, uid, type) => {
        setLoading(true)
        try {
            // Step 1: Add a new document
            const storyRef = await firestore().collection('Story').add({
                userid: uid,
                username: userData.name,
                userimage: userData.image,
                story: [],
            });

            const storyId = firestore().collection('Story').doc().id;
            const storyObj = {
                storyId: storyId, // You can generate a unique ID or use the one from Firestore
                storyUrl: downloadURL,
                sendTime: new Date(),
                expireTime: calculateExpiryDate(new Date(), 24), // Set actual expiry time
                storyType: type.includes('video') ? 'video' : 'image',
            };

            // Step 3: Add the story object to the story array using arrayUnion
            await storyRef.update({
                id: storyRef.id,
                story: firestore.FieldValue.arrayUnion(storyObj),
            });
            Alert.alert('Success', 'Story uploaded successfully!');
            navigation.goBack();
            setLoading(false)
        } catch (error) {
            console.error('Error uploading story:', error);
            Alert.alert('Error', 'Failed to upload story.');
        }
        setLoading(false)
    }

    const uploadStoryToStorage = async (storyPath) => {
        const fileName = storyPath.substring(storyPath.lastIndexOf('/') + 1);
        const storageRef = storage().ref(fileName);
        setLoading(true)
        try {
            const resizedImage = await ImageResizer.createResizedImage(
                storyPath, //path 
                800, //width
                600, //height
                'JPEG' || 'PNG' || 'WEBP', // Compress format
                20, // "quality" (0-100)
                0, // "rotation" angle (in degrees)
                null, // optional "output" path to save the resized image
            );
            console.log('Resized Image:', resizedImage)
            // Upload resized image to Firebase Storage
            await storageRef.putFile(resizedImage.uri);
            const url = await storageRef.getDownloadURL();
            console.log('Story uploaded to firebase successfully!:', url);
            return url;
        } catch (error) {
            console.log('Error uploading image:', error);
        }
        setLoading(false)
    }


    const handleUploadStory = async () => {
        if (uid === '') {
            Alert.alert('Error', 'Uid is undefined');
            return;
        }
        try {
            const selectedStory = await ImagePicker.openPicker({ mediaType: 'any' });
            console.log('Story:', selectedStory);
            console.log('Story Path:', selectedStory.path);

            // Check for video duration:
            if (selectedStory.mime.includes('video')) {
                console.log('Story Duration:', selectedStory.duration);
            }

            // Upload story to Firebase Storage
            const downloadURL = await uploadStoryToStorage(selectedStory.path);
            if (!downloadURL) {
                Alert.alert('Error', 'Failed to upload story.');
                return;
            }

            setSelectedStory(selectedStory.path);

            if (!isStory) {
                await uploadStory(downloadURL, uid, selectedStory.mime);
            } else {
                await updateStoryArray(downloadURL, id, selectedStory.mime, selectedStory.duration);
            }
        } catch (error) {
            console.log("Story Picker Error:", error);
        }
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={require('../../../assets/images/back.png')}
                    style={{ marginLeft: 15 }}
                />
            </TouchableOpacity>
            <View style={{ flex: 1, justifyContent: 'center' }}>
                {loading ?
                    <ActivityIndicator style={[styles.uploadStory, { backgroundColor: 'white', borderWidth: 0 }]} size='large' color='blue' />
                    : <TouchableOpacity
                        onPress={() => handleUploadStory()}
                        style={styles.uploadStory}
                    >
                        <Text style={{ fontSize: 20, fontWeight: '600', }}>Upload Story</Text>
                    </TouchableOpacity>
                }
            </View>
        </SafeAreaView>
    );
};

export default UploadStory;

const styles = StyleSheet.create({
    uploadStory: {
        height: 60,
        width: '50%',
        backgroundColor: 'skyblue',
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    }
})