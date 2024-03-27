import CustomButton from "@/components/CustomButton";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import { useRef, useState } from "react";
import { FlatList, ImageBackground, Keyboard, StyleSheet, TouchableOpacity, View, TouchableWithoutFeedback } from "react-native"
import { Avatar, Text, TextInput } from "react-native-paper";
import PhoneInput from "react-native-phone-number-input";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from "react-native-safe-area-context";
import { Fontisto, Octicons } from '@expo/vector-icons';


const EditProfile = () => {

    const _handleContinue = () => {
        console.log({ ...user, phone: formattedPhoneNumber });
        setCurrentStep(oldValue => Math.min(3, oldValue + 1));
    }

    const goBackFunc = () => {
        return currentStep === 1 ? undefined : goToPreviousStep;
    }
    const _handlePofilePhotoEdit = () => {
        console.log('Edit Profile Photo');
    }
    const goToPreviousStep = () => {
        setCurrentStep(oldValue => Math.max(1, oldValue - 1));
    };
    const _getCurrentStepTitle = () => {
        switch (currentStep) {
            case 1:
                return 'Edit Profile';
            case 2:
                return 'Gender';
            case 3:
                return 'Age';
        }
    }


    const UserInfoEdit = () => (

        <>
            <View style={styles.userInfoContainer}>
                <TouchableOpacity onPress={_handlePofilePhotoEdit}>
                    <Octicons name="pencil" size={24} color="white" style={styles.editIcon} />

                </TouchableOpacity>
                {user.imageUrl ? <Avatar.Image size={100} source={{ uri: user.imageUrl }} />
                    : <Avatar.Text size={100} label={user.name ? user.name[0] : ''} />}
            </View>
            <View style={styles.formContainer}>
                <View style={styles.mgTop}>
                    <Text style={styles.textLabel}>Full Name</Text>
                    <TextInput
                        style={styles.inputStyle}
                        placeholder={'Full Name'}
                        cursorColor='black'
                        placeholderTextColor={'grey'}
                        left={<TextInput.Icon color={'#D3D3D3'} icon='account-outline' size={30} />}
                        value={user.name}
                        // make the change of the state of the user object at the end of key stroke
                        onChangeText={(text) => setUser({ ...user, name: text })}
                        underlineColor={"transparent"}
                    />
                    <Text style={styles.textLabel}>Email</Text>
                    <TextInput
                        style={styles.inputStyle}
                        focusable={false}
                        placeholder={'Email'}
                        cursorColor='black'
                        placeholderTextColor={'grey'}
                        left={<TextInput.Icon color={'#D3D3D3'} icon='email-outline' size={30} />}
                        value={user.email}
                        onChangeText={(text) => setUser({ ...user, email: text })}
                        underlineColor={"transparent"}
                    />

                    <Text style={styles.textLabel}>Phone number</Text>
                    <View style={styles.mgTop}>
                        <PhoneInput
                            ref={phoneInput}
                            defaultCode={user.phoneContryCode}
                            layout="first"
                            withDarkTheme
                            placeholder="Enter phone number"
                            value={user.phone}
                            onChangeText={(text) => setUser({ ...user, phone: text })}
                            containerStyle={styles.phoneInputContainer}
                            textContainerStyle={styles.textPhoneInputContainer}
                            onChangeFormattedText={(text) => setFormattedPhoneNumber(text)}

                        />
                        <Text style={styles.textLabel}>Address</Text>
                        <TextInput
                            style={styles.inputStyle}
                            placeholder={'Address'}
                            cursorColor='black'
                            placeholderTextColor={'grey'}
                            left={<TextInput.Icon color={'#D3D3D3'} icon='map-marker-outline' size={30} />}
                            value={user.address}
                            onChangeText={(text) => setUser({ ...user, address: text })}
                            underlineColor={"transparent"}
                        />

                        {/* zip code */}
                        <Text style={styles.textLabel}>Zip Code</Text>
                        <TextInput
                            style={styles.inputStyle}
                            placeholder={'Zip Code'}
                            cursorColor='black'
                            placeholderTextColor={'grey'}
                            left={<TextInput.Icon color={'#D3D3D3'} icon='map-marker-outline' size={30} />}
                            value={user.zipCode}
                            onChangeText={(text) => setUser({ ...user, zipCode: text })}
                            underlineColor={"transparent"}
                        />
                        <View style={styles.buttonContainer}>
                            <CustomButton text="Continue" onPress={_handleContinue} />
                        </View>
                    </View>
                </View>
            </View>

        </>
    )
    const UserGenderEdit = () => (
        <>
            <View style={styles.topTextContainer}>
                <Text style={styles.textFirst}>
                    Tell us about your self
                </Text>
                <Text style={styles.textSecond}>
                    To give you better experience and results, we need to know your gender
                </Text>

                <View style={styles.genderSelection}>
                    <TouchableOpacity
                        style={[
                            styles.genderOption,
                            selectedGender === 'male' && { backgroundColor: '#2757cb' },
                        ]}
                        onPress={() => setSelectedGender('male')}
                    >
                        <Fontisto name="male" size={60} color={selectedGender === 'male' ? 'white' : 'black'} />
                        <Text style={[
                            styles.genderLabel,
                            selectedGender === 'male' ? { color: 'white' } : { color: 'black' }
                        ]
                        }
                        >Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.genderOption,
                            selectedGender === 'female' && { backgroundColor: '#2757cb' },
                        ]}
                        onPress={() => setSelectedGender('female')}
                    >
                        <Fontisto name="female" size={60} color={selectedGender === 'female' ? 'white' : 'black'} />
                        <Text style={[
                            styles.genderLabel,
                            selectedGender === 'female' ? { color: 'white' } : { color: 'black' }
                        ]
                        }>Female</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.sideBySideButtons}>
                    <CustomButton text="Back" onPress={goToPreviousStep} style={styles.backButton} textStyle={styles.buttonText} />
                    <CustomButton text="Continue" onPress={_handleContinue} style={styles.continueButton} />
                </View>

            </View>



        </>
    )
    const UserAgeEdit = () => (
        <>
            <View style={styles.topTextContainer}>
                <Text style={styles.textFirst}>
                    How old are you?
                </Text>
                <Text style={styles.textSecond}>
                    This will help us create personalized plan
                </Text>

                <View style={styles.sideBySideButtons}>
                    <CustomButton text="Back" onPress={goToPreviousStep} style={styles.backButton} textStyle={styles.buttonText} />
                    <CustomButton text="Continue" onPress={_handleContinue} style={styles.continueButton} />
                </View>
            </View>
        </>
    )




    const [user, setUser] = useState({
        name: 'John Doe',
        age: 25,
        email: 'jhon@gmail.com',
        phone: '1234567890',
        phoneContryCode: 'FR',
        gender: 'Male',
        imageUrl: null,//'http://www.cecyteo.edu.mx/Nova/App_themes/Nova2016/assets/pages/media/profile/profile_user.jpg'
        address: '1234, Street, City, Country',
        zipCode: '1111135'
    });

    const [selectedGender, setSelectedGender] = useState<string>("male");
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [formattedPhoneNumber, setFormattedPhoneNumber] = useState<string>('');
    const phoneInput = useRef<PhoneInput>(null);

    const [selectedAge, setSelectedAge] = useState(18);
    const ages = Array.from({ length: 100 }, (_, i) => i + 1); // Create an array of ages from 1 to 100
    const visibleAges = ages.slice(selectedAge - 3, selectedAge + 4);

    const renderAgeItem = ({ item: item }: { item: number }) => (
        <TouchableOpacity
            style={[styles.ageItem, item === selectedAge && styles.selectedAgeItem]}
            onPress={() => setSelectedAge(item)}
        >
            <Text style={[styles.itemAgeText, item === selectedAge && styles.selectedAgeItemText]}>
                {item}
            </Text>
        </TouchableOpacity>
    );


    const onAgeChange = (age: number) => {
        setSelectedAge(age);
    };


    return (
        <ImageBackground
            style={{ height: hp(100) }}
            source={require('../../assets/images/signupBackGround.jpg')}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

                <SafeAreaView>
                    <CustomNavigationHeader text={_getCurrentStepTitle()} goBackFunction={goBackFunc()} />

                    <Text style={styles.stepText}>Step {currentStep}/3</Text>

                    <View style={styles.cardContainer}>
                        {currentStep === 1 && <UserInfoEdit />}
                        {currentStep === 2 && <UserGenderEdit />}
                        {currentStep === 3 && <UserAgeEdit />}
                    </View>
                </SafeAreaView>
            </TouchableWithoutFeedback>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        width: wp('100'),
        height: hp('90'),
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 20,
        marginTop: hp(25),
        position: 'absolute'
    },
    userInfoContainer: {

        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginTop: hp(10),
    },
    editIcon: {
        top: hp(2),
        right: wp(-20),
        padding: 5,
        zIndex: 3,
        position: 'absolute'

    },
    formContainer: {
        alignSelf: "center",
        width: wp(100),
        borderRadius: 30,
        padding: 20,
        height: hp(100),
    },
    textLabel: {
        color: 'black',
        fontSize: 18,
        fontWeight: "500",
        marginTop: 10
    },
    inputStyle: {
        backgroundColor: 'white',
        height: 45,
        fontSize: 16,
        marginTop: 5,
        color: 'black',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderColor: '#D3D3D3',
        borderWidth: 1
    },
    mgTop: {
        marginTop: 5
    },
    selectedFlagContainer: {
        backgroundColor: 'white',
        flexDirection: "row",
        alignItems: "center",
        alignContent: "center",
        borderRadius: 10,
        marginRight: 5,
        height: 45,
    },
    flagIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    phoneInputContainer: {
        backgroundColor: 'white',
        height: 51,
        width: wp(90),
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderColor: '#D3D3D3',
        borderWidth: 1
    },
    textPhoneInputContainer: {
        color: 'black',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        backgroundColor: 'white'
    },
    buttonContainer: {
        marginTop: hp(5)
    },
    stepText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        position: 'absolute',
        top: hp(15),
        left: wp(7)
    },
    textFirst: {
        color: 'black',
        fontSize: 30,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    textSecond: {
        color: 'grey',
        fontSize: 16,
        alignSelf: 'center',
        textAlign: 'center',
        marginTop: hp(1)

    },
    topTextContainer: {
        marginLeft: wp(5),
        width: wp(80),
        top: hp(-10),
        textAlign: 'center'
    },
    genderSelection: {
        alignItems: 'center',
        marginTop: hp(5),
    },
    genderOption: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: '#f2f4fb',
        shadowColor: '#dcddde',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.7,
        shadowRadius: 4,
        elevation: 6,
        marginBottom: hp(5)
    },
    genderLabel: {
        fontSize: 16,
        marginTop: 5,
        fontWeight: 'bold'
    },
    sideBySideButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: hp(3),
        alignItems: 'center',
        top: hp(5)

    },
    backButton: {
        backgroundColor: 'white',
        borderColor: '#2757CB',
        borderWidth: 1,
        width: wp(40),
        height: 55,
        borderRadius: 30,
        alignSelf: "center",
        justifyContent: "center",
        marginRight: wp(10)
    },
    continueButton: {
        backgroundColor: "#2757CB",
        width: wp(40),
        height: 55,
        borderRadius: 30,
        alignSelf: "center",
        justifyContent: "center",
    },
    buttonText: {
        fontSize: 20,
        color: '#2757CB',
        textAlign: 'center'
    },
    ageList: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(20),
        marginBottom: hp(50),

    },
    ageItem: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    selectedAgeItem: {
        backgroundColor: '#e0e0e0',

    },
    itemAgeText: {
        fontSize: 18,
    },
    selectedAgeItemText: {
        color: '#2757CB',
    }

})


export default EditProfile;