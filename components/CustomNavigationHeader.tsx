import {Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from '@expo/vector-icons';
import {router} from "expo-router";

const CustomNavigationHeader = ({text, showSkip, skipNavigation, showLogo = false}: {
    text?: string,
    showSkip?: boolean,
    skipNavigation?: () => void,
    showLogo?: boolean
}) => {

    const _handleGoBack = (): void => {
        if (router.canGoBack())
            router.back();
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={_handleGoBack}>
                <Ionicons name="chevron-back" size={35} color="white"/>
            </TouchableOpacity>
            <View>
                {showLogo ?
                    <Image source={require('../assets/images/ballwithoutText.png')}/>
                    :
                    <Text style={styles.text}>{text}</Text>
                }
            </View>
            {showSkip ?
                <TouchableOpacity>
                    <Text style={styles.textSkip}>Skip</Text>
                </TouchableOpacity>
                :
                <View></View>
            }
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
        fontSize: 30
    },
    textSkip: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 20,
    },
});

export default CustomNavigationHeader;