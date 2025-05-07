import {useEffect, useState} from "react";
import {Text, View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {Avatar} from 'react-native-paper';
import {SafeAreaView} from "react-native-safe-area-context";
import {AntDesign, Octicons} from '@expo/vector-icons';
import {ImageBackground} from "expo-image";
import {router, useRouter} from "expo-router";
import {useDispatch, useSelector} from "react-redux";
import {getUserProfile, logout} from "@/redux/UserSlice";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {ActivityIndicator, MD2Colors} from 'react-native-paper';
import Gender from "@/models/Gender";
import UserType from "@/models/UserType";
import {UserService} from "@/services/UserService";
import Ionicons from '@expo/vector-icons/Ionicons';
import {AuthService} from "@/services/AuthService";
const Profile = () => {
    const dispatch = useDispatch()
    const userData = useSelector((state: any) => state.user.userData) as UserResponse;
    const loading = useSelector((state: any) => state.user.loading) as boolean;
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const _router = useRouter();

    useEffect(() => {
        (async () => {
            await dispatch(getUserProfile() as any)
        })()
    }, []);

    const _handleEditProfile = () => {
        _router.push({
            pathname: '/EditProfile',
            params: {data: 'profile'},
        });
    }

    const _handleLogout = async () => {
        dispatch(logout({}));
        await AuthService.logOut();
        router.replace('/Login');
    }

    const _handleDeleteAccount = async () => {
        Alert.alert(
            'Confirmation',
            'Are you sure you want to delete your account?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            const result = await UserService.deleteUserProfile();
                            if (result) {
                                _handleLogout();
                            } else {
                                Alert.alert('Error', 'Unable to delete your account. Please try again later.');
                            }
                        } catch (e) {
                            Alert.alert('Error', 'An error occurred while deleting your account.');
                        }
                    },
                    style: 'destructive',
                },
            ],
            {cancelable: false}
        );
    }

    const _refreshProfile = () => {
        setRefreshing(true)
        setTimeout(() => {
            setRefreshing(false)
        }, 3000);
    }


    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../assets/images/signupBackGround.jpg')}
        >
            <SafeAreaView>
                <View style={styles.userInfoContainer}>
                    {loading ? (
                        <ActivityIndicator animating={true} color={MD2Colors.blueA700} size={50}/>
                    ) : (
                        <>
                            {userData?.imageUrl ? (
                                <Avatar.Image size={100} source={{uri: userData.imageUrl}}/>
                            ) : (
                                <Avatar.Text
                                    size={100}
                                    label={(userData?.firstName?.charAt(0) + userData?.lastName?.charAt(0)).toUpperCase()}
                                />
                            )}
                            <View style={styles.userTextInfoContainer}>
                                <View style={styles.userInfoRow}>
                                    <Text style={styles.userName}>
                                        {userData.firstName} {userData.lastName.substring(0, 3)}.
                                    </Text>
                                    <TouchableOpacity onPress={() => _handleEditProfile()}>
                                        <Octicons name="pencil" size={24} color="white" style={styles.editIcon}/>
                                    </TouchableOpacity>
                                </View>
                                <Text
                                    style={styles.userInfo}>Age: {new Date().getFullYear() - new Date(userData.dateOfBirth).getFullYear()}</Text>
                                {userData.role != UserType[UserType.ORGANIZATION] && (
                                    <Text style={styles.userInfo}>
                                        Gender: {userData.gender === Gender.MALE ? "Male" : "Female"}
                                    </Text>
                                )}
                            </View>
                        </>
                    )
                    }
                </View>

                <View style={styles.cardContainer}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_refreshProfile}/>}
                        contentContainerStyle={{flexGrow: 1}} bounces={true}>
                        <View style={{
                            flex: 1,
                            justifyContent: 'center',
                            marginBottom: hp(20)
                        }}>
                            <Text style={styles.textSettings}>Settings</Text>

                            <TouchableOpacity
                                disabled={true}
                                style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Contact Information</Text>
                                <AntDesign name="right" size={24} color="grey"/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={true}
                                style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Location Settings</Text>
                                <AntDesign name="right" size={24} color="grey"/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={true}
                                style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Privacy Settings</Text>
                                <AntDesign name="right" size={24} color="grey"/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={true}
                                style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Notification Perfrences</Text>
                                <AntDesign name="right" size={24} color="grey"/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={true}
                                style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Account Type and Role</Text>
                                <AntDesign name="right" size={24} color="grey"/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={true}
                                style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Bio/About Me</Text>
                                <AntDesign name="right" size={24} color="grey"/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={true}
                                style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Skills and Interests</Text>
                                <AntDesign name="right" size={24} color="grey"/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={true}
                                style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Team Affiliation</Text>
                                <AntDesign name="right" size={24} color="grey"/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={true}
                                style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Achievements and Badges</Text>
                                <AntDesign name="right" size={24} color="grey"/>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={true}
                                style={styles.settingOption}>
                                <Text style={styles.settingOptionText}>Connection Settings</Text>
                                <AntDesign name="right" size={24} color="grey"/>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.settingOption, {backgroundColor: 'red'}]}
                                              onPress={_handleLogout}>
                                <Text style={[styles.settingOptionText, {color: 'white'}]}>Log Out</Text>
                                <AntDesign name="right" size={24} color="grey"/>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.settingOption, {backgroundColor: 'white'}]}
                                              onPress={_handleDeleteAccount}>
                                <Text style={[styles.settingOptionText, {color: 'red'}]}>Delete Account</Text>
                                <Ionicons name="warning-outline" size={24} color="red" />
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
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 1,
        backgroundColor: 'rgba(82,80,80,0.22)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    settingOptionText: {
        fontSize: 18,
        color: 'black',
        fontWeight: '600'
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    editIcon: {
        marginLeft: wp(5)
    }
});

export default Profile;

