import {StatusBar} from "expo-status-bar";
import {SafeAreaView} from "react-native-safe-area-context";
import {Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import React from "react";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import CustomButton from "@/components/CustomButton";

const Register = () => {
    const _handleOnNext = (): void => {

    }

    return <>
        <StatusBar style="light"/>
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../assets/images/signupBackGround.jpg')}
        >
            <SafeAreaView>
                <ScrollView bounces={false}>
                    <View style={styles.container}>
                        <View style={styles.headerContainer}>
                            <Image style={styles.logoContainer}
                                   source={require('../../assets/images/logoBall.png')}/>
                        </View>
                        <Text style={styles.headerTitle}>Sports For Every Age</Text>
                        <View style={styles.formContainer}>
                            <View>
                                <Text style={styles.textLabel}>Full Name</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Digiboost'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                />
                            </View>
                            <View>
                                <Text style={styles.textLabel}>Full Name</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Digiboost'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                />
                            </View>
                            <View>
                                <Text style={styles.textLabel}>Full Name</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Digiboost'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                />
                            </View>
                            <View>
                                <Text style={styles.textLabel}>Full Name</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Digiboost'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                />
                            </View>
                            <View>
                                <Text style={styles.textLabel}>Full Name</Text>
                                <TextInput
                                    style={styles.inputStyle}
                                    placeholder={'Digiboost'}
                                    cursorColor='black'
                                    placeholderTextColor={'grey'}
                                />
                            </View>
                        </View>
                        <View></View>
                        <View style={styles.btnContainer}>
                            <CustomButton text={"Next"} onPress={_handleOnNext}/>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>

    </>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        padding: 20
    },
    textLabel: {
        color: 'white',
        fontSize: 18,
        fontWeight: "500"
    },
    inputStyle: {
        backgroundColor: 'white',
        color: 'black',
        height: 45,
        borderRadius: 20,
        padding: 20,
        fontSize: 16,
        marginTop: 5
    },
    btnContainer: {
        backgroundColor: 'white',
        borderTopEndRadius: 35,
        borderTopStartRadius: 35,

    }

});
export default Register;