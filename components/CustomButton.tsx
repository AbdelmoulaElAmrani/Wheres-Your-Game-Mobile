import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { TextStyle, ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";


const CustomButton = ({ text, onPress, style, disabled = false, textStyle }: { text: string, onPress: () => void, style?: StyleProp<ViewStyle>, disabled?: boolean, textStyle?: StyleProp<TextStyle> }) => {

    const _handleClick = () => {
        onPress();
    }

    return <TouchableOpacity
        disabled={disabled}
        onPress={_handleClick}
        style={[styles.nextBtn, style]}>
        <Text style={[styles.buttonText, textStyle]}>{text}</Text>
    </TouchableOpacity>;
}

const styles = StyleSheet.create({
    nextBtn: {
        backgroundColor: "#2757CB",
        width: wp(80),
        height: 55,
        borderRadius: 30,
        alignSelf: "center",
        justifyContent: "center",
    },
    buttonText: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center'
    },
});

export default CustomButton;