import {StyleSheet, Text, TouchableOpacity} from "react-native";
import React from "react";
import {widthPercentageToDP as wp} from "react-native-responsive-screen";
import {StyleProp} from "react-native/Libraries/StyleSheet/StyleSheet";
import {ViewStyle} from "react-native/Libraries/StyleSheet/StyleSheetTypes";

const CustomButton = ({text, onPress, style}: { text: string, onPress: () => void, style?: StyleProp<ViewStyle> }) => {
    return <TouchableOpacity
        onPress={onPress}
        style={[styles.nextBtn, style]}>
        <Text style={{fontSize: 20, color: 'white', textAlign: 'center'}}>{text}</Text>
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
});

export default CustomButton;