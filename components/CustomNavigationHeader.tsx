import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";

const CustomNavigationHeader = ({ text, showBackArrow = true, showSkip = false, skipNavigation, showLogo = false, goBackFunction }: {
    text?: string,
    showSkip?: boolean,
    skipNavigation?: () => void,
    showLogo?: boolean,
    goBackFunction?: () => void | undefined,
    showBackArrow: boolean
}) => {

    const _handleGoBack = (): void => {
        if (goBackFunction != null && goBackFunction != undefined) {
            goBackFunction();
        } else {
            if (router.canGoBack())
                router.back();
        }
    }

    const _handleSkip = (): void => {
        if (skipNavigation != null && skipNavigation != undefined)
            _handleSkip();
    }

    return (
        <View style={styles.container}>
            {showBackArrow ?   <TouchableOpacity onPress={_handleGoBack}>
                <Ionicons name="chevron-back" size={35} color="white" />
            </TouchableOpacity> : <View></View>}
            <View>
                {showLogo ?
                    <Image source={require('../assets/images/ballwithoutText.png')} />
                    :
                    <Text style={styles.text}>{text}</Text>
                }
            </View>
            {showSkip ?
                <TouchableOpacity
                    onPress={_handleSkip}
                >
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
        fontSize: 25
    },
    textSkip: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 20,
    },
});

export default CustomNavigationHeader;