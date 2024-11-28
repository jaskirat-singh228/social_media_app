import { Image, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import UsersScreen from '../SearchScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../ProfileScreen';
import UploadScreen from '../../uploadScreens/UploadScreens';
import Home from './Home';
import Reels from '../Reels';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';


const Tab = createBottomTabNavigator();

const HomeScreen = () => {
  const [userData, setUserData] = useState();

  useEffect(() => {
    getData();
  }, [])

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

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('uid');
      if (value !== null) {
        usersData(value);
      }
    } catch (error) {
      console.log(error,);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          height: 90,
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) =>
            focused ?
              <Image
                style={{ tintColor: focused ? 'black' : 'gray', height: 32, width: 37 }}
                source={require('../../../assets/images/filled-home.png')} /> :
              <Image
                style={{ tintColor: focused ? 'black' : 'gray', height: 32, width: 30 }}
                source={require('../../../assets/images/home.png')} />
        }} />
      <Tab.Screen
        name="UsersScreen"
        component={UsersScreen}
        options={{
          tabBarIcon: ({ focused }) =>
              <Image
                style={[styles.imageStyle, { tintColor: focused ? 'black' : 'gray', height: 30, width: 30 }]}
                source={require('../../../assets/images/search.png')} />
        }} />
      <Tab.Screen
        name="UploadScreen"
        component={UploadScreen}
        options={{
          tabBarIcon: ({ focused }) =>
              <Image
                style={[styles.imageStyle, { tintColor: focused ? 'black' : 'gray', height: 30, width: 30 }]}
                source={require('../../../assets/images/upload.png')} />
        }} />
      <Tab.Screen
        name="Reels"
        component={Reels}
        options={{
          tabBarIcon: ({ focused }) =>
            focused ?
              <Image
                style={[styles.imageStyle, { tintColor: focused ? 'black' : 'gray' }]}
                source={require('../../../assets/images/filled-reels.png')} /> :
              <Image
                style={[styles.imageStyle, { tintColor: focused ? 'black' : 'gray' }]}
                source={require('../../../assets/images/reels.png')} />,
        }} />
      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            focused ? <Image
              style={[styles.imageStyle, { borderRadius: 200, borderWidth: 3, borderColor: 'black' }]}
              source={{ uri: userData?.image }} /> :
              <Image
                style={[styles.imageStyle, { borderRadius: 200 }]}
                source={{ uri: userData?.image }}
              />
        }} />
    </Tab.Navigator>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  imageStyle: {
    height: 35,
    width: 35
  }
})