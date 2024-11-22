import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {
    Keyboard, ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import {ImageBackground} from "expo-image";
import {SafeAreaView} from "react-native-safe-area-context";
import {memo, useCallback, useEffect, useState} from "react";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {Chip, RadioButton, TextInput} from "react-native-paper";
import {AntDesign} from '@expo/vector-icons';
import Sport from "@/models/Sport";
import SportLevel, {convertStringToEnumValue} from "@/models/SportLevel";
import {UserInterestedSport} from "@/models/UserInterestedSport";
import {SportService} from "@/services/SportService";
import {router, useLocalSearchParams} from "expo-router";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useDispatch, useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {UserSportResponse} from "@/models/responseObjects/UserSportResponse";
import {getUserSports} from "@/redux/UserSlice";
import Spinner from "@/components/Spinner";
import OverlaySpinner from "@/components/OverlaySpinner";

const SportInterested = () => {

    const [currentStep, setCurrentStep] = useState<number>(1);
    const [selectedSports, setSelectedSports] = useState<Map<string, UserInterestedSport>>(new Map([]));
    const [sports, setSports] = useState<Sport[] | undefined>([]);
    const user = useSelector((state: any) => state.user.userData) as UserResponse;
    const userSport = useSelector((state: any) => state.user.userSport) as UserSportResponse[];
    const dispatch = useDispatch();
    const [loading, setLoading] = useState<boolean>(false);
    const paramData = useLocalSearchParams<any>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await SportService.getAllSports();
                setSports(data);

                if (user?.id) {
                    dispatch(getUserSports(user.id) as any);
                    if (userSport) {
                        const userSports = new Map(userSport.map(x => [x.sportId, x]));
                        // @ts-ignore
                        setSelectedSports(userSports);
                    }
                }
            } catch (ex) {
                console.log(ex);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [dispatch, user]);


    const _handleContinue = () => {
        setCurrentStep(oldValue => Math.max(2, oldValue - 1));
    };

    const _onNext = async () => {
        if (currentStep === 1 && selectedSports.size === 0) {
            alert("Please select at least one sport to continue.");
            return;
        } else {
            if (currentStep === 1) {
                _handleContinue();
            } else {
                await handleSubmit();
            }
        }
    }
    const _handleGoBack = () => {
        if (currentStep === 1) {
            return router.canGoBack() ? router.back : undefined;
        } else {
            return goToPreviousStep;
        }
    }
    const goToPreviousStep = () => {
        setCurrentStep(oldValue => Math.max(1, oldValue - 1));
    };
    const handleSubmit = async () => {
        try {
            const userId = user?.id;
            const response = await SportService.registerUserToSport([...selectedSports.values()], userId);
            if (paramData?.data) {
                router.replace('/(tabs)');
            } else {
                router.replace('/Welcome');
            }
        } catch (e) {
            console.error(e);
        }
    };
    const isSportSelected = (sportId?: string) => {
        return sportId ? selectedSports.has(sportId) : false;
    }

    const _RenderSportCatalog = () => {
        const [query, setQuery] = useState<string>('');

        const toggleSport = (sport: Sport) => {
            setSelectedSports((prevSelectedSports) => {
                const newSelectedSports = new Map(prevSelectedSports);

                if (sport.id) {
                    const isUserSportSelected = userSport.some(x => x.sportId === sport.id);

                    if (newSelectedSports.has(sport.id)) {
                        if (!isUserSportSelected) {
                            newSelectedSports.delete(sport.id);
                        }
                    } else {
                        newSelectedSports.set(sport.id, {
                            score: 0,
                            createAt: new Date(),
                            sportId: sport.id,
                            sportName: sport.name,
                            sportLevel: SportLevel.Beginner
                        });
                    }
                }
                return newSelectedSports;
            });
        };

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{height: '70%', width: '100%'}}>
                    <TextInput
                        placeholder="Search Sports"
                        style={styles.search}
                        textColor='black'
                        onChangeText={(value) => setQuery(value.toLowerCase())}
                        value={query}
                        placeholderTextColor='#9BA0AB'
                        error={false}
                        underlineColor="transparent"
                        left={<TextInput.Icon size={50} color='#9BA0AB' icon="magnify"/>}
                    />
                    <KeyboardAwareScrollView
                        contentContainerStyle={{paddingBottom: 30}}
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}
                        style={{flex: 1}}
                        scrollEnabled={true}>
                        <View style={styles.sportContainer}>
                            {sports?.filter(x => x.name.toLowerCase().includes(query)).map(sport => {
                                const isSelected = isSportSelected(sport.id);
                                return (<Chip
                                    key={sport.id}
                                    icon={() => (
                                        isSelected && <AntDesign name="check" size={16} color="white"/>
                                    )}
                                    mode="outlined"
                                    style={[styles.sportItem, {backgroundColor: isSelected ? '#2757CB' : 'white'}]}
                                    onPress={() => toggleSport(sport)}
                                >
                                    <Text
                                        style={[styles.sportText, {color: isSelected ? 'white' : 'black'}]}>{sport.name}</Text>
                                </Chip>)
                            })}
                        </View>
                    </KeyboardAwareScrollView>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    const _RenderUserSportLevel = () => {
        const sportLevels = Object.values(SportLevel).filter((value) => typeof value === 'string');

        const _onSelectSportLevel = useCallback((id?: string, value?: string | SportLevel): void => {
            if (id === undefined || value === undefined) return;
            const v = convertStringToEnumValue(SportLevel, value);
            if (v === null) return;
            setSelectedSports((prevSelectedSports) => {
                const updatedSports = new Map(prevSelectedSports);
                if (updatedSports.has(id)) {
                    const sport = updatedSports.get(id);
                    updatedSports.set(id, {...sport, sportLevel: v});
                }
                return updatedSports;
            });
        }, [])

        const _checkIfSelected = useCallback((id: string | undefined, value: string | SportLevel): boolean => {
            if (!id) return false;
            const sport = selectedSports.get(id);
            if (!sport) return false;
            return sport.sportLevel === value;
        }, [selectedSports])


        const _RenderItem = memo(({item}: { item: UserInterestedSport }) => {
            return (
                <View style={styles.lvlContainer}>
                    <Text style={{fontWeight: 'bold', fontSize: 16}}>{item.sportName}</Text>
                    <View>
                        {sportLevels.map((value, key) => (
                            <View
                                key={key}
                                style={{
                                    flexDirection: 'row',
                                    marginTop: 5,
                                    alignItems: 'center',
                                    justifyContent: 'flex-start'
                                }}>
                                <RadioButton
                                    value={value.toString()}
                                    status={_checkIfSelected(item.sportId, value) ? 'checked' : 'unchecked'}
                                    onPress={() => _onSelectSportLevel(item.sportId, value)}
                                />
                                <Text style={{fontSize: 16, marginLeft: 10}}>{value}</Text>
                            </View>
                        ))}
                    </View>
                </View>);
        });


        return (
            <View>
                <View>
                    <Text style={{fontSize: 14, marginVertical: 3}}><Text style={styles.headInfoText}>Beginner: </Text>New
                        To Sport, Learning Basic Rules Or Skills Or Social League</Text>
                    <Text style={{fontSize: 14, marginVertical: 3}}><Text
                        style={styles.headInfoText}>Intermediate: </Text> Solid Understanding Of Rules, Refine
                        Techniques, Level Up Competitive Experience</Text>
                    <Text style={{fontSize: 14, marginVertical: 3}}><Text style={styles.headInfoText}>Advance: </Text>Mastery
                        Of Rules And Skills, High Level Competition</Text>
                </View>
                <View style={{maxHeight: hp(53), height: hp(50)}}>
                    <ScrollView
                        scrollEnabled={true}>
                        {[...selectedSports.values()].map((item => <_RenderItem
                            key={item.sportName + ' ' + Math.random()} item={item}/>))}
                    </ScrollView>
                </View>
            </View>
        );
    }

    return (
        <ImageBackground
            style={StyleSheet.absoluteFill}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView style={{flex: 1}}>
                {loading && (<OverlaySpinner visible={loading}/>)}
                <CustomNavigationHeader text={"Sport"} goBackFunction={_handleGoBack()} showBackArrow/>
                <Text style={styles.stepText}>Step {currentStep}/2</Text>
                <View style={styles.mainContainer}>
                    {/*<KeyboardAwareScrollView
                        nestedScrollEnabled={true}
                        style={{flex: 1}}
                        contentContainerStyle={{flexGrow: 1}}
                        keyboardShouldPersistTaps="handled">*/}
                    {currentStep === 1 && <_RenderSportCatalog/>}
                    {currentStep === 2 && <_RenderUserSportLevel/>}
                    <View style={styles.btnContainer}>
                        <TouchableOpacity
                            onPress={_handleGoBack()}
                            style={styles.btn}>
                            <Text style={{textAlign: 'center', fontSize: 18, color: '#2757CB'}}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => _onNext()}
                            style={[styles.btn, {backgroundColor: '#2757CB'}]}>
                            <Text style={{textAlign: 'center', fontSize: 18, color: 'white'}}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                    {/*</KeyboardAwareScrollView>*/}
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        minWidth: wp('100'),
        minHeight: hp('100'),
    },
    stepText: {
        color: 'white',
        fontSize: 16,
        fontWeight: "700",
        marginLeft: 30
    },
    mainContainer: {
        //flex: 1,
        height: '100%',
        backgroundColor: 'white',
        borderTopEndRadius: 35,
        borderTopStartRadius: 35,
        paddingTop: 30,
        padding: 20,
        marginTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    titleContainer: {
        alignSelf: "center",
        alignItems: "center"
    },
    title: {
        fontWeight: "bold",
        fontSize: 25
    },
    search: {
        backgroundColor: 'white',
        borderColor: '#9BA0AB',
        borderWidth: 1,
        borderTopStartRadius: 30,
        borderTopEndRadius: 30,
        borderBottomStartRadius: 30,
        borderBottomEndRadius: 30,

    },
    sportContainer: {
        paddingTop: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        flexWrap: "wrap",
        //height: hp(50)
    },
    sportItem: {
        margin: 5,
        borderRadius: 20,
        height: 40,
        justifyContent: 'center',
    },
    sportText: {
        fontSize: 16,
    },
    btn: {
        justifyContent: 'center',
        width: 150,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#2757CB'
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 50
    },
    infoContainer: {
        flexDirection: 'row'
    },
    headInfoText: {
        fontWeight: 'bold',
        fontSize: 14
    },
    lvlContainer: {
        backgroundColor: 'white',
        marginTop: 20,
        width: 300,
        borderRadius: 10,
        padding: 15,
        shadowColor: 'grey',
        shadowOffset: {width: 8, height: 8},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderColor: '#E9EDF9',
        borderWidth: 1,
        alignSelf: 'center'
    }
});

export default SportInterested;