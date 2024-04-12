import {Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from 'react-native-safe-area-context';
import React, {useEffect, useState} from "react";
import {StatusBar} from 'expo-status-bar';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import Carousel from 'react-native-reanimated-carousel';
import LocalStorageService from "@/services/LocalStorageService";
import {router} from "expo-router";
import CustomButton from "@/components/CustomButton";
import {useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {Helpers} from "@/constants/Helpers";


const windowWidth = Dimensions.get('window').width;
const data = [
    {
        img: require('../../assets/images/introIcon.png'),
        title: 'Discover',
        first: "All About sports",
        second: "SIGN UP FOR FREE ACCESS",
        third: "locate your next game"
    },
    {
        img: require('../../assets/images/introIcon2.png'),
        title: 'Sign Up',
        first: "explore new adventures",
        second: "GET STARTED WITH OUR TUTORIALS",
        third: "discover your passion"
    },
    {
        img: require('../../assets/images/introIcon3.png'),
        title: 'Enroll',
        first: "Enroll yourself/child/both to stay ",
        second: "JOIN THE COMMUNITY NOW",
        third: "find your next challenge"
    }];


const Intro = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const user = useSelector((state: any) => state.user.userData) as UserResponse;

    useEffect(() => {
        const checkIntroViewed = async () => {
            if (!Helpers.isObjectNullOrEmpty(user)) {
                console.log('user found auth index', user);
                router.replace("/(tabs)/");
            } else {
                const isIntroViewed = await LocalStorageService.getItem<boolean>('intro');
                if (isIntroViewed !== null) {
                    //TODO:: Remove the comment later
                    //router.replace("/Login");
                }
            }
        };
        checkIntroViewed();
    }, [user]);


    const _navigateToLoginPage = (): void => {
        LocalStorageService.storeItem<boolean>("intro", true);
        router.replace("/Login");
    }

    return (
        <>
            <StatusBar style="dark"/>
            <SafeAreaView style={{flex: 1, backgroundColor: styles.container.backgroundColor}}>
                <ScrollView bounces={false}>
                    <View style={styles.container}>
                        <View style={styles.headerContainer}>
                            <Image style={styles.logoContainer}
                                   source={require('../../assets/images/ballwithoutText.png')}/>
                            <TouchableOpacity
                                onPress={_navigateToLoginPage}
                                style={styles.skipButton}>
                                <Text style={styles.skipText}>Skip</Text>
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Carousel
                                loop={true}
                                width={windowWidth}
                                height={530}
                                autoPlay={true}
                                autoPlayInterval={2000}
                                onSnapToItem={index => setCurrentIndex(index)}
                                data={data}
                                scrollAnimationDuration={1000}
                                renderItem={({item}) => (
                                    <View style={styles.slide}>
                                        <View style={styles.introIconContainer}>
                                            <Image source={item.img}/>
                                        </View>
                                        <Text style={{
                                            fontWeight: 'bold',
                                            fontSize: 50,
                                            alignSelf: 'center'
                                        }}>{item.title}</Text>
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
                        <CustomButton style={{marginTop: 10}} text={"Next"} onPress={_navigateToLoginPage}/>
                        <View style={{alignSelf: 'center', marginTop: 20}}>
                            <TouchableOpacity
                                onPress={() => router.replace('/Register')}
                                style={{alignSelf: 'center'}}>
                                <Text style={{color: '#3E4FEF', fontSize: 18}}>Create Account</Text>
                            </TouchableOpacity>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                marginTop: 10,
                                alignItems: 'center'
                            }}>
                                <Text style={{textAlign: 'center', fontSize: 18}}>
                                    Already have an account ?
                                </Text>
                                <TouchableOpacity onPress={_navigateToLoginPage}>
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
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
        marginTop: 4
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
        fontSize: 20,
        color: 'black',
    },
    dotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20
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