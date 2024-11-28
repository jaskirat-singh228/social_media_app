import { ActivityIndicator, Alert, Button, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore'
import Video from 'react-native-video';

const UserInfo = () => {

    const navigation = useNavigation();

    const [uid, setUid] = useState('');
    const [userData, setUserData] = useState(null);
    const [postsData, setPostsData] = useState(null);
    const [loading, setLoading] = useState(null);



    const UsersData = (uid) => {
        const subscriber = firestore()
            .collection('Users')
            .doc(uid)
            .onSnapshot(documentSnapshot => {
                // console.log('User data:>>>>>>>> ', documentSnapshot.data());
                setUserData(documentSnapshot.data())
            });
        return () => subscriber();
    }

    useEffect(() => {
        setLoading(true);
        getData();
        const subscriber = firestore()
            .collection('Posts')
            .orderBy('timestamp', 'desc')
            .onSnapshot(querySnapshot => {
                if (querySnapshot) {
                    const postsData = [];
                    querySnapshot.forEach(documentSnapshot => {
                        postsData.push({
                            ...documentSnapshot.data(),
                            key: documentSnapshot.id,
                        });
                    });
                    //   console.log(postsData,'yjtghfvghj');
                    setPostsData(postsData);
                } else {
                    console.log('No posts found');
                }
                setLoading(false);
            });

        return () => subscriber();
    }, []);

    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem('uid');
            if (value !== null) {
                setUid(value)
                UsersData(value);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handlePlay = (videoUrl) => {
        navigation.navigate('SeeVideo', { videoUrl: videoUrl })
    }

    const renderPosts = (item) => {
        return (
            <View>
                {item.type == 'image' ?
                    (<Image
                        style={{ height: 146, width: 146.5, borderWidth: 1, borderColor: 'white' }}
                        source={{ uri: item.imageUrl }} />)
                    : (<TouchableOpacity onPress={() => handlePlay(item.videoUrl)}>
                        <Video
                            source={{ uri: item.videoUrl }}
                            style={{ height: 146, width: 146.5, borderWidth: 1, borderColor: 'white' }}
                            resizeMode="cover"
                            paused={true}
                        />
                        <Image source={require('../assets/images/play.png')}
                            style={{ position: 'absolute', alignSelf: 'center', tintColor: 'lightgray', position: 'absolute', alignSelf: 'center', top: 55, }}
                        />
                    </TouchableOpacity>)}
            </View>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image style={{ marginLeft: 15, marginTop: 4 }} source={require('../assets/images/back-button.png')} />
            </TouchableOpacity>
            <View
                style={[{ alignSelf: 'center', marginTop: 50 }]}>
                {userData !== undefined &&
                    <Image
                        source={{ uri: userData?.image }}
                        resizeMode='cover'
                        style={{ width: 120, height: 120, borderRadius: 400, borderColor: 'lightgray', borderWidth: 3, padding: 10 }}
                    />}
            </View>
            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                {userData !== undefined && <Text style={{ alignSelf: 'center', fontSize: 20, fontWeight: '600', marginTop: 10 }}>{userData?.name}</Text>}
            </View>
            <TouchableOpacity
                style={styles.messageButton}
            >
                <Text style={{ fontSize: 25, fontWeight: '600' }}>Message</Text>
            </TouchableOpacity>
            <FlatList
                data={postsData}
                numColumns={3}
                renderItem={({ item }) => renderPosts(item)}
            />
        </SafeAreaView>
    )
}

export default UserInfo

const styles = StyleSheet.create({
    messageButton: {
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