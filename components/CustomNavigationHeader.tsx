import {Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from '@expo/vector-icons';
import {router} from "expo-router";
import {widthPercentageToDP} from "react-native-responsive-screen";

const CustomNavigationHeader = ({
                                    text,
                                    showBackArrow = true,
                                    showSkip = false,
                                    skipNavigation,
                                    showLogo = false,
                                    goBackFunction
                                }: {
    text?: string,
    showSkip?: boolean,
    skipNavigation?: () => void,
    showLogo?: boolean,
    goBackFunction?: () => void | undefined,
    showBackArrow: boolean
}) => {

    const _handleGoBack = (): void => {
        if (goBackFunction != null) {
            goBackFunction();
        } else {
            if (router.canGoBack())
                router.back();
        }
    }

    const _handleSkip = (): void => {
        if (skipNavigation != null)
            _handleSkip();
    }

    return (
        <View style={styles.container}>
            {showBackArrow ? <TouchableOpacity onPress={_handleGoBack}>
                <Ionicons name="chevron-back" size={35} color="white"/>
            </TouchableOpacity> : <View></View>}
            <View style={showSkip ? {} : {marginRight: widthPercentageToDP('8%')}}>
                {showLogo ?
                    <Image source={require('../assets/images/ballwithoutText.png')}/>
                    :
                    <Text
                        numberOfLines={1}
                        style={styles.text}>{text}</Text>
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
        fontSize: 22,
        textAlign: 'center'
    },
    textSkip: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 18,
    },
});

export default CustomNavigationHeader;