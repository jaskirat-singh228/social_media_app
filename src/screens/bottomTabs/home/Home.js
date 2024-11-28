import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, FlatList, Image, SafeAreaView, Alert, TextInput, ScrollView } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modalize } from 'react-native-modalize';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import SeeOtherStory from './SeeOtherStory';

const Home = () => {

  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [uid, setUid] = useState('');
  const [likeStatus, setLikeStatus] = useState({});
  const [commentText, setCommentText] = useState("");
  const [postId, setPostId] = useState('');
  const [position, setPosition] = useState('');
  const [userData, setUserData] = useState([]);
  const [isMyStory, setIsMyStory] = useState(false);
  const [storyList, setStoryList] = useState([]);
  const [myStoryData, setMyStoryData] = useState([]);

  const commentsModalRef = useRef(null);
  const dotsModalRef = useRef(null)

  const openCommentModal = () => {
    commentsModalRef.current?.open();
  };

  const openDotsModal = (postId) => {
    setPostId(postId)
    dotsModalRef.current?.open();
  };

  const closeDotsModal = () => {
    dotsModalRef.current?.close();
  };

  const usersData = (uid) => {
    const subscriber = firestore()
      .collection('Users')
      .doc(uid)
      .onSnapshot(documentSnapshot => {
        // console.log('User data: ', documentSnapshot.data());
        setUserData(documentSnapshot.data())
      });
    return () => subscriber();
  }

  useEffect(() => {
    const subscriber = firestore()
      .collection('Story')
      .where('userid', '==', uid)
      .onSnapshot(querySnapshot => {
        if (!querySnapshot.empty) {
          const storyData = [];
          querySnapshot.forEach((documentSnapshot) => {
            storyData.push({
              ...documentSnapshot.data(),
              key: documentSnapshot.id,
            });
          });
          // console.log('storyList12345', JSON.stringify(storyData)) 
          setMyStoryData(storyData);
          if (storyData.length > 0) {
            setIsMyStory(true)
          } else {
            setIsMyStory(false)
          }
        } else {
          console.log('No stories found for this user');
        }
      });

    return () => subscriber();
  }, []);

  useEffect(() => {
    const subscriber = firestore()
      .collection('Story')
      .where('userid', '!=', uid)
      .onSnapshot(querySnapshot => {
        if (querySnapshot) {
          const storyData = [];
          querySnapshot.forEach((documentSnapshot, index) => {
            storyData.push({
              ...documentSnapshot.data(),
              key: documentSnapshot.id,
            });
          });
          // console.log('storyList', storyData);
          setStoryList(storyData);
        } else {
          console.log('No story found');
        }
      });

    return () => subscriber();
  }, []);

  useEffect(() => {
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
          console.log('postsData', postsData);
          setPosts(postsData);
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
        usersData(value);
      }
    } catch (error) {
      console.log(error,);
    }
  };

  const updateLikes = (postId, userId, likeStatus) => {
    const postRef = firestore().collection('Posts').doc(postId);
    try {
      if (likeStatus == "like") {
        postRef.update({
          likes: firestore.FieldValue.arrayUnion(userId),
          likesCount: firestore.FieldValue.increment(1),
        });
        setLikeStatus(prev => ({
          ...prev, [postId]: true,
        }));
        Alert.alert("Post liked")
      } else {
        postRef.update({
          likes: firestore.FieldValue.arrayRemove(userId),
          likesCount: firestore.FieldValue.increment(-1),
        });
        setLikeStatus(prev => ({
          ...prev, [postId]: false,
        }));
        Alert.alert("Post disliked")
      }

    } catch (error) {
      console.log("error   =>>>>>>", error);

    }
  }

  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="blue" />
    </View>;
  }

  //For Time And Date ago:
  const DateTime = (timestamp) => {
    // Convert the timestamp to a JavaScript Date object
    const date = new Date(timestamp?.seconds * 1000 + timestamp?.nanoseconds / 1000000);

    // Get the current time in milliseconds
    const currentTime = Date.now();

    // Calculate the time difference in milliseconds
    const timeDifference = currentTime - date.getTime();

    // Function to get the relative time in a human-readable format
    const getRelativeTime = (milliseconds) => {
      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) {
        return `Just now`;
      } else if (minutes < 60) {
        return `${minutes} minutes ago`;
      } else if (hours < 24) {
        return `${hours} hours ago`;
      } else {
        return `${days} days ago`;
      }
    };
    const relativeTime = getRelativeTime(timeDifference);

    // console.log('Time', relativeTime);
    return relativeTime.toString();
  }

  const onPressStoryPlus = async () => {
    navigation.navigate('UploadStory', { data: myStoryData[0]?.id, isMyStory: isMyStory })
  }

  const handleMyStory = async () => {
    !isMyStory ?
      navigation.navigate('UploadStory', { data: myStoryData[0]?.id, isMyStory: isMyStory })
      :
      navigation.navigate('SeeMyStory', { myStoryData: myStoryData[0] })
  }

  const handleOtherStory = () => {
    navigation.navigate('SeeOtherStory')
  }


  //Posts UI:
  const renderPost = ({ item, index }) => {
    const isLiked = likeStatus[item.postId] || false;
    return (
      <View style={{ marginBottom: 20, borderBottomColor: 'gray', borderBottomWidth: 0.2 }}>
        <View style={styles.profileiImageView}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('UserInfo')
            }}
            style={{ flexDirection: 'row', }}
          >
            <Image
              style={styles.profileiImage}
              source={{ uri: userData?.image }}
            />
            <View>
              <Text style={styles.userId}>{userData.name}</Text>
              {item?.timestamp != undefined &&
                <Text style={[styles.userId, { color: 'gray' }]}>{DateTime(item?.timestamp)}</Text>}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openDotsModal(item.postId)}
          >
            <Image style={{ height: 23, width: 23, marginTop: 6 }} source={require('../../../assets/images/dots.png')} />
          </TouchableOpacity>
        </View>
        {item?.type == 'image' ?
          <Image source={{ uri: item?.imageUrl }} style={{ height: 550 }} />
          : <Video
            source={{ uri: item?.videoUrl }}
            style={{ height: 550 }}
            controls={true}
            resizeMode="cover"
            autoplay={true}
          // loop={true}
          // muted={false}
          />
        }
        <View style={{ padding: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
              onPress={() => {
                if (uid == '') return
                if (!isLiked) {
                  updateLikes(item.postId, uid, "like");
                } else {
                  updateLikes(item.postId, uid, "dislike");
                }
              }}>
              {!isLiked ?
                <Image style={[styles.likesImage, { marginLeft: 0 }]} source={require('../../../assets/images/like-outline.png')} />
                : <Image style={[styles.likesImage, { marginLeft: 0 }]} source={require('../../../assets/images/red-heart.png')} />
              }
              <Text style={styles.likesCount}>{item.likesCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                openCommentModal(item.postId)
                setPostId(item.postId);
                setPosition(index)
              }}
              style={{ flexDirection: 'row' }}
            >
              <Image style={styles.likesImage} source={require('../../../assets/images/comment-outline.png')} />
              <Text style={styles.likesCount}>{item.commentsCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
            >
              <Image style={[styles.likesImage, { transform: [{ rotate: '20deg' }] }]} source={require('../../../assets/images/share-outline.png')} />
              <Text style={styles.likesCount}>{item.sharesCount}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{ flexDirection: 'row' }}
          >
            <Image style={{ height: 28, width: 28 }} source={require('../../../assets/images/save-outline.png')} />
          </TouchableOpacity>
        </View>
        <View style={{ marginHorizontal: 15 }}>
          <Text style={{ fontSize: 17, fontWeight: '600' }}>{item.title}</Text>
          <Text style={{ fontSize: 17, marginVertical: 2 }} numberOfLines={1}>{item.description}</Text>
          <TouchableOpacity>
            <Text style={{ fontSize: 17, color: 'gray', marginBottom: 20 }}>View all comments </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  //For Comments:
  const sendMessage = (uid, postId, dateTime, commentId) => {
    if (commentText == "") {
      Alert.alert("Enter your comment first.")
    }
    else {
      const postRef = firestore().collection('Posts').doc(postId);
      const obj = {
        uid: uid,
        commentId: commentId,
        datetime: dateTime,
        message: commentText,
        username: userData != undefined ? userData?.name : "",
        userimage: userData != undefined ? userData?.image : "",
        subcomments: []
      }
      try {
        postRef.update({
          comments: firestore.FieldValue.arrayUnion(obj),
          commentsCount: firestore.FieldValue.increment(1),
        });
        setCommentText("")
      } catch (error) {
        console.log(error, "<==========error");

      }
    }
  }

  //Comments UI:
  const renderComments = (item, index) => {
    return (
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <Image style={{ height: 45, width: 45, borderRadius: 200, backgroundColor: 'red' }} source={{ uri: item?.item?.userimage }} />
          <View style={{ marginLeft: 10, flex: 1, }}>
            <View style={{ flexDirection: 'row', }}>
              <Text style={{ fontSize: 15 }}>{item?.item?.username}</Text>
              <Text style={{ fontSize: 15, color: 'gray', marginLeft: 10 }}>
                {DateTime(item?.item?.datetime)}
              </Text>
            </View>

            <Text numberOfLines={1} style={{ fontSize: 15, }}>{item?.item?.message}</Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 15, color: 'gray', marginVertical: 3 }}>Reply</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Image style={{ height: 20, width: 20, alignSelf: 'center', }} source={require('../../../assets/images/like-outline.png')} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  //For Delete Posts:
  const handleDeletePost = async (postId) => {
    console.log(postId, 'jaskirat');
    if (!postId) {
      Alert.alert('Error', ' postId not availible.');
      return;
    }

    setLoading(true)
    try {
      await firestore().collection('Posts').doc(postId).delete();
      console.log('Post Deleted');
      Alert.alert('Post Deleted', 'The Post Deleted successfully.');
    } catch (error) {
      console.error("Error deleting post: ", error);
      Alert.alert('Error', 'Failed to delete the post.');
    }
    setLoading(false);
    closeDotsModal()
  }

  const storyHeaderComponent = () => {
    return (
      <View style={{ flexDirection: 'row', }}>
        <TouchableOpacity
          onPress={() => handleMyStory()}
        >
          <View
            style={[styles.myStoryView, isMyStory ? { borderWidth: 2, borderColor: 'red', } : null]}
          >
            <Image
              style={{ height: 70, width: 70, borderRadius: 200, borderWidth: 0.2, borderColor: 'rgba(0,0,0,0.2)' }}
              source={{ uri: userData?.image }}
            />
          </View>
          <TouchableOpacity
            onPress={onPressStoryPlus}
            style={styles.addStoryImagseView}
          >
            <Image
              source={require('../../../assets/images/addStory-plus.png')}
              style={{ height: 28, width: 28 }}
            />
          </TouchableOpacity>
          <Text style={{ alignSelf: 'center', color: 'gray', fontWeight: '500', marginLeft: 15 }}>Your story</Text>
        </TouchableOpacity>

      </View>
    )
  }
  const storyRender = ({ item, index }) => {
    return (
      <View style={{ flexDirection: 'row', }}>
        <TouchableOpacity
          onPress={() => handleOtherStory()}
        >
          <View style={[styles.myStoryView, { borderWidth: 2, borderColor: 'red' }]}>
            <Image
              style={{ height: 70, width: 70, borderRadius: 200, borderWidth: 0.2, borderColor: 'rgba(0,0,0,0.2)' }}
              source={{ uri: item?.userimage }}
            />
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', }}>
      <ScrollView>
        <View style={styles.storyMainView}>
          <Text style={{ fontSize: 25, fontWeight: '700' }}>Social Media</Text>
          <View style={{ flexDirection: 'row', }}>
            <Image source={require('../../../assets/images/like-outline.png')} />
            <Image style={{ marginLeft: 30, transform: [{ rotate: '20deg' }] }} source={require('../../../assets/images/share-outline.png')} />
          </View>
        </View>

        <FlatList
          showsHorizontalScrollIndicator={false}
          data={storyList}
          horizontal
          ListHeaderComponent={storyHeaderComponent}
          renderItem={storyRender}
        />

        <FlatList
          data={posts}
          renderItem={(item, index) => renderPost(item, index)}
          keyExtractor={item => item.key}

        />
      </ScrollView>
      {/* Comments Modal : */}
      <Modalize
        ref={commentsModalRef}
        snapPoint={700}
        modalHeight={700}
        handlePosition='inside'
        modalStyle={styles.modlizeStyle}
        handleStyle={styles.indicatorStyle}
      >
        <View style={styles.headerStyle}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 35, alignSelf: 'center', }}>Comments</Text>
        </View>
        <FlatList
          data={posts[position]?.comments}
          style={{ height: 460 }}
          showsVerticalScrollIndicator={true}
          renderItem={(item, index) => renderComments(item, index)}
          keyExtractor={item => item.commentId}
        />
        <View style={styles.modalTextInputView}>
          <TextInput
            style={{ fontSize: 20, width: '90%', height: 50, alignSelf: 'flex-end' }}
            placeholder='Message'
            value={commentText}
            onChangeText={(text) => setCommentText(text)}
            multiline
          />
          <TouchableOpacity
            onPress={() => {
              const commentId = firestore().collection('Posts').doc().id;
              const dateTime = new Date();
              console.log("comment userId =>", uid);
              console.log('Time =>', dateTime);
              console.log('commentId =>', commentId);
              console.log('Message =>', commentText);

              sendMessage(uid, postId, dateTime, commentId)
            }}
          >
            <Image style={{ marginTop: 3 }} source={require('../../../assets/images/share-outline.png')} />
          </TouchableOpacity>
        </View>
      </Modalize>

      {/* Dots Modal: */}
      <Modalize
        ref={dotsModalRef}
        snapPoint={300}
        modalHeight={300}
        handlePosition='inside'
        modalStyle={styles.modlizeStyle}
        handleStyle={styles.indicatorStyle}
      >
        {loading ?
          (<ActivityIndicator size="large" color="blue" />)
          : (<TouchableOpacity
            onPress={() => {
              // console.log(postId,'<<<<<<<<<<<<<<<postId');              
              handleDeletePost(postId);
            }}
            style={styles.deleteButton}>
            <Text style={{ fontSize: 20, color: 'white', fontWeight: '600' }}>Delete Post</Text>
          </TouchableOpacity>)
        }
      </Modalize>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  profileiImageView: {
    flexDirection: 'row',
    marginHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  profileiImage: {
    height: 40,
    width: 40,
    borderRadius: 200,
    borderWidth: 0.5
  },
  userId: {
    fontSize: 18,
    marginLeft: 12,
    fontWeight: '600'
  },
  likesCount: {
    fontSize: 18,
    marginHorizontal: 10,
    fontWeight: '500'
  },
  likesImage: {
    height: 25,
    width: 25,
    marginLeft: 5
  },
  modlizeStyle: {
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    backgroundColor: 'white'
  },
  indicatorStyle: {
    alignSelf: 'center',
    top: 12,
    width: 45,
    height: 5,
  },
  headerStyle: {
    height: 70,
    width: '100%',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'gray',
    padding: 5,
  },
  modalTextInputView: {
    flexDirection: 'row',
    width: '100%',
    borderTopColor: 'gray',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    padding: 12,
  },
  deleteButton: {
    alignSelf: 'center',
    marginTop: 90,
    backgroundColor: 'red',
    height: 50,
    padding: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8
  },
  storyMainView: {
    height: 40,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15
  },
  myStoryView: {
    height: 82,
    width: 82,
    borderRadius: 200,
    marginTop: 8,
    marginBottom: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10
  },
  addStoryImagseView: {
    position: 'absolute',
    marginTop: 50,
    marginLeft: 65,
    borderRadius: 200,
    borderWidth: 2,
    borderColor: 'white'
  }
});
