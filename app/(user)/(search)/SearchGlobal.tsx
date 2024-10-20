import {KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {Image, ImageBackground} from "expo-image";
import {router} from "expo-router";
import React, {useCallback, useEffect, useState} from "react";
import {Searchbar} from "react-native-paper";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import Spinner from "@/components/Spinner";
import {UserService} from "@/services/UserService";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import UserType from "@/models/UserType";
import {useRoute} from "@react-navigation/core";
import {useSelector} from "react-redux";
import TeamSearchCard from "@/components/TeamSearchCard";


const SearchGlobal = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const currentUser = useSelector((state: any) => state.user.userData) as UserResponse;
    const [searchType, setSearchType] = useState<UserType>();
    const route = useRoute();


    useEffect(() => {
    }, []);

    const _handleGoBack = () => {
        if (router.canGoBack())
            router.back();
    }

    const [searchName, setSearchName] = useState<string>('');
    const [people, setPeople] = useState<UserSearchResponse[]>([]);

    const _onSearchSubmit = useCallback(async () => {
        if (searchName.trim() === '') {
            if (people.length > 0) setPeople([]);
            return;
        }
        setLoading(true);
        const data = await UserService.SearchUsersByFullName(searchName, searchType);
        if (data)
            setPeople(data);
        else
            setPeople([]);
        setLoading(false);
    }, [searchName, searchType]);

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
                        placeholder='Search name'
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
                        <View style={{width: '100%', marginBottom: 30}}>
                            <View>
                                <View>

                                </View>
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginHorizontal: 10
                                }}>
                                    <Text style={{fontSize: 16, fontWeight: 'bold'}}>Result for Teams | Player</Text>
                                    <Text style={{fontSize: 16, color: '#3E4FEF'}}>4 Results Found</Text>
                                </View>
                            </View>
                            <View style={{marginTop: 20}}>
                                <TeamSearchCard/>
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
});


export default SearchGlobal;