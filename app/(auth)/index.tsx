import {Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from 'react-native-safe-area-context';
import React, {useEffect, useState} from "react";
import {StatusBar} from 'expo-status-bar';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import Carousel from 'react-native-reanimated-carousel';
import LocalStorageService from "@/services/LocalStorageService";
import {router} from "expo-router";


const windowWidth = Dimensions.get('window').width;
const data = [
    {first: "All About sports", second: "SIGN UP FOR FREE ACCESS", third: "locate your next game"},
    {first: "explore new adventures", second: "JOIN THE COMMUNITY NOW", third: "discover your passion"},
    {first: "master your skills", second: "GET STARTED WITH OUR TUTORIALS", third: "find your next challenge"}];


const Intro = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const checkIntroViewed = async () => {
            const isIntroViewed = await LocalStorageService.getItem<boolean>('intro');
            if (isIntroViewed !== null) {
                router.replace("/Login");
            }
        };
        checkIntroViewed();
    }, []);

    const _navigateToLoginPage = (): void => {
        LocalStorageService.storeItem<boolean>("intro", true);
        router.replace("/Login");
    }

    return (
        <>
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
                        <View style={styles.introIconContainer}>
                            <Image source={require('../../assets/images/introIcon.png')}/>
                        </View>
                        <Text style={{fontWeight: 'bold', fontSize: 50, alignSelf: 'center'}}>Discover</Text>
                        <View>
                            <Carousel
                                loop={true}
                                width={windowWidth}
                                height={100}
                                autoPlay={true}
                                autoPlayInterval={2000}
                                onSnapToItem={index => setCurrentIndex(index)}
                                data={data}
                                scrollAnimationDuration={1000}
                                renderItem={({item}) => (
                                    <View style={styles.slide}>
                                        <Text style={styles.text}>{item.first}</Text>
                                        <Text style={styles.text}>{item.second}</Text>
                                        <Text style={styles.text}>{item.third}</Text>
                                    </View>
                                )}
                            />
                            <View style={styles.dotContainer}>
                                {data.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.dot,
                                            currentIndex === index ? styles.activeDot : styles.inactiveDot,
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={_navigateToLoginPage}
                            style={styles.nextBtn}>
                            <Text style={{fontSize: 20, color: 'white', textAlign: 'center'}}>Next</Text>
                        </TouchableOpacity>
                        <View style={{alignSelf: 'center', marginTop: 20}}>
                            <TouchableOpacity style={{alignSelf: 'center'}}>
                                <Text style={{color: '#3E4FEF', fontSize: 18}}>Create Account</Text>
                            </TouchableOpacity>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                marginTop: 10,
                                alignItems: 'center'
                            }}>
                                <Text style={{textAlign: 'center', fontSize: 18}}>
                                    Already have an account?
                                </Text>
                                <TouchableOpacity onPress={() => {/* Handle login navigation */
                                }}>
                                    <Text style={{color: '#3E4FEF', fontSize: 18, marginLeft: 5}}>
                                        Login
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    )
        ;
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
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: windowWidth,
    },
    text: {
        fontSize: 24,
        color: 'black',
    },
    dotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    dot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        marginHorizontal: 5,
        borderColor: 'grey',
        borderWidth: 1
    },
    activeDot: {
        backgroundColor: '#2757CB',
    },
    inactiveDot: {
        backgroundColor: 'white',
    },

});

export default Intro;