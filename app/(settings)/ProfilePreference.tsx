import { ImageBackground } from "expo-image";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import {Alert, Platform, ScrollView, StyleSheet, Text, View} from "react-native";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import React, { useEffect, useState } from "react";
import { TextInput } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { useDispatch, useSelector } from "react-redux";
import { UserSportResponse } from "@/models/responseObjects/UserSportResponse";
import CustomButton from "@/components/CustomButton";
import { UserService } from "@/services/UserService";
import { router } from "expo-router";
import { UserResponse } from "@/models/responseObjects/UserResponse";
import { getUserProfile } from "@/redux/UserSlice";

const ProfilePreference = () => {

    const availableSport = useSelector((state: any) => state.user.userSport) as UserSportResponse[];
    const currentUser = useSelector((state: any) => state.user.userData) as UserResponse;

    const [formData, setFormData] = useState<any>({
        preferenceSport: '',
        positionCoached: '',
        skillLevel: '',
        bio: '',
    });

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getUserProfile() as any);
    }, []);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                preferenceSport: currentUser.preferenceSport || '',
                positionCoached: currentUser.positionCoached || '',
                skillLevel: currentUser.skillLevel ? currentUser.skillLevel[0] || '' : '',
                bio: currentUser.bio || '',
            });
        }
    }, [currentUser]);

    const _handleSave = async () => {
        try {
            const response = await UserService.updateProfilePreference(formData);
            if (response) {
                Alert.alert("Success", "Modification saved successfully!", [
                    {
                        text: "OK",
                        onPress: () => router.back()
                    }
                ]
                );
            } else {
                Alert.alert("Error", "Something went wrong. Please try again.");
            }
        } catch (error) {
            Alert.alert("Error", "An error occurred while saving modifications.");
        }
    };

    return (
        <ImageBackground
            style={{ height: hp(100) }}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader text={'Profile Preference'} showBackArrow />
                <View style={styles.cardContainer}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 1 }} bounces={true}>
                        <View style={{ flex: 1, paddingHorizontal: 5 }}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.textLabel}>Your Sport</Text>
                                <RNPickerSelect
                                    style={{
                                        inputIOS: [styles.inputText, { paddingLeft: 15 }],
                                        inputAndroid: [styles.inputText, { paddingLeft: 15}],
                                        placeholder: {color: 'black'}
                                    }}
                                    items={availableSport.map((sport: UserSportResponse) => ({
                                        label: sport.sportName,
                                        value: sport.id.sportId,
                                        key: sport.id.sportId
                                    }))}
                                    placeholder={{ label: 'Select sport', value: null }}
                                    onValueChange={(value) => {
                                        const sport = availableSport.find(_ => _.id.sportId == value);
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            skillLevel: sport?.sportLevel.toString() || "",
                                            preferenceSport: sport?.sportName || ""
                                        }));
                                    }}
                                    value={availableSport.find(_ => _.sportName == formData.preferenceSport)?.id.sportId || ''}
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={styles.textLabel}>Your Position</Text>
                                <TextInput
                                    style={styles.inputText}
                                    placeholder={'Your Position'}
                                    cursorColor={'black'}
                                    placeholderTextColor={'grey'}
                                    underlineColor="transparent"
                                    onChangeText={(value) => setFormData((prev: any) => ({
                                        ...prev,
                                        positionCoached: value
                                    }))}
                                    value={formData.positionCoached}
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <Text style={styles.textLabel}>Bio</Text>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Enter your bio here..."
                                    placeholderTextColor="gray"
                                    multiline={true}
                                    numberOfLines={3}
                                    onChangeText={(text) => {
                                        // Prevent manual line breaks
                                        const formattedText = text.replace(/\n/g, ' '); // Replace new lines with spaces
                                        setFormData((prev: any) => ({...prev, bio: formattedText}));
                                    }}
                                    value={formData.bio}
                                    textAlignVertical={'top'}
                                    returnKeyType="done"
                                    blurOnSubmit={true}
                                />
                            </View>
                            <CustomButton style={{ marginTop: 30 }} text={'Save'} onPress={_handleSave} />
                        </View>
                    </ScrollView>
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
    inputText: {
        backgroundColor: 'white',
        height: 45,
        fontSize: 16,
        marginTop: 5,
        color: 'black',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderColor: '#D3D3D3',
        borderWidth: 1
    },
    textLabel: {
        fontWeight: 'bold',
        fontSize: 16
    },
    inputContainer: {
        marginTop: 10,
        padding: 10
    },
    textArea: {
        backgroundColor: 'white',
        height: 150,
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginTop: 10,
        ...(Platform.OS === "android"
            ? { textAlignVertical: "top" }
            : { paddingTop: 15 }),
        fontSize: 16,
        lineHeight: 24,
        overflow: 'hidden'
    },
});

export default ProfilePreference;