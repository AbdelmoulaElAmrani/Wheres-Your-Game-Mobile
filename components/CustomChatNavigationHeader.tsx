import {Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Entypo, Ionicons} from '@expo/vector-icons';
import {router} from "expo-router";
import {widthPercentageToDP} from "react-native-responsive-screen";
import React from "react";


interface CustomChatNavigationHeaderProps {
    title: string,
    role: string | undefined,
    blockFunction?: () => void,
    isBlocked: boolean | undefined,
}

const CustomChatNavigationHeader: React.FC<CustomChatNavigationHeaderProps> = ({
                                                                                   title,
                                                                                   role,
                                                                                   blockFunction,
                                                                                   isBlocked = false
                                                                               }) => {

    const _handleGoBack = (): void => {
        if (router.canGoBack())
            router.back();
    }

    const _handleBlock = (): void => {
        if (blockFunction != null && !isBlocked)
            blockFunction();
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={_handleGoBack}>
                <Ionicons name="chevron-back" size={35} color="white"/>
            </TouchableOpacity>
            <TouchableOpacity disabled={isBlocked}>
                <Text numberOfLines={1} style={styles.text}>{title}</Text>
                <Text style={{color: 'white', textAlign: 'center', marginTop: 4}}>{role}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={_handleBlock}>
                <Entypo name="block" size={25} color={isBlocked ? "red" : "grey"}/>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flexDirection: 'row',
        height: 80,
        alignItems: "center",
        justifyContent: "space-between",
    },
    text: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 22,
        textAlign: 'center'
    },
});

export default CustomChatNavigationHeader;