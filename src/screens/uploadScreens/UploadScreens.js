import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import UploadPostScreen from './UploadPostScreen';
import UploadVideoScreen from './UploadVideoScreen';

const Tab = createMaterialTopTabNavigator();

const UploadScreens = () => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <Tab.Navigator>
                <Tab.Screen name="Upload Post" component={UploadPostScreen} />
                <Tab.Screen name="Upload Video" component={UploadVideoScreen} />
            </Tab.Navigator>
        </SafeAreaView>
    )
}

export default UploadScreens

const styles = StyleSheet.create({})