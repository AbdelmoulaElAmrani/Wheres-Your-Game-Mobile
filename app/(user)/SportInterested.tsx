import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {
    FlatList,
    ImageBackground,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useEffect, useState} from "react";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {Chip, RadioButton, TextInput} from "react-native-paper";
import {AntDesign} from '@expo/vector-icons';
import Sport from "@/models/Sport";
import SportLevel, {convertStringToEnumValue} from "@/models/SportLevel";
import {UserInterestedSport} from "@/models/UserInterestedSport";
import {SportService} from "@/services/SportService";
import {router} from "expo-router";

const SportInterested = () => {
    const _stepTitles = [
        {
            title: 'Choose your sports',
            Header: 'Sport'
        }, {
            title: 'Choose a level for sports',
            Header: 'Sports Level'
        }];
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [selectedSports, setSelectedSports] = useState<Map<string, UserInterestedSport>>(new Map([]));
    const [sports, setSports] = useState<Sport[] | undefined>([]);


    useEffect(() => {
        const fetchSport = async () => {
            try {
                const data = await SportService.getAllSports();
                setSports(data);
            } catch (ex) {
                console.log(ex);
            }
        }
        fetchSport();
    }, []);


    const _handleContinue = () => {
        setCurrentStep(oldValue => Math.max(2, oldValue - 1));
    };

    const _onNext = () => {
        currentStep === 1 ? _handleContinue() : handleSubmit();
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
        console.log(selectedSports)
        try {
            //const response = await SportService.registerUserToSport([...selectedSports.values()], 'userId')
            router.replace('/Welcome');
        } catch (e) {
            console.log(e);
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
                    if (newSelectedSports.has(sport.id)) {
                        newSelectedSports.delete(sport.id);
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
                <View>
                    <TextInput
                        placeholder="Search Sports"
                        style={styles.credentialInput}
                        textColor='black'
                        onChangeText={(value) => setQuery(value.toLowerCase())}
                        value={query}
                        placeholderTextColor='#9BA0AB'
                        error={false}
                        underlineColor="transparent"
                        left={<TextInput.Icon size={50} color='#9BA0AB' icon="magnify"/>}
                    />
                    <ScrollView>
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
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>

        );
    }


    const _RenderUserSportLevel = () => {

        const _onSelectSportLevel = (id?: string, value?: string | SportLevel): void => {
            if (id === undefined) return;
            if (value === undefined) return;
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
            console.log(id, value);
        }

        const _checkIfSelected = (id: string | undefined, value: string | SportLevel): boolean => {
            if (!id) return false;

            const sport = selectedSports.get(id);
            if (!sport) return false;
            return sport.sportLevel === value;
        }


        const _RenderItem = ({item}: { item: UserInterestedSport }) => {

            return (
                <View style={styles.lvlContainer}>
                    <Text style={{fontWeight: 'bold', fontSize: 16}}>{item.sportName}</Text>
                    <View>
                        {Object.values(SportLevel).filter((value) => typeof value === 'string').map((value, key) => (
                            <View
                                key={key}
                                style={{
                                    flexDirection: 'row',
                                    marginTop: 10,
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
        }


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
                <View style={{height: hp(45), marginTop: 3}}>
                    <FlatList
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={true}
                        data={[...selectedSports.values()]}
                        renderItem={({item}) => <_RenderItem item={item}/>}
                        keyExtractor={item => item.sportName + ' 1'}
                    />
                </View>
            </View>
        );
    }


    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader text={"Sport"} goBackFunction={_handleGoBack()} showBackArrow/>
                <View style={styles.container}>
                    <Text style={styles.stepText}>Step {currentStep}/2</Text>
                    <View style={styles.mainContainer}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{_stepTitles[currentStep - 1].title}</Text>
                        </View>
                        <View style={{justifyContent: 'center', alignContent: "center", marginTop: 20}}>
                            <View>
                                {currentStep === 1 && <_RenderSportCatalog/>}
                                {currentStep === 2 && <_RenderUserSportLevel/>}
                            </View>
                        </View>

                        <View style={styles.btnConainter}>
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
                    </View>
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
        flex: 1,
        backgroundColor: 'white',
        borderTopEndRadius: 35,
        borderTopStartRadius: 35,
        paddingTop: 30,
        padding: 20,
        marginTop: 10
    },
    titleContainer: {
        alignSelf: "center",
        alignItems: "center"
    },
    title: {
        fontWeight: "bold",
        fontSize: 25
    },
    credentialInput: {
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
        height: hp(50)
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
    btnConainter: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30,
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