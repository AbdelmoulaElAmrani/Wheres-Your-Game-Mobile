import {ScrollView, StyleSheet, View} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";

const CustomCard = ({}) => {
    return (
        <ScrollView bounces={false}>
            <View style={styles.cardBox}>
                <View style={styles.cardBoxHeader}>

                </View>
                <View style={styles.cardBoxBody}>

                </View>
            </View>
        </ScrollView>);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(12,73,7,0.90)',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: wp('100'),
        minHeight: hp('100'),
    },
    cardBox: {
        width: wp(90),
        height: hp(80),
        backgroundColor: 'white',
        borderRadius: 20,
        marginTop: -50
    },
    cardBoxHeader: {
        flexDirection: "row",
        marginTop: 15,
        flex: 0.05,
    },
    cardBoxBody: {
        flex: 0.94,
        marginTop: 15,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
    },
});

export default CustomCard;