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
import {Ionicons} from "@expo/vector-icons";

const AdvertisementRequest = () => {
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async () => {
        Keyboard.dismiss();
        if (message.trim().length === 0) {
            Alert.alert('Required', 'Please describe your advertising needs.');
            return;
        }
        setLoading(true);
        const isOk = await AdvertisementService.submitAdvertisementRequest({message: message});
        setLoading(false);
        if (isOk) {
            Alert.alert(
                "Success!",
                "Your advertising request has been submitted. Our team will review it and contact you soon.",
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
            Alert.alert("Error", "Failed to send your request. Please try again later.");
        }
    };

    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader text={'Advertising Opportunities'} showBackArrow/>
                <View style={styles.cardContainer}>
                    <KeyboardAwareScrollView
                        enableOnAndroid={true}
                        extraHeight={hp(5)}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        bounces={true}>
                        <View style={styles.contentContainer}>
                            <View style={styles.headerContainer}>
                                <Ionicons name="megaphone-outline" size={40} color="#2757CB" />
                                <Text style={styles.title}>Promote Your Organization</Text>
                                <Text style={styles.subtitle}>Reach thousands of sports enthusiasts</Text>
                            </View>

                            <View style={styles.benefitsContainer}>
                                <Text style={styles.sectionTitle}>Why Advertise With Us?</Text>
                                <View style={styles.benefitItem}>
                                    <Ionicons name="people-outline" size={24} color="#2757CB" />
                                    <Text style={styles.benefitText}>Targeted audience of sports enthusiasts</Text>
                                </View>
                                <View style={styles.benefitItem}>
                                    <Ionicons name="trending-up-outline" size={24} color="#2757CB" />
                                    <Text style={styles.benefitText}>Increase visibility and engagement</Text>
                                </View>
                                <View style={styles.benefitItem}>
                                    <Ionicons name="analytics-outline" size={24} color="#2757CB" />
                                    <Text style={styles.benefitText}>Track campaign performance</Text>
                                </View>
                            </View>

                            <View style={styles.formContainer}>
                                <Text style={styles.label}>Tell us about your advertising needs</Text>
                                <Text style={styles.hint}>Include details about your organization, target audience, and advertising goals</Text>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Example: We're a youth soccer club looking to promote our summer camps to parents in the local area..."
                                    multiline
                                    numberOfLines={6}
                                    value={message}
                                    onChangeText={setMessage}
                                    textAlignVertical="top"
                                />
                            </View>

                        </View>
                       
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            style={styles.submitButton}>
                            <Text style={styles.buttonText}>
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.infoContainer}>
                            <Ionicons name="information-circle-outline" size={24} color="#2757CB" />
                            <Text style={styles.infoText}>Our team will review your request and contact you within 2 business days to discuss advertising options and pricing.</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Ionicons name="information-circle-outline" size={24} color="#2757CB" />
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
        borderTopEndRadius: 40,
        borderTopStartRadius: 40,
        padding: 20,
        marginTop: hp(2)
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 10
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
        textAlign: 'center'
    },
    benefitsContainer: {
        backgroundColor: '#F8F9FF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 30
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    benefitText: {
        fontSize: 16,
        color: '#444',
        marginLeft: 10,
        flex: 1
    },
    formContainer: {
        marginBottom: 30
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8
    },
    hint: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10
    },
    textArea: {
        height: hp(20),
        borderColor: '#E0E0E0',
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#F9F9F9',
        textAlignVertical: 'top'
    },
    infoContainer: {
        flexDirection: 'row',
        backgroundColor: '#F0F4FF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 30
    },
    infoText: {
        fontSize: 14,
        color: '#444',
        marginLeft: 10,
        flex: 1
    },
    submitButton: {
        backgroundColor: '#2757CB',
        height: 55,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
        marginBottom: 30,
        alignSelf: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600'
    }
});

export default AdvertisementRequest; 