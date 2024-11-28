import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import ImageResizer from '@bam.tech/react-native-image-resizer';

const UploadPostScreen = () => {
    const navigation = useNavigation();
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uid, setUid] = useState('');


    useEffect(() => {
        getData();
        setDisabled(!title || !description || !selectedImage);
    }, [title, description, selectedImage]);

    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem('uid');
            if (value !== null) {
                setUid(value)
            }
            // console.log('PostValue', value);
        } catch (error) {
            console.log(error);
        }
    };

    const uploadPost = async (title, description, downloadURL, uid) => {
        // Store title, description, and image URL in Firestore
        const postRef = await firestore().collection('Posts').add({
            title,
            description,
            imageUrl: downloadURL,
            authorId: uid,
            timestamp: firestore.FieldValue.serverTimestamp(),
            likesCount: 0,
            commentsCount: 0,
            sharesCount: 0,
            likes: [],
            comments: [],
            share: [],
            type: 'image'
        });
        postRef.update({ postId: postRef.id });
        try {
            setTitle('');
            setDescription('');
            setSelectedImage(null);
            Alert.alert('Success', 'Post uploaded successfully!');
            navigation.navigate('Home')
        } catch (error) {
            console.error('Error uploading post:', error);
            Alert.alert('Error', 'Failed to upload post.');
        } finally {
            setLoading(false);
        }
    }

    const handleUpload = async () => {
        if (!title || !description || !selectedImage) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        else if (uid == '') {
            Alert.alert('Error', 'Uid is undefined')
            return;
        }
        setLoading(true);
        // Upload image to Firebase Storage
        const downloadURL = await uploadImageToStorage(selectedImage);
        uploadPost(title, description, downloadURL, uid);
    };

    const onPressPlus = () => {
        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true,
        }).then(image => {
            console.log('Image Path:', image?.path);
            setSelectedImage(image?.path);
        }).catch(error => {
            console.error('Image Picker Error:', error);
        });
    };

    const uploadImageToStorage = async (imagePath) => {
        setLoading(true);
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
            console.log('Image uploaded successfully:', url);
            return url;
        } catch (error) {
            console.log('Error uploading image:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
                <Text style={styles.headerStyle}>Upload Post</Text>
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
                {selectedImage ?
                    (<TouchableOpacity
                        onPress={onPressPlus}
                        style={[styles.descriptionView, { justifyContent: 'center' }]}>
                        <Image source={{ uri: selectedImage }} style={{ width: '100%', height: 180, borderRadius: 8, alignSelf: 'center' }} />
                    </TouchableOpacity>)
                    : (
                        <TouchableOpacity
                            onPress={onPressPlus}
                            style={styles.descriptionView}>
                            <Text style={{ color: 'gray', fontSize: 20, alignSelf: 'center', marginTop: 60 }}>Select post</Text>
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

export default UploadPostScreen

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