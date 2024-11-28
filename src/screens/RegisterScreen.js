import { View, TextInput, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {

    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        setDisabled(!name || !email || !password || !phone);
    }, [name, email, password, phone]);


    const handleRegister = async () => {
        setLoading(true);
        try {
            // Create user with email and password
            const userCredential = await auth().createUserWithEmailAndPassword(email, password);
            const userId = userCredential.user.uid;


            await firestore().collection('Users')
                .doc(userId).set({
                    name,
                    email,
                    password,
                    phone,
                    image:""
                });

            navigation.navigate('HomeScreen');
            console.log('User stored successfully!');
        } catch (error) {
            Alert.alert('Error creating user:', error)
            console.error('Error creating user:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1,}}>
            <Text style={styles.title}>Sign Up</Text>
            <TextInput
                style={styles.textInputStyle}
                placeholder="Enter name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.textInputStyle}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.textInputStyle}
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.textInputStyle}
                placeholder="Enter phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />
            {loading ? (
                <ActivityIndicator style={{ marginTop: 50, marginVertical: 20, }} size="large" color="blue" />
            ) : (
                <TouchableOpacity
                    disabled={disabled}
                    style={[styles.registerButton, { backgroundColor: disabled ? 'gray' : 'skyblue' }]}
                    onPress={handleRegister}
                >
                    <Text style={{ fontSize: 25, fontWeight: '600' }}>Register</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 30,
        marginVertical: 130,
        textAlign: 'center',
        fontWeight: '800',
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
        alignSelf: 'center',
    },
    registerButton: {
        alignSelf: 'center',
        marginVertical: 20,
        backgroundColor: 'skyblue',
        padding: 15,
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 200,
        marginTop: 50,
    },
});

export default RegisterScreen;
