import {Image, ImageBackground} from "expo-image";
import {heightPercentageToDP as hp, widthPercentageToDP} from "react-native-responsive-screen";
import {SafeAreaView} from "react-native-safe-area-context";
import Spinner from "@/components/Spinner";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import React, {useEffect, useState} from "react";
import {router} from "expo-router";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Divider} from "react-native-paper";

export const UserProfile = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const _handleGoBack = () => {
        if (router.canGoBack())
            router.back();
    }

    useEffect(() => {
        //TODO:: CALL Service get player by Id
    }, []);

    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                {loading && (
                    <Spinner visible={loading}/>
                )}
                <CustomNavigationHeader text={'Player'} goBackFunction={_handleGoBack} showBackArrow/>

                <View style={styles.mainContainer}>
                    <View style={styles.profileImageContainer}>
                        <Image style={styles.imageContainer}
                               source={'https://img.chelseafc.com/image/upload/f_auto,h_390,q_90/editorial/people/first-team/2024-25/Jadon_Sancho_profile_2024-25_headshot-removebg.png'}/>
                        <View style={styles.infoContainer}>
                            <Text style={{fontWeight: 'bold', fontSize: 18}}>Chris Conn-Clarke</Text>
                            <Text style={{color: 'grey', fontSize: 16, marginTop: 5}}>San Antonio, Texas</Text>
                        </View>
                    </View>
                    <View style={styles.bioContainer}>
                        <Text style={{fontWeight: 'bold', fontSize: 16}}>Bio:</Text>
                        <Text style={{fontSize: 14, textAlign: 'center'}}>Text field for short bio description</Text>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '90%',
                        marginTop: hp(2)
                    }}>
                        <TouchableOpacity>
                            <Text
                                style={[styles.selectionText, styles.selectedText]}>
                                Overview
                            </Text>
                            <View style={styles.underline}/>
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Text
                                style={[styles.selectionText, styles.selectedText]}>
                                Videos
                            </Text>
                            <View style={styles.underline}/>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text
                                style={[styles.selectionText, styles.selectedText]}>
                                Sports Profile
                            </Text>
                            <View style={styles.underline}/>
                        </TouchableOpacity>
                    </View>
                    <Divider bold={true} style={{width: '90%', alignSelf: 'center', marginBottom: hp('2%')}}/>
                    <View style={{width: '90%'}}>
                        <>
                            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                                <View style={styles.infoMiniCard}>
                                    <Text style={styles.infoTitle}>Sports Focus</Text>
                                    <Text style={styles.infoText}>Soccer</Text>
                                </View>
                                <View style={styles.infoMiniCard}>
                                    <Text style={styles.infoTitle}>Age</Text>
                                    <Text style={styles.infoText}>22 Years</Text>
                                </View>
                                <View style={styles.infoMiniCard}>
                                    <Text style={styles.infoTitle}>Positions</Text>
                                    <Text style={styles.infoText}>Midfilder</Text>
                                </View>
                            </View>
                            <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: 20}}>
                                <View style={styles.infoMiniCard}>
                                    <Text style={styles.infoTitle}>Skills Focus</Text>
                                    <Text style={styles.infoText}>Advance</Text>
                                </View>
                                <View style={styles.infoMiniCard}>
                                    <Text style={styles.infoTitle}>Followers</Text>
                                    <Text style={styles.infoText}>500</Text>
                                </View>
                            </View>
                        </>
                        {/*<View></View>
                        <View></View>*/}
                        <TouchableOpacity style={styles.followBtn}>
                            <Text style={{color: 'white', fontSize: 16}}>Follow</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    )
        ;
}


const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: 'white',
        height: '100%',
        width: '100%',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        alignItems: 'center'
    },
    profileImageContainer: {
        backgroundColor: 'white',
        height: 300,
        width: '90%',
        marginTop: hp(2),
        borderRadius: 15,
        shadowColor: 'grey',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    imageContainer: {
        height: '70%',
        width: '100%',
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        resizeMode: "contain",
        backgroundColor: 'blue'
    },
    infoContainer: {
        alignItems: 'center',
        marginTop: 15
    },
    bioContainer: {
        backgroundColor: 'white',
        height: 80,
        width: '90%',
        marginTop: hp(2),
        borderRadius: 15,
        shadowColor: 'grey',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
        padding: 10
    },
    selectedText: {
        color: 'blue',
        fontWeight: 'bold',
    },
    selectionText: {
        fontWeight: 'bold',
        fontSize: 16
    },
    underline: {
        height: 2,
        backgroundColor: 'blue',
        marginTop: 5,
    },
    infoMiniCard: {
        borderWidth: 0.5,
        padding: 12,
        backgroundColor: 'white',
        alignItems: 'center',
        borderRadius: 10,
        shadowColor: 'grey',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        borderColor: 'grey',
        width: widthPercentageToDP('28%'),
        maxWidth: 110,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    infoText: {
        fontWeight: 'bold',
        color: 'blue',
        fontSize: 14,
        marginTop: 5
    },
    followBtn: {
        backgroundColor: 'blue',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 20,
        width: 150,
        padding: 10,
        borderRadius: 15,
        alignItems: 'center'
    }
});

export default UserProfile;