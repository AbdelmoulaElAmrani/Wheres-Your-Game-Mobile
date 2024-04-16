import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import MapView from "react-native-maps";
import {StatusBar} from "expo-status-bar";
import React, {useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";
import {Searchbar} from "react-native-paper";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from "react-native-responsive-screen";
import Modal from "react-native-modal";
import CustomButton from "@/components/CustomButton";
import {useSelector} from "react-redux";
import {UserSportResponse} from "@/models/responseObjects/UserSportResponse";
import {FlashList} from "@shopify/flash-list";
import Checkbox from "expo-checkbox";

const mapStyle = [
    {
        "elementType": "geometry",
        "stylers": [{"color": "#f5f5f5"}]
    },
    {
        "elementType": "labels.icon",
        "stylers": [{"visibility": "off"}]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{"color": "#616161"}]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [{"color": "#f5f5f5"}]
    },
];

const SportMap = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const userSports = useSelector((state: any) => state.user.userSport) as UserSportResponse[];
    const [selectedSportForSearch, setSelectedSportForSearch] = useState<UserSportResponse[]>([]);
    const _onGoBack = () => {
        if (router.canGoBack()) router.back();
    }

    const _hideModal = () => {
        setModalVisible(false);
    }

    const _openModal = () => {
        setModalVisible(true);
    }

    const _onSelectSportForSearch = (selectedItem: UserSportResponse) => {
        setSelectedSportForSearch(currentSelectedSports => {
            const isFound = currentSelectedSports.some(_ => _.sportId == selectedItem.sportId);
            if (!isFound) return [...currentSelectedSports, selectedItem];
            else return currentSelectedSports.filter(_ => _.sportId != selectedItem.sportId);
        });
    }


    return (
        <View style={styles.container}>
            <StatusBar style="light"/>
            <MapView
                customMapStyle={mapStyle}
                //provider={"google"}
                style={styles.map}>
                <SafeAreaView>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={_onGoBack}>
                            <Ionicons name="chevron-back" size={35} color="white"/>
                        </TouchableOpacity>
                        <Text style={styles.headerText}>Map View</Text>
                        <View></View>
                    </View>
                    <View style={styles.bodyContainer}>
                        <View style={styles.adsImageContainer}>
                            <Image resizeMode={"contain"} source={require('../../assets/images/mapAds.png')}/>
                        </View>
                        <Searchbar
                            placeholder="Search FootBall Club"
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            placeholderTextColor="#808080"
                            iconColor="#3E4FEF"
                            style={styles.searchBar}
                        />
                    </View>
                    <Modal onDismiss={_hideModal} isVisible={modalVisible} style={styles.modalStyle}>
                        <Text>Sports Listings</Text>
                        <FlashList
                            data={userSports}
                            renderItem={({item}) => {
                                const isSelected = selectedSportForSearch.some(sport => sport.sportId == item.sportId);
                                return (
                                    <TouchableOpacity
                                        style={styles.listItem}
                                        onPress={() => _onSelectSportForSearch(item)}
                                        activeOpacity={0.8}>
                                        <Checkbox
                                            value={isSelected}
                                            color={isSelected ? '#4630EB' : undefined}
                                        />
                                        <Text style={styles.text}>{item.sportName}</Text>
                                    </TouchableOpacity>
                                );
                            }}
                            keyExtractor={item => item.sportId}
                            estimatedItemSize={50}
                        />
                    </Modal>
                </SafeAreaView>
            </MapView>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        height: '100%',
        width: '100%'
    },
    headerContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    headerText: {
        color: 'white',
        fontSize: 18,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 0},
        shadowRadius: 10,
        shadowOpacity: 0.3,
        fontWeight: 'bold'
    },
    searchBar: {
        backgroundColor: 'white',
        width: wp(85),
        alignSelf: 'center',
        borderColor: 'grey',
        borderWidth: 1
    },
    adsImageContainer: {
        //backgroundColor: 'white',
        height: 90,
        width: wp(85),
        borderRadius: 10,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    bodyContainer: {
        marginTop: 20
    },
    modalStyle: {
        backgroundColor: 'white',
        maxHeight: 270,
        minHeight: hp(32),
        maxWidth: 350,
        minWidth: wp(90),
        borderRadius: 20,
        alignSelf: "center",
        position: "absolute",
        bottom: hp(8)
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 16,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        padding: 8,
    },
    text: {
        marginLeft: 8,
        fontSize: 18,
    },
    list: {
        marginTop: 20,
    },
});
export default SportMap;