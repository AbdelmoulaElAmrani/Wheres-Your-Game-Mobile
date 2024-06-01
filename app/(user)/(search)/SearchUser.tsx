import {FlatList, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {ImageBackground} from "expo-image";
import {router, useLocalSearchParams} from "expo-router";
import {memo, useEffect, useState} from "react";
import {Avatar, Divider, Modal} from "react-native-paper";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";
import Spinner from "@/components/Spinner";
import {UserService} from "@/services/UserService";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import UserType from "@/models/UserType";
import {useRoute} from "@react-navigation/core";


const SearchUser = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [searchType, setSearchType] = useState<UserType>();
    const route = useRoute();
    const params = route.params as any;


    useEffect(() => {
        const param = params?.searchType as keyof typeof UserType;
        console.log('searchType => ', UserType[param]);
        setSearchType(UserType[param] as UserType);
        setLoading(true);
        setLoading(false);
    }, []);

    const _handleGoBack = () => {
        if (router.canGoBack())
            router.back();
    }

    const [searchName, setSearchName] = useState<string>('');
    const [people, setPeople] = useState<UserResponse[]>([]);

    const _onSearchSubmit = async () => {
        if (searchName.trim() === '') return;
        const data = await UserService.SearchUsersByFullName(searchName);
        if (data)
            setPeople(data);
        else
            setPeople([]);
    }
    const _renderUserItem = ({item}: { item: UserResponse }) => (
        <TouchableOpacity style={styles.userItem}>
            {item.imageUrl ? (
                <Avatar.Image size={35} source={{uri: item.imageUrl}}/>
            ) : (
                <Avatar.Text
                    size={35}
                    label={(item?.firstName?.charAt(0) + item?.lastName?.charAt(0)).toUpperCase()}
                />
            )}
            <Text style={styles.userName}>{`${item.firstName} ${item.lastName}`}</Text>
        </TouchableOpacity>
    );


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
                <CustomNavigationHeader text={`Search ${searchType ? UserType[searchType] : ''}`}
                                        goBackFunction={_handleGoBack} showBackArrow/>
                <View style={styles.mainContainer}>
                    <KeyboardAvoidingView
                        style={{width: '100%', height: '100%', paddingVertical: 10, paddingHorizontal: 8}}>
                        <View style={{
                            width: '95%',
                            marginTop: heightPercentageToDP(1.5),
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            alignSelf: 'center'
                        }}>
                            <TextInput
                                placeholder='Search name'
                                placeholderTextColor='#bbb'
                                onChangeText={(value) => setSearchName(value)}
                                value={searchName}
                                returnKeyType='search'
                                autoFocus={true}
                                onSubmitEditing={_onSearchSubmit}
                                clearButtonMode="while-editing"
                                style={styles.searchText}
                            />
                        </View>

                        <View style={{width: '100%'}}>
                            {people.length > 0 ? <FlatList
                                data={people}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={_renderUserItem}
                                style={styles.userList}
                            /> : <Text
                                style={{textAlign: 'center', fontWeight: 'bold', marginTop: heightPercentageToDP(30)}}>No
                                User</Text>}
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    endText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
        color: '#2757CB'
    },
    mainContainer: {
        backgroundColor: 'white',
        height: '100%',
        width: '100%'
    },
    endContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    conversationContainer: {
        height: '90%',
        width: '100%'
    },
    searchContainer: {
        height: '6%',
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 5,
        width: '100%',
        height: '80%',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    searchText: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        color: '#000',
        flex: 1,
        marginRight: 10,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'blue',
    },
    userList: {
        marginTop: 20,
    },
    userItem: {
        padding: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: heightPercentageToDP(1)
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: widthPercentageToDP(2)
    },
});
export default SearchUser;