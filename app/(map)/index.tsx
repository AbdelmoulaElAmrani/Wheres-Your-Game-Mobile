import {Image, Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import MapView from "react-native-maps";
import {StatusBar} from "expo-status-bar";
import React, {useEffect, useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {AntDesign, Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from "react-native-responsive-screen";
import Modal from "react-native-modal";
import {useSelector} from "react-redux";
import {UserSportResponse} from "@/models/responseObjects/UserSportResponse";
import {List} from "react-native-paper";

enum Filters {
    SPORT,
    CATEGORY,
    SORTBY
}

const SportMap = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const userSports = useSelector((state: any) => state.user.userSport) as UserSportResponse[];
    const [selectedSportForSearch, setSelectedSportForSearch] = useState<UserSportResponse[]>([]);
    const [expandedFilter, setExpandedFilter] = useState<Filters | undefined>(Filters.SPORT);


    const _onGoBack = () => {
        if (router.canGoBack()) router.back();
    }

    const _hideModal = () => {
        setModalVisible(false);
    }

    const _openModal = () => {
        setModalVisible(true);
    }

    const _handleSearch = () => {

    }

    const _onSelectSportForSearch = (selectedItem: UserSportResponse) => {
        setSelectedSportForSearch(currentSelectedSports => {
            const isFound = currentSelectedSports.some(_ => _.sportId == selectedItem.sportId);
            if (!isFound) return [...currentSelectedSports, selectedItem];
            else return currentSelectedSports.filter(_ => _.sportId != selectedItem.sportId);
        });
    }

    const _handleSelectedFilter = (filter: Filters) => {
        setExpandedFilter(old => expandedFilter !== filter ? filter : undefined);
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark"/>
            <MapView
                onPress={Keyboard.dismiss}
                provider={"google"}
                style={StyleSheet.absoluteFill}>
                <SafeAreaView>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={_onGoBack}>
                            <Ionicons name="chevron-back" size={35} color="black"/>
                        </TouchableOpacity>
                        <Text style={styles.headerText}>Map View</Text>
                        <TouchableOpacity onPress={_openModal}>
                            <Ionicons name="filter-sharp" size={35} color="black"/>
                        </TouchableOpacity>
                    </View>
                    {/* Remove it from this version */}
                    {/*<View style={styles.bodyContainer}>
                        <View style={styles.adsImageContainer}>
                            <Image resizeMode={"contain"} source={require('../../assets/images/mapAds.png')}/>
                        </View>
                        <TextInput
                            placeholder="Search Football Club"
                            style={styles.searchBar}
                            textColor='black'
                            onChangeText={(value) => setSearchQuery(value)}
                            value={searchQuery}
                            placeholderTextColor='#9BA0AB'
                            error={false}
                            underlineColor="transparent"
                            left={<TextInput.Icon size={40} onPress={_handleSearch} color='#2757CB' icon="magnify"/>}
                            right={<TextInput.Icon size={40} onPress={_openModal} color='#2757CB' icon="tune-vertical"/>}
                        />
                    </View>*/}
                    <Modal backdropOpacity={0.1} onDismiss={_hideModal} isVisible={modalVisible}
                           style={styles.modalStyle} hideModalContentWhileAnimating={true}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%',
                            marginTop: 3
                        }}>
                            <View></View>
                            <Text style={{fontWeight: 'bold', fontSize: 18}}>Filters</Text>
                            <TouchableOpacity onPress={_hideModal}>
                                <AntDesign name="close" size={24} color="black"/>
                            </TouchableOpacity>
                        </View>
                        <ScrollView
                            style={{
                                height: 230,
                                width: 300
                            }}
                        >
                            <List.Section>
                                <List.Accordion titleStyle={{fontWeight: 'bold', color: 'black'}}
                                                style={{borderRadius: 10}}
                                                expanded={expandedFilter == Filters.SPORT}
                                                onPress={() => _handleSelectedFilter(Filters.SPORT)}
                                                title="Sports Listings">
                                    <List.Item title="First item"/>
                                    <List.Item title="Second item"/>
                                </List.Accordion>

                                <List.Accordion
                                    titleStyle={{fontWeight: 'bold', color: 'black'}}
                                    expanded={expandedFilter == Filters.CATEGORY}
                                    onPress={() => _handleSelectedFilter(Filters.CATEGORY)}
                                    title="Category">
                                    <List.Item title="First item"/>
                                    <List.Item title="Second item"/>
                                </List.Accordion>
                                <List.Accordion
                                    titleStyle={{fontWeight: 'bold', color: 'black'}}
                                    expanded={expandedFilter == Filters.SORTBY}
                                    onPress={() => _handleSelectedFilter(Filters.SPORT)}
                                    title="Sort By">
                                    <List.Item title="First item"/>
                                    <List.Item title="Second item"/>
                                </List.Accordion>
                            </List.Section>
                        </ScrollView>
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
    headerContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    headerText: {
        color: 'black',
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
        borderWidth: 1,
        borderTopStartRadius: 30,
        borderTopEndRadius: 30,
        borderBottomStartRadius: 30,
        borderBottomEndRadius: 30,
    },
    adsImageContainer: {
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
        height: 270,
        width: 330,
        borderRadius: 20,
        alignSelf: "center",
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        position: "absolute",
        bottom: hp(30),
        padding: 10
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
    list: {
        marginTop: 20,
    },
    search: {},
    selectedFilterTitle: {
        fontWeight: 'bold',
        color: 'white'
    },
    filterTitle: {
        color: 'black'
    },
    selectedFilterContainer: {
        backgroundColor: '#2757CB'
    }
});
export default SportMap;