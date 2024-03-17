import {StyleSheet, Text, TouchableOpacity} from "react-native";
import React from "react";
import {widthPercentageToDP as wp} from "react-native-responsive-screen";

const CustomButton = ({text, onPress}: { text: string, onPress: () => void }) => {
    return <TouchableOpacity
        onPress={onPress}
        style={styles.nextBtn}>
        <Text style={{fontSize: 20, color: 'white', textAlign: 'center'}}>{text}</Text>
    </TouchableOpacity>;
}

const styles = StyleSheet.create({
    nextBtn: {
        backgroundColor: "#2757CB",
        width: wp(80),
        height: 55,
        borderRadius: 30,
        marginTop: 20,
        alignSelf: "center",
        justifyContent: "center",
    },
});

export default CustomButton;