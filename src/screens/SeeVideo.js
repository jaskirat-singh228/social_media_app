import { Dimensions, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import Video from 'react-native-video';

const SeeVideo = () => {

    const navigation = useNavigation();
    const route = useRoute();
    const videoUrl = route.params?.videoUrl;
    const [rotate, setRotate] = useState(false);

    const { height, width } = Dimensions.get('window');


    const handleRotateBig = () => {
        setRotate(true)
    }
    const handleRotateSmall = () => {
        setRotate(false)
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity
                style={{ position: 'absolute', top: 65, left: 15 }}
                onPress={() => navigation.goBack()}>
                <Image style={{ tintColor: 'white', }} source={require('../assets/images/back.png')} />
            </TouchableOpacity>
            <Video
                source={{ uri: videoUrl }}
                style={{
                    height: rotate ? width : 248, width: rotate ? height : width,
                    transform: [{ rotate: rotate ? '90deg' : '0deg' }]
                }}
                controls={true}
                resizeMode={'contain'}
                autoplay={true}
            />
            {!rotate ?
                <TouchableOpacity
                    onPress={() => handleRotateBig()}
                    style={{
                        position: 'absolute',
                        right: 50,
                        top: 555
                    }}>
                    <Image source={require('../assets/images/full-screen1.png')}
                        style={{ tintColor: 'white', height: 20, width: 20 }}
                    />
                </TouchableOpacity>
                : <TouchableOpacity
                    onPress={() => handleRotateSmall()}
                    style={{
                        position: 'absolute',
                        bottom: 50,
                        left: 70
                    }}>
                    <Image source={require('../assets/images/full-screen2.png')}
                        style={{ tintColor: 'white', height: 25, width: 25 }}
                    />
                </TouchableOpacity>}
        </View>
    )
}

export default SeeVideo

const styles = StyleSheet.create({})