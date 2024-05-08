import {StatusBar} from 'expo-status-bar'
import {StyleSheet, Text, View} from 'react-native'
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import CustomButton from '@/components/CustomButton';
import {router} from "expo-router";
import {Image, ImageBackground} from "expo-image";

const Welcome = () => {
    const _handleGetStarted = () => {
        router.navigate('/(tabs)');
    }
    return (
        <>
            <StatusBar style="light"/>
            <ImageBackground
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    flex: 1,
                    alignItems: "center"
                }}
                source={require('../../assets/images/signupBackGround.jpg')}
            >
                <Image style={styles.logoContainer} source={require('../../assets/images/ballwithoutText.png')}/>

                <View style={styles.container}>
                    <Text style={styles.welcomeText}>Welcome to</Text>
                    <Text style={styles.wheresYourGameText}>Where's Your Game</Text>
                    <Text style={styles.accountHaseBeenCreatedText}>Your account has been created successfully created.
                        Now, let's start your sports apps</Text>
                </View>

                <CustomButton
                    text="Get Started"
                    onPress={_handleGetStarted}
                    style={styles.getStartedButton}
                />


            </ImageBackground>

        </>
    )
}

export default Welcome

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    welcomeText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white'
    },
    wheresYourGameText: {
        fontSize: 35,
        fontWeight: 'bold',
        color: 'white'
    },
    accountHaseBeenCreatedText: {
        fontSize: 18,
        color: 'white',
        flexWrap: 'wrap',
        textAlign: 'center',
        marginTop: hp(8)

    },
    getStartedButton: {
        alignSelf: 'center',
        marginBottom: hp(5)
    },
    logoContainer: {
        marginTop: hp(20),
        alignSelf: 'center',
        width: wp(60),
    }


})