import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { ImageBackground, StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import { Chip, TextInput } from "react-native-paper";
import { AntDesign } from '@expo/vector-icons';
import Sport from "@/models/Sport";
import Gender from "@/models/Gender";
import Checkbox from "expo-checkbox";
import SportLevel from "@/models/SportLevel";

const SportIntressed = () => {

    const [currentStep, setCurrentStep] = useState<number>(1);
    const [selectedType, setSelectedType] = useState<Gender>();
    const [selectedSports, setSelectedSports] = useState<Map<string, Sport>>(new Map([
        ['1', { id: '1', name: 'American Football' }],
        ['2', { id: '2', name: 'Archery' }],
        ['3', { id: '3', name: 'Badminton' }],
        ['4', { id: '4', name: 'test' }]
    ]));

    useEffect(() => {

    }, []);


    const [sports, setSports] = useState<Sport[]>([
        { id: '1', name: 'American Football' },
        { id: '2', name: 'Archery' },
        { id: '3', name: 'Badminton' },
        { id: '4', name: 'Baseball' },
        { id: '5', name: 'Basketball' },
        { id: '6', name: 'Bowling' },
        { id: '7', name: 'Boxing' },
        { id: '8', name: 'Cheerleading' },
        { id: '9', name: 'Climbing' },
        { id: '10', name: 'Cricket' },
        { id: '11', name: 'Cross Country' },
        { id: '12', name: 'Cross Fit' },
        { id: '13', name: 'Cycling' },
        { id: '14', name: 'Darts' },
        { id: '15', name: 'Dance' },
        { id: '16', name: 'Equestrian' },
        { id: '17', name: 'Extreme Sports' },
        { id: '18', name: 'Fencing' },
        { id: '19', name: 'Fishing' },
        { id: '20', name: 'Flag Football' },
        { id: '21', name: 'Golf' },
        { id: '22', name: 'Gymnastics' },
        { id: '23', name: 'Hockey' },
        { id: '24', name: 'Karate' },
        { id: '25', name: 'Lacrosse' },
        { id: '26', name: 'Martial Arts' },
        { id: '27', name: 'Motor Racing' },
        { id: '28', name: 'Pickleball' },
        { id: '29', name: 'Pool' },
        { id: '30', name: 'Powerlifting' },
        { id: '31', name: 'Rifle Shooting' },
        { id: '32', name: 'Rowing' },
        { id: '33', name: 'Rugby' },
        { id: '34', name: 'Skiing' },
        { id: '35', name: 'Soccer' },
        { id: '36', name: 'Softball' },
        { id: '37', name: 'Swimming' },
        { id: '38', name: 'Track and Field' },
        { id: '39', name: 'T-Ball/Baseball' },
        { id: '40', name: 'Tennis' },
        { id: '41', name: 'Ultimate Frisbee' },
        { id: '42', name: 'Volleyball' },
        { id: '43', name: 'Water Polo' },
        { id: '44', name: 'Wrestling' },
        { id: '45', name: 'Yoga' },
    ]);

    const _stepTitles = [
        {
            title: 'Choose your sports',
            Header: 'Sport'
        }, {
            title: 'Choose a level for sports',
            Header: 'Sports Level'
        }];

    const _handleContinue = () => {
        setCurrentStep(oldValue => Math.max(2, oldValue - 1));
    };

    const _onNext = () => {
        currentStep === 1 ? _handleContinue() : handleSubmit();
    }
    const _handleGoBack = () => {
        return currentStep === 1 ? undefined : goToPreviousStep;
    }

    const goToPreviousStep = () => {
        setCurrentStep(oldValue => Math.max(1, oldValue - 1));
    };
    const handleSubmit = () => {
    };

    const isSportSelected = (sportId?: string) => { return sportId ? selectedSports.has(sportId) : false; }

    const _RenderSportCatalog = () => {

        const toggleSport = (sport: Sport) => {
            setSelectedSports((prevSelectedSports) => {
                const newSelectedSports = new Map(prevSelectedSports);

                if (sport.id) {
                    if (newSelectedSports.has(sport.id)) {
                        newSelectedSports.delete(sport.id);
                    } else {
                        newSelectedSports.set(sport.id, sport);
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
                        placeholderTextColor='#9BA0AB'
                        error={false}
                        underlineColor="transparent"
                        left={<TextInput.Icon size={50} color='#9BA0AB' icon="magnify" />}
                        right={<TextInput.Icon size={50} color='#9BA0AB' icon="tune-vertical" />}
                    />
                    <ScrollView>
                        <View style={styles.sportContainer}>
                            {sports.map(sport => {
                                const isSelected = isSportSelected(sport.id);
                                return (<Chip
                                    key={sport.id}
                                    icon={() => (
                                        isSelected && <AntDesign name="check" size={16} color="white" />
                                    )}
                                    mode="outlined"
                                    style={[styles.sportItem, { backgroundColor: isSelected ? '#2757CB' : 'white' }]}
                                    onPress={() => toggleSport(sport)}
                                >
                                    <Text style={[styles.sportText, { color: isSelected ? 'white' : 'black' }]}>{sport.name}</Text>
                                </Chip>)
                            })}
                        </View>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>

        );
    }


    const _RenderUserSportLevel = () => {
        function _onSelecteSportLevel(id: string | undefined, value: string | SportLevel): void {
            console.log(id, value);
        }
        function _checkIfSelected(id: string | undefined, value: string | SportLevel): boolean {
            return true;
        }
        const _RenderItem = ({ item }: { item: Sport }) => {

            return (
                <View style={styles.lvlContainer}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
                    <View>
                        {Object.values(SportLevel).filter((value) => typeof value === 'string').map((value, key) => (
                            <View
                                key={key}
                                style={{ flexDirection: 'row', marginTop: 10 }}>
                                <Checkbox
                                    value={_checkIfSelected(item.id, value)}
                                    onValueChange={() => _onSelecteSportLevel(item.id, value)}
                                />
                                <Text style={{ fontSize: 16, marginLeft: 10 }}>{value}</Text>
                            </View>
                        ))}
                    </View>
                </View>);
        }


        return (
            <View>
                <View>
                    <Text style={{ fontSize: 15, marginVertical: 3 }}><Text style={styles.headInfoText}>Beginner: </Text>New To Sport, Learning Basic Rules Or Skills Or Social League</Text>
                    <Text style={{ fontSize: 15, marginVertical: 3 }}><Text style={styles.headInfoText}>Intermediate: </Text> Solid Understanding Of Rules, Refine Techniques, Level Up Competitive Experience</Text>
                    <Text style={{ fontSize: 15, marginVertical: 3 }}><Text style={styles.headInfoText}>Advance: </Text>Mastery Of Rules And Skills, High Level Competition</Text>
                </View>
                <View style={{ height: hp(45), marginTop: 3 }}>
                    <FlatList
                        nestedScrollEnabled
                        style={{}}
                        showsVerticalScrollIndicator={true}
                        data={[...selectedSports.values()]}
                        renderItem={({ item }) => <_RenderItem item={item} />}
                        keyExtractor={item => item.name}
                    />
                </View>
            </View>
        );
    }


    return (
        <ImageBackground
            style={{ height: hp(100) }}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader text={"Sport"} goBackFunction={_handleGoBack()} />
                <View style={styles.container}>
                    <Text style={styles.stepText}>Step {currentStep}/2</Text>
                    <View style={styles.mainContainer}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{_stepTitles[currentStep - 1].title}</Text>
                        </View>
                        <View style={{ justifyContent: 'center', alignContent: "center", marginTop: 20 }}>
                            <View>
                                {currentStep === 1 && <_RenderSportCatalog />}
                                {currentStep === 2 && <_RenderUserSportLevel />}
                            </View>
                        </View>

                        <View style={styles.btnConainter}>
                            <TouchableOpacity
                                onPress={() => _handleContinue()}
                                style={styles.btn}>
                                <Text style={{ textAlign: 'center', fontSize: 18, color: '#2757CB' }}>Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={_handleGoBack}
                                style={[styles.btn, { backgroundColor: '#2757CB' }]}>
                                <Text style={{ textAlign: 'center', fontSize: 18, color: 'white' }}>Continue</Text>
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
        fontSize: 16
    },
    lvlContainer: {
        backgroundColor: 'white',
        marginTop: 20,
        width: 300,
        borderRadius: 10,
        padding: 15,
        shadowColor: 'grey',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderColor: '#E9EDF9',
        borderWidth: 1,
        alignSelf: 'center'

    }
});


export default SportIntressed;