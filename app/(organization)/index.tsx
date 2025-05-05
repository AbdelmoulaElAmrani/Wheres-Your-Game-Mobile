import {ImageBackground} from "expo-image";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import {Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import React, {useState} from "react";
import {useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {router} from "expo-router";
import CustomButton from "@/components/CustomButton";
import {AdvertisementService} from "@/services/AdvertisementService";

const AdvertisementRequest = () => {
    const [message, setMessage] = useState<string>('');

    const handleSubmit = async () => {
        Keyboard.dismiss();
        if (message.trim().length === 0) {
            alert('Please type your message.');
            return;
        }
        const isOk = await AdvertisementService.submitAdvertisementRequest({message: message});
        if (isOk) {
            Alert.alert(
                "Success",
                "Your advertisement request has been sent!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            setMessage('');
                            if (router.canGoBack()) {
                                router.back();
                            }
                        }
                    }
                ],
                { cancelable: false }
            );
        } else {
            alert("Failed to send your request. Please try again later.");
        }
    };

    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader text={'Advertisement'} showBackArrow/>
                <View style={styles.cardContainer}>
                    <KeyboardAwareScrollView
                        enableOnAndroid={true}
                        extraHeight={hp(5)}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingTop: 20, paddingHorizontal: 10}}
                        bounces={true}>
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>Advertisement Request</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Type your message here..."
                                multiline
                                numberOfLines={10}
                                value={message}
                                onChangeText={setMessage}
                                textAlignVertical="top"
                            />
                            <View style={{marginTop: 20}}>
                                <Text style={styles.text}>Head up!</Text>
                                <Text style={styles.text}>You're about to submit an advertisement request directly to the app administrator.</Text>
                            </View>


                            <CustomButton onPress={handleSubmit} style={styles.submitButton} text={'Submit'}/>
                        </View>
                    </KeyboardAwareScrollView>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}


const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 20,
        marginTop: hp(2)
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    textArea: {
        height: hp(38),
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#F9F9F9',
        marginTop: hp(5)
    },
    submitButton: {
        marginTop: hp(10),
    },
    text: {
        fontSize: 16,
        fontWeight: '500',
    }
});

export default AdvertisementRequest;