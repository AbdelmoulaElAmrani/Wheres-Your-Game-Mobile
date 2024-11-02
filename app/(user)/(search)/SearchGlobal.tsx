import {FlatList, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {ImageBackground} from "expo-image";
import {router} from "expo-router";
import React, {useCallback, useEffect, useState} from "react";
import {Divider, Searchbar} from "react-native-paper";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import Spinner from "@/components/Spinner";
import TeamSearchCard from "@/components/Search/TeamSearchCard";
import {SearchGlobalResponse} from "@/models/SearchGlobalResponse";
import PersonSearchCard from "@/components/Search/PersonSearchCard";

enum searchOption {
    Teams,
    Players
}

const SearchGlobal = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<searchOption>(searchOption.Teams); // State to track selected option
    const [searchName, setSearchName] = useState<string>('');
    const [searchResult, setSearchResult] = useState<SearchGlobalResponse>({players: [], teams: []});


    useEffect(() => {
    }, []);

    const _handleGoBack = () => {
        if (router.canGoBack())
            router.back();
    }


    const _onSearchSubmit = useCallback(async () => {
        /*if (searchName.trim() === '') {
            if (people.length > 0) setPeople([]);
            return;
        }*/
        setLoading(true);
        //TODO:: Call the new api that will return data as Player[] and Teams: []
        //const data = await UserService.SearchUsersByFullName(searchName, searchType);
        /*if (data)
            setPeople(data);
        else
            setPeople([]);*/
        setLoading(false);
    }, [searchName]);


    const handleSelect = (option: searchOption) => {
        setSelectedOption(option);
    };

    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0];


    return (
        <ImageBackground
            style={{
                flex: 1,
                width: '100%',
            }}
            source={require('../../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                {loading && (
                    <Spinner visible={loading}/>
                )}
                <CustomNavigationHeader text={`Search           `}
                                        goBackFunction={_handleGoBack} showBackArrow/>

                <View style={styles.searchBarContainer}>
                    <Searchbar
                        placeholder='Search'
                        onChangeText={(value) => setSearchName(value)}
                        value={searchName}
                        onSubmitEditing={_onSearchSubmit}
                        returnKeyType='search'
                        clearButtonMode="while-editing"
                        placeholderTextColor="#808080"
                        iconColor="#808080"
                        style={styles.searchBar}
                    />
                </View>
                <View style={styles.mainContainer}>
                    <KeyboardAvoidingView
                        style={{width: '100%', height: '100%', paddingVertical: 10, paddingHorizontal: 8}}>
                        <View style={{width: '100%', marginBottom: hp('3%')}}>
                            <View>
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-around',
                                    alignItems: 'center',
                                    width: '100%',
                                }}>
                                    <TouchableOpacity onPress={() => handleSelect(searchOption.Teams)}>
                                        <Text
                                            style={[styles.text, selectedOption === searchOption.Teams && styles.selectedText]}>
                                            Teams
                                        </Text>
                                        {selectedOption === searchOption.Teams && <View style={styles.underline}/>}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleSelect(searchOption.Players)}>
                                        <Text
                                            style={[styles.text, selectedOption === searchOption.Players && styles.selectedText]}>
                                            Players
                                        </Text>
                                        {selectedOption === searchOption.Players && <View style={styles.underline}/>}
                                    </TouchableOpacity>
                                </View>
                                <Divider bold={true}
                                         style={{width: '90%', alignSelf: 'center', marginBottom: hp('2%')}}/>
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginHorizontal: wp('5%')
                                }}>
                                    <Text style={{fontSize: wp('4%'), fontWeight: 'bold'}}>
                                        Result for {selectedOption == searchOption.Teams ? 'Teams' : 'Player'}
                                    </Text>
                                    <Text style={{fontSize: wp('4%'), color: '#3E4FEF'}}>
                                        {selectedOption == searchOption.Teams ? searchResult.teams.length : searchResult.players.length} Results
                                        Found
                                    </Text>
                                </View>
                            </View>

                            <View style={{marginTop: hp('2%'), height: '75%'}}>
                                {selectedOption === searchOption.Teams ? (<FlatList
                                    contentContainerStyle={{
                                        width: '90%',
                                        alignSelf: 'center',
                                        paddingBottom: hp('10%'), // Ensure sufficient padding at the bottom
                                    }}
                                    data={data}
                                    ListFooterComponent={<View
                                        style={{height: hp('10%')}}/>}  // Extra space at the bottom
                                    renderItem={({item}) => <TeamSearchCard/>}
                                    keyExtractor={(item, index) => index.toString()}
                                />) : (<FlatList
                                    contentContainerStyle={{
                                        width: '90%',
                                        alignSelf: 'center',
                                        paddingBottom: hp('10%'), // Ensure sufficient padding at the bottom
                                    }}
                                    data={data}
                                    ListFooterComponent={<View
                                        style={{height: hp('10%')}}/>}  // Extra space at the bottom
                                    renderItem={({item}) => <PersonSearchCard/>}
                                    keyExtractor={(item, index) => index.toString()}
                                />)}
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: 'white',
        height: '100%',
        width: '100%',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20
    },
    searchBar: {
        backgroundColor: 'white'
    },
    searchBarContainer: {
        padding: 20,
        justifyContent: 'center'
    },
    text: {
        fontSize: 18,
        color: 'grey',
        marginBottom: 5
    },
    selectedText: {
        color: 'blue',
        fontWeight: 'bold',
    },
    underline: {
        height: 2,
        backgroundColor: 'blue',
        marginTop: 5,
    },
});


export default SearchGlobal;