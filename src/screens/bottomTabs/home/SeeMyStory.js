import { Animated, Dimensions, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import Video from 'react-native-video';
import { baseGestureHandlerProps } from 'react-native-gesture-handler/lib/typescript/handlers/gestureHandlerCommon';

const { height, width } = Dimensions.get('window');

const SeeMyStory = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const myStoryData = route.params?.myStoryData;
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true); // State to track loading status

    // Create an array of Animated.Values, one for each story item
    const progress = useRef(myStoryData?.story.map(() => new Animated.Value(0))).current;

    const storyTimout = () => {
        if (myStoryData?.story[current]?.storyType === 'video') {
            console.log(myStoryData?.story[current]?.duration, '<<<<<<<<<< DURATION');
            return myStoryData?.story[current]?.duration;

        } else {
            return 5000;
        }
    };

    // useEffect(() => {
    //     if (!loading) {
    //         start(); 
    //     } 
    // }, [current, loading]); 


    const start = () => {
        // console.log('start loading');
        Animated.timing(progress[current], {
            toValue: 1,
            duration: storyTimout(),
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                if (current < myStoryData?.story?.length - 1) {
                    setCurrent(current + 1);
                } else {
                    navigation.navigate('Home');
                }
            }
        });
    };

    const handleStoryChange = (story) => {
        if (story === 'next') {
            if (current < myStoryData?.story?.length - 1) {
                setCurrent(current + 1);
            } else {
                navigation.navigate('Home');
            }
        } else if (story === 'prev' && current > 0) {
            setCurrent(current - 1);
        }
    };

    const handleImageLoad = () => {
        setLoading(false);
        start();
    };

    const handleImageError = () => {
        setLoading(false);
        if (myStoryData?.story[current]?.storyType === 'image') {
            console.log('Error loading image.');
        } else {
            console.log('Error loading video.');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
            {myStoryData?.story[current]?.storyType === 'image' ? (
                // Show loader while the image is loading
                <>
                    {loading && (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="white" />
                        </View>
                    )}
                    <Image
                        source={{ uri: myStoryData?.story[current]?.storyUrl }}
                        resizeMode="cover"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        style={{ height: 800, width: width, backgroundColor: 'black' }}
                    />
                </>
            ) :

                <>
                    {loading && (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="white" />
                        </View>
                    )}
                    <Video
                        source={{ uri: myStoryData?.story[current]?.storyUrl }}
                        style={{ height: 800, width: width }}
                        controls={false}
                        resizeMode="cover"
                        autoplay={true}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                    />

                </>

            }
            <View style={{ marginHorizontal: 15, flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                    placeholder="Message"
                    placeholderTextColor="white"
                    style={{
                        height: 60,
                        width: '70%',
                        borderWidth: 1,
                        borderRadius: 30,
                        padding: 20,
                        fontSize: 17,
                        borderColor: 'gray',
                    }}
                />
                <TouchableOpacity>
                    <Image
                        source={require('../../../assets/images/like-outline.png')}
                        style={{ marginHorizontal: 20, height: 30, width: 30, tintColor: 'white' }}
                    />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Image
                        source={require('../../../assets/images/share-outline.png')}
                        style={{ height: 30, width: 30, tintColor: 'white', transform: [{ rotate: '20deg' }] }}
                    />
                </TouchableOpacity>
            </View>

            {/* Left and Right Buttons for navigation */}
            <View
                style={{
                    flexDirection: 'row',
                    height: height,
                    width: width,
                    position: 'absolute',
                    top: 0,
                    justifyContent: 'space-between',
                }}
            >
                <TouchableOpacity
                    style={{ height: height, width: width / 2 }}
                    onPress={() => handleStoryChange('prev')}
                />
                <TouchableOpacity
                    style={{ height: height, width: width / 2 }}
                    onPress={() => handleStoryChange('next')}
                />
            </View>

            {/* Story Progress Indicators */}
            <View style={styles.indicatorContainer}>
                {myStoryData?.story.map((item, index) => {
                    const indicatorProgress = progress[index];
                    return (
                        <View key={index} style={styles.inactiveIndicator}>
                            <Animated.View
                                style={[
                                    styles.activeIndicator,
                                    {
                                        width: indicatorProgress.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0%', '100%'],
                                        }),
                                    },
                                ]}
                            />
                        </View>
                    );
                })}
                <View style={{ flexDirection: 'row', marginHorizontal: 15, position: 'absolute', top: 15, flex: 1, width: width }}>
                    <View style={{ flexDirection: 'row', flex: 0.88 }}>
                        <Image
                            source={{ uri: myStoryData?.userimage }}
                            style={{ height: 40, width: 40, borderRadius: 200 }}
                        />
                        <Text style={[styles.userName, { color: 'white', fontWeight: '700' }]}>{myStoryData?.username}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ alignSelf: 'center', flex: 0.12, justifyContent: 'flex-end' }}>
                        <Image source={require('../../../assets/images/cancel.png')}
                            style={{ tintColor: 'white', height: 20, width: 20 }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default SeeMyStory;

const styles = StyleSheet.create({
    indicatorContainer: {
        position: 'absolute',
        top: 55,
        flexDirection: 'row',
        alignSelf: 'center',
    },
    inactiveIndicator: {
        flex: 1,
        marginHorizontal: 2,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
    },
    activeIndicator: {
        height: 3,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,1)',
    },
    userName: {
        marginLeft: 14,
        alignSelf: 'center',
        color: 'gray',
        fontSize: 18,
    },
    loaderContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
    },
});
