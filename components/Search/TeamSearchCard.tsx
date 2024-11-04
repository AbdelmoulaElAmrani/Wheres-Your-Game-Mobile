import React from 'react';
import {TouchableOpacity, View, Image, Text, StyleSheet} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {router, useRouter} from "expo-router";
import {any} from "prop-types";
import {Team} from "@/models/Team";
import {Avatar} from "react-native-paper";

const TeamSearchCard = ({team}: { team: Team }) => {
    const _router = useRouter();

    const _handleOpenTeamProfile = () => {
        _router.push({
            pathname: '(team)/TeamProfile',
            params: {teamId: team.id},
        });
    }

    return (
        <TouchableOpacity
            onPress={_handleOpenTeamProfile}
            style={styles.container}>
            <View style={styles.imageContainer}>
                {team.imgUrl ? (<Image
                    style={styles.image}
                    source={{uri: team.imgUrl}}
                />) : (
                    <Avatar.Text
                        size={wp(15)}
                        label={(() => {
                            const nameParts = team.name.trim().split(' ').filter(Boolean);
                            if (nameParts.length >= 2) {
                                // Take the first character of each part and combine them
                                return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
                            } else {
                                // If there is only one word, take the first two characters
                                return (team.name.charAt(0) + team.name.charAt(1)).toUpperCase();
                            }
                        })()}/>
                )}
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{team.name}</Text>
                <Text style={styles.subtitle}>
                    {team?.address ? team.address : ""}{team?.address && team?.country ? ", " : ""}{team?.country ? team.country : ""}
                </Text>

            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        padding: wp('3%'), // Use width percentage for padding
        borderColor: '#d3d3d3',
        borderRadius: 10,
        width: '100%',
        backgroundColor: '#fff', // Add background for better visuals
        marginBottom: hp('2%'), // Use height percentage for bottom margin
        shadowColor: 'grey',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 5,
        // Elevation for Android
        elevation: 5,
    },
    imageContainer: {
        //borderWidth: 1,
        borderColor: '#d3d3d3',
        borderRadius: 5,
        marginRight: wp('5%'), // Use width percentage for margin
        padding: wp('0.5%'), // Add some padding inside the image container
    },
    image: {
        width: wp('15%'), // Image width based on screen width percentage
        height: wp('15%'), // Image height equal to its width for a square image
        borderRadius: 3,
        resizeMode: 'cover', // Ensure the image covers the entire area
    },
    textContainer: {
        flex: 1, // Text container takes up the remaining space
        justifyContent: 'center',
    },
    title: {
        fontWeight: 'bold',
        fontSize: wp('4.5%'), // Responsive font size based on width percentage
        color: '#000',
    },
    subtitle: {
        color: 'grey',
        fontSize: wp('3.5%'), // Responsive subtitle font size
        marginTop: hp('0.5%'), // Vertical margin using height percentage
    },
});

export default TeamSearchCard;
