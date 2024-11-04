import React from 'react';
import {TouchableOpacity, View, Image, Text, StyleSheet} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {AntDesign} from "@expo/vector-icons";
import {router, useRouter} from "expo-router";
import {Player} from "@/models/Player";
import {Avatar} from "react-native-paper";

const PersonSearchCard = ({player}: { player: Player }) => {
    const _router = useRouter();
    const handleOpenPersonProfile = () => {
        _router.push({
            pathname: '(user)/UserProfile',
            params: {userId: player.id},
        });
    }

    // @ts-ignore
    return (
        <TouchableOpacity onPress={handleOpenPersonProfile} style={styles.container}>
            <View style={styles.row}>
                <View style={styles.image}>
                    {player?.imageUrl ? (<Image
                        source={{uri: player.imageUrl}}/>) : (<Avatar.Text
                        size={wp(13)}
                        label={(player?.firstName.charAt(0) + player?.lastName.charAt(0)).toUpperCase()}
                    />)}

                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{player.firstName} {player.lastName}</Text>
                    <Text style={styles.subtitle}>{player.position}</Text>
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
        marginRight: wp('3%'),
        justifyContent: 'center',
        alignItems: 'center'
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
