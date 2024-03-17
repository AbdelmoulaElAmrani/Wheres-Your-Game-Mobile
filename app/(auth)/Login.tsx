import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {StatusBar} from "expo-status-bar";
import {SafeAreaView} from "react-native-safe-area-context";
import React from "react";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";

const Login = () => {
    return <>
        <StatusBar backgroundColor={"red"} style="dark"/>
        <SafeAreaView style={{flex: 1, backgroundColor: styles.container.backgroundColor}}>
            <ScrollView>
                <View style={styles.container}>
                    <View style={styles.headerContainer}>
                        <Image style={styles.logoContainer}
                               source={require('../../assets/images/ballwithoutText.png')}/>
                        <TouchableOpacity style={styles.skipButton}>
                            <Text style={styles.skipText}>Skip</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                    </View>
                    <TouchableOpacity
                        style={styles.nextBtn}>
                        <Text style={{fontSize: 20, color: 'white', textAlign: 'center'}}>Next</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    </>;
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        minWidth: wp('100'),
        minHeight: hp('100'),
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
    },
    logoContainer: {
        height: 70,
        justifyContent: "center"
    },
    skipButton: {
        position: 'absolute',
        right: 20,
        top: '30%',
        transform: [{translateY: -0.5}],
    },
    skipText: {
        fontWeight: "bold",
        fontSize: 15
    },
    introIconContainer: {
        justifyContent: "center",
        alignItems: "center"
    },
    nextBtn: {
        backgroundColor: "#2757CB",
        width: wp(80),
        height: 55,
        borderRadius: 30,
        marginTop: 20,
        alignSelf: "center",
        justifyContent: "center",
    },

});
export default Login;