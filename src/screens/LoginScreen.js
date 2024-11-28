import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, SafeAreaView, Image, ActivityIndicator, Alert } from 'react-native';

const LoginScreen = () => {

    const navigation = useNavigation();
    const [email, setEmail] = useState('xyz@gmail.com');
    const [password, setPassword] = useState('xyz123!@#');
    const [loading, setLoading] = useState(false);

    const storeData = async (value) => {
        try {
            await AsyncStorage.setItem('uid', value);
        } catch (error) {
            console.log(error);
        }
    };

    const handleLogin = () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        auth().signInWithEmailAndPassword(email, password)
            .then((res) => {
                console.log('Signed in successfully!');
                storeData(res.user.uid)
                // console.log(JSON.stringify('uid', res.user.uid));
                navigation.navigate('HomeScreen');
            })
            .catch(error => {
                setLoading(false);
                if (error.code === 'auth/user-not-found') {
                    Alert.alert('Error', 'No user found with this email.');
                } else if (error.code === 'auth/wrong-password') {
                    Alert.alert('Error', 'Incorrect password.');
                } else if (error.code === 'auth/invalid-email') {
                    Alert.alert('Error', 'Invalid email address.');
                } else {
                    Alert.alert('Error', error.message);
                    console.log('Error', error.message);

                }
            })
            .finally(() => {
                setEmail('');
                setPassword('');
                setLoading(false);
            });
    }

    // Inside your component, add this in a useEffect to configure Google Sign-In
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: 'YOUR_WEB_CLIENT_ID', // From Firebase console
            offlineAccess: false,
        });
    }, []);

    // Handle Google Login
    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            await GoogleSignin.hasPlayServices();
            const { idToken } = await GoogleSignin.signIn();

            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            // Sign-in the user with the credential
            const userCredential = await auth().signInWithCredential(googleCredential);
            console.log('User signed in with Google:', userCredential.user);
            navigation.navigate('HomeScreen');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.container}>
                <Text style={styles.title}>Login</Text>
                <Text style={{ marginLeft: 22, marginVertical: 8, fontSize: 18 }}>Email</Text>
                <TextInput
                    style={styles.textInputStyle}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="Enter email"
                    autoCapitalize="none"
                />
                <Text style={{ marginLeft: 22, marginVertical: 8, fontSize: 18 }}>Password</Text>
                <TextInput
                    style={styles.textInputStyle}
                    placeholder="Enter password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <View style={{ alignSelf: 'flex-end', marginRight: 18 }}>
                    <Button onPress={() => navigation.navigate('ForgetPassword')} title='Forget password?' />
                </View>
                {loading ? (
                    <ActivityIndicator style={{ marginTop: 50, marginVertical: 20, }} size="large" color="blue" />
                ) : (
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                    >
                        <Text style={{ fontSize: 25, fontWeight: '600' }}>Login</Text>
                    </TouchableOpacity>
                )}
                <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                    <Text style={{ fontSize: 18 }}>Don't have an account?</Text>
                    <Text
                        onPress={() => navigation.navigate('RegisterScreen')}
                        style={{ fontSize: 18, color: 'blue' }}> Register</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <View style={{ height: 1, backgroundColor: 'gray', width: '35%', margin: 22, marginVertical: 50, borderRadius: 20 }} />
                    <Text style={{ fontSize: 13, color: 'gray', alignSelf: 'center' }}>OR</Text>
                    <View style={{ height: 1, backgroundColor: 'gray', width: '35%', margin: 22, marginVertical: 50, borderRadius: 20 }} />
                </View>
                <TouchableOpacity
                    onPress={handleGoogleLogin}
                    style={[styles.loginButton, { marginTop: 0, flexDirection: 'row' }]}>
                    <Image
                        style={{ height: 40, width: 40, marginRight: 5, alignSelf: 'center' }}
                        source={require('../assets/images/google.png')} />
                    <Text style={{ fontSize: 25, fontWeight: '600' }}>Login with google</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 30,
        marginVertical: 70,
        textAlign: 'center',
        fontWeight: '800'
    },
    textInputStyle: {
        height: 60,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 8,
        fontSize: 20,
        width: '90%',
        alignSelf: 'center'
    },
    loginButton: {
        alignSelf: 'center',
        marginVertical: 20,
        backgroundColor: 'skyblue',
        padding: 15,
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 200,
        marginTop: 50
    }
});

export default LoginScreen;
