import {StatusBar} from "expo-status-bar";
import {SafeAreaView} from "react-native-safe-area-context";
import {Image, ImageBackground, ScrollView, StyleSheet, Text, View} from "react-native";
import React, {useState} from "react";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import CustomButton from "@/components/CustomButton";
import {TextInput} from "react-native-paper";
import {SelectList} from "react-native-dropdown-select-list";
import {router} from "expo-router";


const countries = [
    {key: 'US', value: '+1', flagUri: 'https://flagcdn.com/us.svg'},
    {key: 'CA', value: '+1', flagUri: 'https://flagcdn.com/ca.svg'},
    {key: 'AU', value: '+61', flagUri: 'https://flagcdn.com/au.svg'},
];


const Register = () => {
    const [selectedCountry, setSelectedCountry] = useState('US');
    const selectedCountryData = countries.find(country => country.value === selectedCountry);
    const [userData, setUserData] = useState<any>();

    const _handleOnNext = (): void => {
        //router.navigate()
    }

    return <>
        <StatusBar style="light"/>
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../assets/images/signupBackGround.jpg')}
        >
            <SafeAreaView style={{height: hp(100)}}>
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <Image style={styles.logoContainer}
                               source={require('../../assets/images/logoBall.png')}/>
                    </View>
                    <Text style={styles.headerTitle}>Sports For Every Age</Text>
                    <View style={styles.formContainer}>
                        <View>
                            <Text style={styles.textLabel}>First Name</Text>
                            <TextInput
                                style={styles.inputStyle}
                                placeholder={'First name'}
                                //cursorColor='black'
                                placeholderTextColor={'grey'}
                            />
                        </View>
                        <View style={styles.mgTop}>
                            <Text style={styles.textLabel}>Last Name</Text>
                            <TextInput
                                style={styles.inputStyle}
                                placeholder={'Last name'}
                                cursorColor='black'
                                placeholderTextColor={'grey'}
                            />
                        </View>
                        <View style={styles.mgTop}>
                            <Text style={styles.textLabel}>Email</Text>
                            <TextInput
                                style={styles.inputStyle}
                                placeholder={'Email'}
                                cursorColor='black'
                                placeholderTextColor={'grey'}
                            />
                        </View>
                        <View style={styles.mgTop}>
                            <Text style={styles.textLabel}>Password</Text>
                            <TextInput
                                style={styles.inputStyle}
                                placeholder={'Password'}
                                secureTextEntry={true}
                                cursorColor='black'
                                placeholderTextColor={'grey'}
                            />
                        </View>
                        <View style={styles.mgTop}>
                            <Text style={styles.textLabel}>Phone number</Text>
                            <View style={{flexDirection: 'row', justifyContent: "space-between"}}>
                                <SelectList
                                    setSelected={setSelectedCountry}
                                    data={countries.map(({key, value}) => ({key, value}))}
                                    boxStyles={styles.selectBox}
                                    dropdownStyles={styles.dropdownStyle}
                                />
                                {selectedCountryData && (
                                    <Image source={{uri: selectedCountryData.flagUri}} style={styles.flag}/>
                                )}
                                <TextInput
                                    style={[styles.inputStyle, {flex: 2,}]}
                                    placeholder={'+1 202 xxx xxxx'}
                                    cursorColor='black'
                                    keyboardType="phone-pad"
                                    placeholderTextColor={'grey'}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.nextBottom}>
                        <Image source={require('../../assets/images/groupPeople.png')}/>
                        {/*<View style={{
                                backgroundColor: 'white',
                                height: 10,
                                borderTopEndRadius: 25,
                                borderTopStartRadius: 25
                            }}></View>*/}

                        <CustomButton style={{marginTop: 5}} text={"Next"} onPress={_handleOnNext}/>
                    </View>
                </View>
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
        marginTop: 30
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
    flag: {
        width: 32,
        height: 20,
        resizeMode: 'contain',
    },
    nextBottom: {
        position: "absolute",
         bottom: 0,
         left: 0,
        right: 0,
    }
});
export default Register;