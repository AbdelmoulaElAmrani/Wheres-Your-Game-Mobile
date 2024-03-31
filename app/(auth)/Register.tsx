import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image, ImageBackground, StyleSheet, Modal, Text, TouchableOpacity, View, TouchableWithoutFeedback, FlatList, Keyboard, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import CustomButton from "@/components/CustomButton";
import { TextInput } from "react-native-paper";
import { router } from "expo-router";
import { AntDesign } from '@expo/vector-icons';
import { RegisterRequest } from "@/models/requestObjects/RegisterRequest";
import UserType from "@/models/UserType";
import {useDispatch} from 'react-redux'
import { updateUerData } from "@/redux/UserRegisterSlice";


const countries = [
    { key: 'United State', value: '+1', flag: require('../../assets/images/flags/US-flag.png') },
    { key: 'Canada', value: '+1', flag: require('../../assets/images/flags/CA-flag.png') },
    { key: 'United Kingdom', value: '+44', flag: require('../../assets/images/flags/UK-flag.png') },
];


const Register = () => {
    const dispatch = useDispatch()
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [userData, setUserData] = useState<RegisterRequest>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        zipCode: '',
        bio: '',
        verified: false,
        role: UserType.DEFAULT,
    });
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const _handleOnNext = (): void => {
        const errors = _verifyRequiredData(userData);
        if (errors.length === 0) {
            dispatch(updateUerData(userData));
            router.navigate("/TermsPolicies");
        } else {
            Alert.alert(errors.join('\n'));
        }
    }
    
    const _verifyRequiredData = (userData: RegisterRequest): string[] => {
        const errors: string[] = [];
    
        if (userData.email.trim() === '') {
            errors.push('Email is required');
        } else if (!_isEmailValid(userData.email)) {
            errors.push('Invalid email format');
        }
    
        if (userData.password.trim() === '') {
            errors.push('Password is required');
        } else if (!_isPasswordValid(userData.password)) {
            errors.push('Password must be 6-20 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
        }
    
        if (userData.firstName.trim() === '') {
            errors.push('First name is required');
        }
    
        if (userData.lastName.trim() === '') {
            errors.push('Last name is required');
        }
    
        if (userData.phoneNumber.trim() === '') {
            errors.push('Phone number is required');
        }
    
        return errors;
    }
    
    const _isEmailValid = (email: string): boolean => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
    
    const _isPasswordValid = (password: string): boolean => {
        const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
        return re.test(password);
    }
    
    const _renderFlagModal = () => {
        const renderItem = ({ item }: { item: any }) => {
            return (
                <TouchableOpacity
                    onPress={() => {
                        setSelectedCountry(item)
                        setModalVisible(false)
                    }}
                    style={{ flexDirection: 'row', padding: 10, alignItems: 'center' }}>
                    <Image
                        source={item.flag}
                        resizeMode="contain"
                        style={{ height: 30, width: 30, marginRight: 10 }}
                    />
                    <Text style={{
                        color: 'white',
                        fontSize: 16,
                        fontWeight: 'bold'
                    }}>{'(' + item.value + ') ' + item.key}</Text>
                </TouchableOpacity>
            )
        }
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <TouchableWithoutFeedback
                    onPress={() => setModalVisible(false)}
                >
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <View style={{
                            height: hp(100),
                            width: wp(100),
                            backgroundColor: '#160076'
                        }}>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={{
                                    position: 'absolute',
                                    top: 60,
                                    right: 22,
                                    width: 42,
                                    height: 42,
                                    backgroundColor: 'white',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 999
                                }}>
                                <AntDesign name="close" size={24} color="black" />

                            </TouchableOpacity>
                            <FlatList
                                data={countries}
                                renderItem={renderItem}
                                horizontal={false}
                                keyExtractor={item => item.key}
                                style={{ padding: 20, marginBottom: 20, marginTop: hp(12) }}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>

            </Modal>
        );
    }

    return <>
        <StatusBar style="light" />
        <ImageBackground
            style={{ height: hp(100) }}
            source={require('../../assets/images/signupBackGround.jpg')}
        >

            <SafeAreaView style={{ height: hp(100) }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>
                        <View style={styles.headerContainer}>
                            <Image style={styles.logoContainer}
                                source={require('../../assets/images/logoBall.png')} />
                        </View>
                        <Text style={styles.headerTitle}>Sports For Every Age</Text>
                        <ScrollView automaticallyAdjustKeyboardInsets={true}>
                            <View style={styles.formContainer}>
                                <View>
                                    <Text style={styles.textLabel}>First Name</Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder={'First name'}
                                        placeholderTextColor={'grey'}
                                        value={userData.firstName}
                                        onChangeText={(value) => {
                                            setUserData(oldValue => ({ ...oldValue, firstName: value }))
                                        }}
                                    />
                                </View>
                                <View style={styles.mgTop}>
                                    <Text style={styles.textLabel}>Last Name</Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder={'Last name'}
                                        placeholderTextColor={'grey'}
                                        value={userData.lastName}
                                        onChangeText={(value) => {
                                            setUserData(oldValue => ({ ...oldValue, lastName: value }))
                                        }}
                                    />
                                </View>
                                <View style={styles.mgTop}>
                                    <Text style={styles.textLabel}>Email</Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder={'Email'}
                                        placeholderTextColor={'grey'}
                                        value={userData.email}
                                        onChangeText={(value) => {
                                            setUserData(oldValue => ({ ...oldValue, email: value }))
                                        }}
                                    />
                                </View>
                                <View style={styles.mgTop}>
                                    <Text style={styles.textLabel}>Password</Text>
                                    <TextInput
                                        style={styles.inputStyle}
                                        placeholder={'Password'}
                                        secureTextEntry={true}
                                        placeholderTextColor={'grey'}
                                        value={userData.password}
                                        onChangeText={(value) => {
                                            setUserData(oldValue => ({ ...oldValue, password: value }))
                                        }}
                                    />
                                </View>
                                <View style={styles.mgTop}>
                                    <Text style={styles.textLabel}>Phone number</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: "center" }}>
                                        <TouchableOpacity style={styles.selectedFlagContainer}
                                            onPress={() => setModalVisible(true)}>

                                            <View style={{ justifyContent: 'center', marginLeft: 5 }}>
                                                <Image source={selectedCountry.flag}
                                                    style={styles.flagIcon}
                                                />
                                            </View>
                                            <View>
                                                <AntDesign style={{ marginLeft: 3 }} name="down" size={16} color="grey" />
                                            </View>
                                        </TouchableOpacity>
                                        <TextInput
                                            style={[styles.inputStyle, { flex: 2, }]}
                                            placeholder={'Enter your phone number'}
                                            cursorColor='black'
                                            keyboardType="phone-pad"
                                            placeholderTextColor={'grey'}
                                            value={userData.phoneNumber}
                                            onChangeText={(value) => {
                                                setUserData(oldValue => ({ ...oldValue, phoneNumber: selectedCountry.value + value }))
                                            }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                        <View style={styles.nextBottom}>
                            <Image source={require('../../assets/images/groupPeople.png')} />
                            <CustomButton
                                style={{ marginTop: 5 }} text={"Next"} onPress={_handleOnNext} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                {_renderFlagModal()}
            </SafeAreaView>
        </ImageBackground>

    </>
}

const styles = StyleSheet.create({
    container: {
        height: hp(100),
        flex: 1
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        resizeMode: 'contain',
        height: 200,
        marginTop: -40
    },
    headerTitle: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: -40,
        letterSpacing: 5
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, .3)',
        alignSelf: "center",
        width: wp(90),
        borderRadius: 20,
        padding: 20,
        marginTop: 30,
    }
    ,
    textLabel: {
        color: 'white',
        fontSize: 18,
        fontWeight: "500"
    },
    inputStyle: {
        backgroundColor: 'white',
        height: 45,
        fontSize: 16,
        marginTop: 5,
        color: 'black',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20
    },
    mgTop: {
        marginTop: 5
    },
    selectBox: {
        flex: 1,
        marginRight: 10,
        backgroundColor: 'white'
    },
    dropdownStyle: {
        backgroundColor: 'white'
    },
    flagIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    nextBottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    selectedFlagContainer: {
        backgroundColor: 'white',
        flexDirection: "row",
        alignItems: "center",
        alignContent: "center",
        borderRadius: 10,
        marginRight: 5,
        height: 45,
    }
});
export default Register;