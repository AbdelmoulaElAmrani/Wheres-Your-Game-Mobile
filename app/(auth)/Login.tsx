import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {StatusBar} from "expo-status-bar";
import {SafeAreaView} from "react-native-safe-area-context";
import React from "react";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";

const Login = () => {
    return <>
        <StatusBar style="dark"/>
        <SafeAreaView style={{flex: 1, backgroundColor: styles.container.backgroundColor}}>
            <ScrollView bounces={false}>
                <View style={styles.container}>

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

});
export default Login;