import React from 'react';
import {TouchableOpacity, View, Image, Text, StyleSheet} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {AntDesign} from "@expo/vector-icons";
import {router} from "expo-router";

const PersonSearchCard = ({player = null}) => {

    const handleOpenPersonProfile = () => {
        // Add functionality here
        router.push('/UserProfile');
    }

    // @ts-ignore
    return (
        <TouchableOpacity onPress={handleOpenPersonProfile} style={styles.container}>
            <View style={styles.row}>
                {/*TODO:: uncommant it later*/}
                {/*{player?.imgUrl ? (
                    <Image
                        style={styles.image}
                        source={{uri: 'https://static.vecteezy.com/system/resources/previews/011/049/345/non_2x/soccer-football-badge-logo-sport-team-identity-illustrations-isolated-on-white-background-vector.jpg'}}/>

                ) : (
                    <Avatar.Text
                        size={60}
                        label={(player?.name.charAt(0) + player?.name.charAt(1)).toUpperCase()}
                    />
                )}*/}
                <Image
                    style={styles.image}
                    source={{uri: 'https://static.vecteezy.com/system/resources/previews/011/049/345/non_2x/soccer-football-badge-logo-sport-team-identity-illustrations-isolated-on-white-background-vector.jpg'}}/>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Chris Conn-Clarke</Text>
                    <Text style={styles.subtitle}>Midfielder</Text>
                </View>
                <AntDesign name="right" size={wp('6%')} color="grey"/>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        padding: wp('1%'),
        borderColor: '#d3d3d3',
        borderRadius: 10,
        width: '100%',
        backgroundColor: '#fff',
        marginBottom: hp('1.5%'),
        shadowColor: 'grey',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: wp('13%'),
        height: wp('13%'),
        borderRadius: 5,
        resizeMode: 'cover',
        borderColor: 'grey',
        borderWidth: 0.2,
        marginRight: wp('3%')
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: wp('4.2%'),
        color: '#000',
    },
    subtitle: {
        color: 'grey',
        fontSize: wp('3.5%'),
        marginTop: hp('0.3%'),
    },
});

export default PersonSearchCard;
