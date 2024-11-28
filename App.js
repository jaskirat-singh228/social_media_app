import 'react-native-gesture-handler';
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import SplashScreen from './src/screens/SplashScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgetPassword from './src/screens/ForgetPassword';
import HomeScreen from './src/screens/bottomTabs/home/HomeScreen';
import ProfileScreen from './src/screens/bottomTabs/ProfileScreen';
import UploadStory from './src/screens/bottomTabs/home/UploadStory';
import SearchScreen from './src/screens/bottomTabs/SearchScreen';
import SeeMyStory from './src/screens/bottomTabs/home/SeeMyStory';
import SeeOtherStory from './src/screens/bottomTabs/home/SeeOtherStory';
import UserInfo from './src/screens/UserInfo';
import SeeVideo from './src/screens/SeeVideo';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="UserInfo" component={UserInfo} />
        <Stack.Screen name="UploadStory" component={UploadStory} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
        <Stack.Screen name="SeeMyStory" component={SeeMyStory} />
        <Stack.Screen name="SeeOtherStory" component={SeeOtherStory} />
        <Stack.Screen name="SeeVideo" component={SeeVideo} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({})