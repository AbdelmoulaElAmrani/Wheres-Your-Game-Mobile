import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ImageBackground, Text, View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Avatar } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from '@expo/vector-icons';

const Profile = () => {
    const [user, setUser] = useState({
        name: 'John Doe',
        age: 25,
        email: 'jhon@gmail.com',
        phone: '1234567890',
        gender: 'Male',
        imageUrl: null//'http://www.cecyteo.edu.mx/Nova/App_themes/Nova2016/assets/pages/media/profile/profile_user.jpg'
    });


    return (
        <ImageBackground
            style={{ height: hp(100) }}
            source={require('../../assets/images/signupBackGround.jpg')}
        >
            <SafeAreaView>

                <View style={styles.userInfoContainer}>
                    
                    {user.imageUrl ? <Avatar.Image size={100} source={{ uri: user.imageUrl }} /> 
                    :<Avatar.Text size={100} label={user.name ? user.name[0] : ''} />}


                <View style={styles.userTextInfoContainer}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userInfo}>Age: {user.age}</Text>
                        <Text style={styles.userInfo}>Gender: {user.gender}</Text>
                    </View>
                </View>

                <View style={styles.cardContainer}>
                    <Text style={styles.textSettings}>Settings</Text>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={true}>
                        <View style={{
                            flex: 1,
                            justifyContent: 'center',
                            marginBottom: hp(20)
                        }}>
                            <TouchableOpacity style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Contact Information</Text>
                                <AntDesign name="right" size={24} color="grey" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Location Settings</Text>
                                <AntDesign name="right" size={24} color="grey" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Privacy Settings</Text>
                                <AntDesign name="right" size={24} color="grey" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Notification Perfrences</Text>
                                <AntDesign name="right" size={24} color="grey" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Account Type and Role</Text>
                                <AntDesign name="right" size={24} color="grey" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Bio/About Me</Text>
                                <AntDesign name="right" size={24} color="grey" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Skills and Interests</Text>
                                <AntDesign name="right" size={24} color="grey" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Team Affiliation</Text>
                                <AntDesign name="right" size={24} color="grey" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Achievements and Badges</Text>
                                <AntDesign name="right" size={24} color="grey" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Connection Settings</Text>
                                <AntDesign name="right" size={24} color="grey" />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}


const styles = StyleSheet.create({
    cardContainer: {
        width: wp('100'),
        height: hp('80'),
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 20,
        marginTop: hp(2)
    },
    userInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 20,
        marginTop: hp(3)
    },
    userTextInfoContainer: {
        flexDirection: 'column',
        marginLeft: wp('6%'),
        padding: 5
    },
    userName: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white'
    },
    userInfo: {
        fontSize: 18,
        color: 'white',
        marginTop: 9
    },
    textSettings: {
        fontSize: 20,
        fontWeight: '800',
        color: 'black',
        marginTop: hp(1),
        marginBottom: hp(2)
    },
    settingsScrollView: {
        marginTop: hp(2),
    },
    settingOption: {
        borderWidth: 0.5,
        borderColor: '#E9EDF9',
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        shadowColor: '#E9EDF9',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 1,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    settingOptionText: {
        fontSize: 18,
        color: 'black',
        fontWeight: '600'
    }
});

export default Profile;

