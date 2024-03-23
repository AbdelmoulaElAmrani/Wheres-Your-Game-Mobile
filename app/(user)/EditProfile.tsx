import CustomButton from "@/components/CustomButton";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import { useRef, useState } from "react";
import {  ImageBackground, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native"
import { Avatar, Text, TextInput } from "react-native-paper";
import PhoneInput from "react-native-phone-number-input";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from "react-native-safe-area-context";

const EditProfile = () => {
    
    const _handleContinue = () => {
        console.log('Continue');
        console.log(user) 
    }



    const countries = [
        { key: 'United State', value: '+1', flag: require('../../assets/images/flags/US-flag.png') },
        { key: 'Canada', value: '+1', flag: require('../../assets/images/flags/CA-flag.png') },
        { key: 'United Kingdom', value: '+44', flag: require('../../assets/images/flags/UK-flag.png') },
    ];

    const [user, setUser] = useState({
        name: 'John Doe',
        age: 25,
        email: 'jhon@gmail.com',
        phone: '1234567890',
        gender: 'Male',
        imageUrl: null,//'http://www.cecyteo.edu.mx/Nova/App_themes/Nova2016/assets/pages/media/profile/profile_user.jpg'
        address: '1234, Street, City, Country',
        zipCode: '123456'
    });


    const phoneInput = useRef(null);


    return (
        <ImageBackground
            style={{ height: hp(100) }}
            source={require('../../assets/images/signupBackGround.jpg')}
        >
            <SafeAreaView>
                <CustomNavigationHeader text={"Edit Profile"} />


                <View style={styles.cardContainer}>
                    <View style={styles.userInfoContainer}>

                        {user.imageUrl ? <Avatar.Image size={100} source={{ uri: user.imageUrl }} />
                            : <Avatar.Text size={100} label={user.name ? user.name[0] : ''} />}
                    </View>
                    <View style={styles.formContainer}>
                        <View style={styles.mgTop}>
                            <Text style={styles.textLabel}>Full Name</Text>
                            <TextInput
                                style={styles.inputStyle}
                                placeholder={'Full Name'}
                                cursorColor='black'
                                placeholderTextColor={'grey'}
                                left={<TextInput.Icon color={'#D3D3D3'} icon='account-outline' size={30} />}
                                value={user.name}
                                onChangeText={(text) => setUser({ ...user, name: text })}
                                underlineColor={"transparent"}
                            />
                            <Text style={styles.textLabel}>Email</Text>
                            <TextInput
                                style={styles.inputStyle}
                                placeholder={'Email'}
                                cursorColor='black'
                                placeholderTextColor={'grey'}
                                left={<TextInput.Icon color={'#D3D3D3'} icon='email-outline' size={30} />}
                                value={user.email}
                                onChangeText={(text) => setUser({ ...user, email: text })}
                                underlineColor={"transparent"}
                            />

                            <Text style={styles.textLabel}>Phone number</Text>
                            <View style={styles.mgTop}>
                                <PhoneInput
                                    ref={phoneInput}
                                    defaultCode="US"
                                    layout="first"
                                    withDarkTheme
                                    autoFocus
                                    placeholder="Enter phone number"
                                    value={user.phone}
                                    onChangeText={(text) => setUser({ ...user, phone: text })}
                                    containerStyle={styles.phoneInputContainer}
                                    textContainerStyle={styles.textPhoneInputContainer}

                                />
                                <Text style={styles.textLabel}>Address</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Address'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='map-marker-outline' size={30} />}
                                    value={user.address}
                                    onChangeText={(text) => setUser({ ...user, address: text })}
                                    underlineColor={"transparent"}
                                />

                                {/* zip code */}
                                <Text style={styles.textLabel}>Zip Code</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Zip Code'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                    left={<TextInput.Icon color={'#D3D3D3'} icon='map-marker-outline' size={30} />}
                                    value={user.zipCode}
                                    onChangeText={(text) => setUser({ ...user, zipCode: text })}
                                    underlineColor={"transparent"}
                                />
                                <View style={styles.buttonContainer}>
                                    <CustomButton text="Continue" onPress={_handleContinue} />
                                </View>
                            </View>
                        </View>
                    </View>



                </View>


            </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        width: wp('100'),
        height: hp('90'),
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 20,
        marginTop: hp(25),
        position: 'absolute'
    },
    userInfoContainer: {

        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginTop: hp(10)
    },
    formContainer: {
        alignSelf: "center",
        width: wp(100),
        borderRadius: 30,
        padding: 20,
        height: hp(100),
    },
    textLabel: {
        color: 'black',
        fontSize: 18,
        fontWeight: "500",
        marginTop: 10
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
        borderBottomLeftRadius: 20,
        borderColor: '#D3D3D3',
        borderWidth: 1

    },
    mgTop: {
        marginTop: 5
    },
    selectedFlagContainer: {
        backgroundColor: 'white',
        flexDirection: "row",
        alignItems: "center",
        alignContent: "center",
        borderRadius: 10,
        marginRight: 5,
        height: 45,
    },
    flagIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    phoneInputContainer: {
        backgroundColor: 'white',
        height: 51,
        width: wp(90),
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderColor: '#D3D3D3',
        borderWidth: 1
    },
    textPhoneInputContainer: {
        color: 'black',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        backgroundColor: 'white'


    },
    buttonContainer: {
        marginTop: hp(5)
    }
})


export default EditProfile;