import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Image,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { initDatabase, registerUser, loginUser } from './utils/database'; // Ensure this file exists and works correctly.

export default function App() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [address, setAddress] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [userProfile, setUserProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        initDatabase();
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const status = await AsyncStorage.getItem('isLoggedIn');
            if (status === 'true') {
                setIsLoggedIn(true);
                fetchUserProfile();
            }
        } catch (error) {
            console.error('Error checking login status:', error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const profile = await AsyncStorage.getItem('userProfile');
            if (profile) {
                setUserProfile(JSON.parse(profile));
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);

    const handleSubmit = async () => {
        if (!username || !password || (!isLogin && (!firstName || !lastName || !email || !contactNumber || !address))) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (!isLogin && !isValidEmail(email)) {
            Alert.alert('Error', 'Invalid email address');
            return;
        }
        if (!isLogin && !isValidPhone(contactNumber)) {
            Alert.alert('Error', 'Invalid phone number');
            return;
        }

        try {
            if (isLogin) {
                const success = await loginUser(username, password);
                if (success) {
                    await AsyncStorage.setItem('isLoggedIn', 'true');
                    setIsLoggedIn(true);
                    fetchUserProfile();
                    Alert.alert('Success', 'Logged in successfully');
                } else {
                    Alert.alert('Error', 'Invalid credentials');
                }
            } else {
                const newUserProfile = {
                    username,
                    password, // Save password securely
                    firstName,
                    lastName,
                    email,
                    contactNumber,
                    address,
                    profilePicture,
                };
                await registerUser(newUserProfile);
                await AsyncStorage.setItem('userProfile', JSON.stringify(newUserProfile));
                Alert.alert('Success', 'Registration successful');
                setIsLogin(true);
                setUsername(username);
                setPassword(password);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again later.');
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('isLoggedIn');
            await AsyncStorage.removeItem('userProfile');
            setIsLoggedIn(false);
            setUsername('');
            setPassword('');
            setUserProfile(null);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const handleSaveProfile = async () => {
        try {
            await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated');
        } catch (error) {
            Alert.alert('Error', 'Failed to save profile');
        }
    };

    if (isLoggedIn) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <Image
                        style={styles.profileImage}
                        source={{ uri: userProfile?.profilePicture || 'https://placekitten.com/200/200' }}
                    />
                    <Text style={styles.headerText}>
                        Welcome, {userProfile?.firstName} {userProfile?.lastName}!
                    </Text>

                    {isEditing ? (
                        <View>
                            <TextInput
                                style={styles.editInput}
                                placeholder="First Name"
                                value={userProfile?.firstName}
                                onChangeText={(text) => setUserProfile({ ...userProfile, firstName: text })}
                            />
                            <TextInput
                                style={styles.editInput}
                                placeholder="Last Name"
                                value={userProfile?.lastName}
                                onChangeText={(text) => setUserProfile({ ...userProfile, lastName: text })}
                            />
                            <TextInput
                                style={styles.editInput}
                                placeholder="Email"
                                value={userProfile?.email}
                                onChangeText={(text) => setUserProfile({ ...userProfile, email: text })}
                            />
                            <TextInput
                                style={styles.editInput}
                                placeholder="Contact Number"
                                value={userProfile?.contactNumber}
                                onChangeText={(text) => setUserProfile({ ...userProfile, contactNumber: text })}
                            />
                            <TextInput
                                style={styles.editInput}
                                placeholder="Address"
                                value={userProfile?.address}
                                onChangeText={(text) => setUserProfile({ ...userProfile, address: text })}
                            />
                            <TextInput
                                style={styles.editInput}
                                placeholder="Profile Picture URL"
                                value={userProfile?.profilePicture}
                                onChangeText={(text) => setUserProfile({ ...userProfile, profilePicture: text })}
                            />
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <Text style={styles.profileInfo}>
                                Name: {userProfile?.firstName} {userProfile?.lastName}
                            </Text>
                            <Text style={styles.profileInfo}>Email: {userProfile?.email}</Text>
                            <Text style={styles.profileInfo}>Contact: {userProfile?.contactNumber}</Text>
                            <Text style={styles.profileInfo}>Address: {userProfile?.address}</Text>
                            <TouchableOpacity onPress={() => setIsEditing(true)}>
                                <Text style={styles.link}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <Image style={styles.headerImage} source={require('./assets/icon.png')} />
                    <Text style={styles.headerText}>{isLogin ? 'Welcome Back!' : 'Create Account'}</Text>
                    <Text style={styles.subHeaderText}>
                        {isLogin ? 'Please sign in to continue' : 'Please fill in the form to continue'}
                    </Text>

                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            value={username}
                            onChangeText={setUsername}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        {!isLogin && (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="First Name"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contact Number"
                                    value={contactNumber}
                                    onChangeText={setContactNumber}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Address"
                                    value={address}
                                    onChangeText={setAddress}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Profile Picture URL"
                                    value={profilePicture}
                                    onChangeText={setProfilePicture}
                                />
                            </>
                        )}
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSubmit
                                        }>
                                        <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
                                    </TouchableOpacity>
                
                                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                                        <Text style={styles.link}>
                                            {isLogin ? 'New user? Create an account' : 'Already have an account? Sign in'}
                                        </Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </KeyboardAvoidingView>
                            <StatusBar style="auto" />
                        </SafeAreaView>
                    );
                }
                
                const styles = StyleSheet.create({
                    container: {
                        flex: 1,
                        padding: 20,
                        backgroundColor: '#f8f9fa',
                    },
                    scrollView: {
                        flexGrow: 1,
                        justifyContent: 'center',
                    },
                    headerImage: {
                        width: 100,
                        height: 100,
                        alignSelf: 'center',
                        marginBottom: 20,
                    },
                    headerText: {
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: '#333',
                        textAlign: 'center',
                        marginBottom: 10,
                    },
                    subHeaderText: {
                        fontSize: 16,
                        color: '#666',
                        textAlign: 'center',
                        marginBottom: 20,
                    },
                    input: {
                        height: 50,
                        borderColor: '#ddd',
                        borderWidth: 1,
                        borderRadius: 5,
                        paddingHorizontal: 10,
                        marginBottom: 15,
                        backgroundColor: '#fff',
                    },
                    button: {
                        backgroundColor: '#007bff',
                        padding: 15,
                        borderRadius: 5,
                        alignItems: 'center',
                        marginBottom: 10,
                    },
                    buttonText: {
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 16,
                    },
                    link: {
                        textAlign: 'center',
                        color: '#007bff',
                        marginTop: 10,
                        textDecorationLine: 'underline',
                    },
                    profileImage: {
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        alignSelf: 'center',
                        marginBottom: 20,
                    },
                    profileInfo: {
                        fontSize: 16,
                        marginBottom: 10,
                        textAlign: 'center',
                    },
                    editInput: {
                        height: 50,
                        borderColor: '#ddd',
                        borderWidth: 1,
                        borderRadius: 5,
                        paddingHorizontal: 10,
                        marginBottom: 10,
                        backgroundColor: '#fff',
                    },
                    saveButton: {
                        backgroundColor: '#28a745',
                        padding: 15,
                        borderRadius: 5,
                        alignItems: 'center',
                    },
                    saveButtonText: {
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 16,
                    },
                    logoutButton: {
                        backgroundColor: '#dc3545',
                        padding: 15,
                        borderRadius: 5,
                        alignItems: 'center',
                        marginTop: 20,
                    },
                    logoutButtonText: {
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 16,
                    },
                });
                
