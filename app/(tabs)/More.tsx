import {ImageBackground, Keyboard, StyleSheet, Text, TouchableWithoutFeedback, View} from "react-native";
import {StatusBar} from "expo-status-bar";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import React from "react";

const More = () => {
    return <>
        <StatusBar style="light"/>
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../assets/images/signupBackGround.jpg')}>

            <SafeAreaView style={{height: hp(100)}}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        {/*<View>
                                <View>
                                    <TouchableOpacity></TouchableOpacity>
                                </View>
                                <View>
                                    <Image style={styles.logoContainer}
                                           source={require('../../assets/images/logoBall.png')}/>
                                </View>
                                <View>
                                    <TouchableOpacity></TouchableOpacity>
                                    <TouchableOpacity></TouchableOpacity>
                                </View>
                            </View>*/}

                        <View style={styles.mainContainer}>

                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </SafeAreaView>
        </ImageBackground>
    </>
}

const styles = StyleSheet.create({

        headerContainer: {
            alignItems: 'center',
            marginTop: hp(5),
        },
        logoContainer: {
            width: wp(85),
            height: hp(25),
            alignContent: 'center',
            marginTop: hp(-30),
        },
        mainContainer: {
            flex: 1,
            backgroundColor: 'white',
            borderTopEndRadius: 35,
            borderTopStartRadius: 35,
            paddingTop: 30,
            padding: 20,
            marginTop: 10,
            minHeight: hp(100),
            width: wp(100)
        },
    }
);
export default More;