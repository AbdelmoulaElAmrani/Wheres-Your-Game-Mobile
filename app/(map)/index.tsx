import {Alert, Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import MapView, {PROVIDER_GOOGLE} from "react-native-maps";
import {StatusBar} from "expo-status-bar";
import React, {useEffect, useRef, useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {AntDesign, Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from "react-native-responsive-screen";
import Modal from "react-native-modal";
import {useSelector} from "react-redux";
import {UserSportResponse} from "@/models/responseObjects/UserSportResponse";
import {List, RadioButton} from "react-native-paper";
import {FlashList} from "@shopify/flash-list";
import Checkbox from "expo-checkbox";
import * as Location from 'expo-location';

enum Filters {
    SPORT,
    CATEGORY,
    SORTBY
}

interface RadioBoxFilter {
    id: string;
    value: string;
}

interface FilterState {
    category: RadioBoxFilter[];
    sortBy: RadioBoxFilter;
}

const sortByValues = [
    {id: 'PLTH', value: 'Price Low To High'},
    {id: 'PHTL', value: 'Price High To Low'},
    {id: 'BD', value: 'Best Deal'},
    {id: 'HEV', value: 'Hot Event'}] as RadioBoxFilter[];

const categoryValues = [
    {id: '5MR', value: '5 mile Radius'},
    {id: 'PRSM', value: 'Price Range Selection Monthly'},
    {id: 'Ratings', value: 'Ratings'},
    {id: 'Promos', value: 'Promos'},
    {id: 'FCAMPS', value: 'Free Camps'},
    {id: 'Training', value: 'Training'},
    {id: 'TEVENT', value: 'Last Minute Today Event'}] as RadioBoxFilter[];
const SportMap = () => {
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const userSports = useSelector((state: any) => state.user.userSport) as UserSportResponse[];
    const [selectedSportForSearch, setSelectedSportForSearch] = useState<UserSportResponse | undefined>();
    const [expandedFilter, setExpandedFilter] = useState<Filters | undefined>(Filters.SPORT);
    const [filter, setFilter] = useState<FilterState>({category: [], sortBy: {} as RadioBoxFilter});
    const [selectedSportId, setSelectedSportId] = useState<any>(null);
    //const [location, setLocation] = useState<any>(null);
    const mapRef = useRef<MapView>(null);


    useEffect(() => {
        (async () => {
            let {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            if (location?.coords) {
                const latitude = parseFloat(String(location.coords.latitude));
                const longitude = parseFloat(String(location.coords.longitude));

                const region = {
                    latitudeDelta: 0.0092,
                    longitudeDelta: 0.0092,
                    latitude,
                    longitude,
                };
                mapRef.current?.animateToRegion(region, 2000);
            }
        })();
    }, []);

    const _onGoBack = () => {
        if (router.canGoBack()) router.back();
    }
    const _hideModal = () => setModalVisible(false);
    const _openModal = () => setModalVisible(true);
    const _handleSearch = () => {
        console.log('search');
    }
    const _handleSelectedFilter = (filter: Filters) => {
        setExpandedFilter(old => old !== filter ? filter : undefined);
    }
    const _handleSelectedSport = (item: UserSportResponse) => {
        //setSelectedSportForSearch(item);
        setSelectedSportId(item.sportId);
    }
    const _handleSortByFilter = (item: RadioBoxFilter) => {
        setFilter(old => ({...old, sortBy: item}));
    }

    const _handleSelectedCategories = (item: RadioBoxFilter, value: boolean) => {
        setFilter(oldFilter => {
            return {
                ...oldFilter,
                category: value
                    ? [...oldFilter.category, item]
                    : oldFilter.category.filter(existingItem => existingItem.value !== item.value)
            };
        });
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <MapView
                ref={mapRef}
                showsUserLocation={true}
                onPress={Keyboard.dismiss}
                provider={PROVIDER_GOOGLE}
                style={StyleSheet.absoluteFill}/>

            <StatusBar style={"dark"}/>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={_onGoBack}>
                    <Ionicons name="chevron-back" size={35} color="black"/>
                </TouchableOpacity>
                <Text style={styles.headerText}>Map View</Text>
                <TouchableOpacity onPress={_openModal}>
                    <Ionicons name="filter-sharp" size={35} color="black"/>
                </TouchableOpacity>
            </View>

            <Modal backdropOpacity={0.1} onDismiss={_hideModal} isVisible={modalVisible}
                   style={styles.modalStyle} hideModalContentWhileAnimating={true}>
                <View style={styles.modalHeader}>
                    <View></View>
                    <Text style={{fontWeight: 'bold', fontSize: 18}}>Filters</Text>
                    <TouchableOpacity onPress={_hideModal}>
                        <AntDesign name="close" size={24} color="black"/>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{
                        height: 230,
                        width: 300
                    }}>
                    <List.Section>
                        <List.Accordion titleStyle={{
                            fontWeight: 'bold',
                            color: expandedFilter == Filters.SPORT ? 'white' : 'black'
                        }}
                                        style={[styles.dropDownContainer, {backgroundColor: expandedFilter == Filters.SPORT ? '#2757CB' : '#F8F9FA'}]}
                                        expanded={expandedFilter == Filters.SPORT}
                                        onPress={() => _handleSelectedFilter(Filters.SPORT)}
                                        title="Sports Listings">
                            <View style={{flex: 1, paddingVertical: 8, paddingHorizontal: 12}}>
                                <FlashList
                                    data={userSports}
                                    renderItem={({item, index}) => (
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <RadioButton
                                                color={'#2757CB'}
                                                value={item.sportId}
                                                status={selectedSportId === item.sportId ? 'checked' : 'unchecked'}
                                                onPress={() => _handleSelectedSport(item)}
                                            />
                                            <Text style={{fontSize: 16}}>{item.sportName}</Text>
                                        </View>
                                    )}
                                    keyExtractor={(item) => item.sportId.toString()}
                                    estimatedItemSize={50}
                                />
                            </View>
                        </List.Accordion>

                        <List.Accordion
                            titleStyle={{
                                fontWeight: 'bold',
                                color: expandedFilter == Filters.CATEGORY ? 'white' : 'black'
                            }}
                            style={[styles.dropDownContainer, {backgroundColor: expandedFilter == Filters.CATEGORY ? '#2757CB' : '#F8F9FA'}]}
                            expanded={expandedFilter == Filters.CATEGORY}
                            onPress={() => _handleSelectedFilter(Filters.CATEGORY)}
                            title="Category">
                            <View
                                style={{flex: 1, paddingVertical: 8, paddingHorizontal: 12}}>
                                <FlashList
                                    data={categoryValues}
                                    renderItem={({item, index}) => (
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginBottom: 5
                                        }}>
                                            <Checkbox
                                                style={{borderRadius: 5, borderColor: 'grey', marginRight: 10}}
                                                value={filter.category.some(x => x.id === item.id)}
                                                onValueChange={(value) => _handleSelectedCategories(item, value)}
                                            />
                                            <Text style={{fontSize: 16}}>{item.value}</Text>
                                        </View>
                                    )}
                                    keyExtractor={(item) => item.id}
                                    estimatedItemSize={50}
                                />
                            </View>
                        </List.Accordion>
                        <List.Accordion
                            titleStyle={{
                                fontWeight: 'bold',
                                color: expandedFilter == Filters.SORTBY ? 'white' : 'black'
                            }}
                            style={[styles.dropDownContainer, {backgroundColor: expandedFilter == Filters.SORTBY ? '#2757CB' : '#F8F9FA'}]}
                            expanded={expandedFilter == Filters.SORTBY}
                            onPress={() => _handleSelectedFilter(Filters.SORTBY)}
                            title="Sort By">
                            <View
                                style={{flex: 1, paddingVertical: 8, paddingHorizontal: 12}}>
                                <FlashList
                                    data={sortByValues}
                                    renderItem={({item, index}) => (
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <RadioButton
                                                color='#2757CB'
                                                value={item.id}
                                                status={filter.sortBy.id === item.id ? 'checked' : 'unchecked'}
                                                onPress={() => _handleSortByFilter(item)}
                                            />
                                            <Text style={{fontSize: 16}}>{item.value}</Text>
                                        </View>
                                    )}
                                    keyExtractor={(item) => item.id}
                                    estimatedItemSize={50}
                                />
                            </View>
                        </List.Accordion>
                    </List.Section>
                </ScrollView>
            </Modal>

            <View style={styles.searchButton}>
                <TouchableOpacity
                    onPress={_handleSearch}
                    style={styles.nextBtn}>
                    <Text style={styles.buttonText}>Search</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
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
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        width: '100%'
    },
    modalStyle: {
        backgroundColor: 'white',
        borderRadius: 20,
        alignSelf: "center",
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        position: "absolute",
        bottom: hp(30),
        padding: 10
    },
    dropDownContainer: {
        borderRadius: 10,
        height: 55
    },
    searchButton: {
        width: '100%',
        height: 100,
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        borderTopStartRadius: 40,
        borderTopEndRadius: 40,
        justifyContent: 'center'
    },
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
export default SportMap;