import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, FlatList, Image, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import firestore from '@react-native-firebase/firestore';

const SearchScreen = () => {

  const [usersData, setUsersData] = useState([]);
  const [text, setText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState({});
  const [followedUsers, setFollowedUsers] = useState({});

  useEffect(() => {
    const subscriber = firestore()
      .collection('Users')
      .onSnapshot(querySnapshot => {
        const users = [];
        querySnapshot.forEach(documentSnapshot => {
          users.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });
        setUsersData(users);
        setFilteredUsers(users);
      });

    return () => subscriber();
  }, []);

  const handleSearch = (text) => {
    setText(text);
    if (text == '') {
      setFilteredUsers(usersData);
    } else {
      const filteredUser = usersData.filter(user =>
        user.name.toLowerCase().includes(text.toLowerCase())
        // || user.email.toLowerCase().includes(text.toLowerCase()) 
      );
      setFilteredUsers(filteredUser);
    }
  };

  const handleFollow = (name) => {
    setFollowedUsers(prevState => ({
      ...prevState, [name]: !prevState[name],
    }));
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.searchBarView}>
        <Image
          style={{ height: 21, width: 21, marginLeft: 10, tintColor: 'gray' }}
          source={require('../../assets/images/search.png')} />
        <TextInput
          placeholder='Search'
          placeholderTextColor={'gray'}
          onChangeText={handleSearch}
          value={text}
          style={{ height: '100%', borderRadius: 10, fontSize: 20, width: '90%', marginLeft: 15 }}
        />
      </View>
      <FlatList
        data={filteredUsers}
        renderItem={({ item }) => {
          const isFollowed = followedUsers[item.name] || false;
          return (
            <View style={styles.viewStyle}>
              <View style={{ flex: 0.15 }}>
                {item.image ?
                  <Image style={{ height: 50, width: 50, borderRadius: 200 }} source={{ uri: item.image }} />
                  : <Image resizeMode='contain' source={{ uri: "https://www.exscribe.com/wp-content/uploads/2021/08/placeholder-image-person-jpg.jpg" }}
                    style={{ height: 50, width: 50, borderRadius: 200, borderWidth: 1, borderColor: 'gray' }} />
                }
              </View>
              <View style={{ flex: 0.9, flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={styles.textStyle}>Name: {item.name}</Text>
                  <Text numberOfLines={1} style={styles.textStyle}>Email: {item.email}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleFollow(item.name)}
                  style={[styles.followButton, isFollowed ? { backgroundColor: 'lightgray' } : null]}>
                  <Text style={{ fontSize: 20, fontWeight: '600' }}>{!isFollowed ? 'Follow' : 'Unfollow'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      />
    </SafeAreaView>

  )
}

export default SearchScreen;

const styles = StyleSheet.create({
  buttonStyle: {
    height: 40,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5
  },
  buttonTextStyle: {
    fontSize: 16,
    fontWeight: '700',
  },
  viewStyle: {
    width: '95%',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 0.3,
    borderBottomColor: 'gray'
  },
  textStyle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 3
  },
  sendNotificationStyle: {
    flex: 0.25,
    backgroundColor: 'skyblue',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 5,
    borderColor: 'green',
    borderWidth: 1,
  },
  searchBarView: {
    height: 45,
    borderRadius: 10,
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 10,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: 'lightgray',
    flexDirection: 'row',
    alignItems: 'center',
  },
  followButton: {
    backgroundColor: 'lightblue',
    alignSelf: 'center',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginLeft: 10,
    alignItems: 'center'
  }
})