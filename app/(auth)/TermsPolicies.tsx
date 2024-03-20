import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import Checkbox from 'expo-checkbox';
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";


const TermsPolicies = () => {
    const params = useLocalSearchParams();

    const [userData, setUserData] = useState<any>({
        terms: false,
        privacy: false
    })
    const _handleSkip = (): void => {
        router.setParams(userData);
        router.push('/UserStepForm');
    }

    const _handlerAccept = () => {
        router.navigate('/UserStepForm');
    }

    const _handleDecline = () => {
        router.replace('/Register');
    }

    return (
        <ImageBackground
            style={{ height: hp(100) }}
            source={require('../../assets/images/signupBackGround.jpg')}
        >
            <SafeAreaView>
                <CustomNavigationHeader showLogo={true} showSkip={true} skipNavigation={_handleSkip} />
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Terms of Services</Text>
                    <View style={{ height: hp(56), paddingTop: 10 }}>
                        <ScrollView showsVerticalScrollIndicator={true}>
                            <Text style={styles.termsTitle}>1. Terms</Text>
                            <Text style={styles.termsText}>
                                By accessing this apps, you are agreeing to be bound by these apps Terms and Conditions
                                of Use, all applicable laws and regulations, and agree that you are responsible for
                                compliance with any applicable local laws. If you do not agree with any of these terms,
                                you are prohibited from using or accessing this application. The materials contained in
                                this apps are protected by applicable copyright and trade mark law.
                            </Text>
                            <Text style={styles.termsTitle}>2. Privacy Policy</Text>
                            <Text style={styles.termsText}>
                                Don't misuse our services. You may use our services only as permitted by law, including
                                applicable export and re-export control laws and regulations. We may suspend or stop
                                providing our services to you if you do not comply with our terms or policies or if we
                                are investigating suspected misconduct.
                            </Text>
                            <Text style={styles.termsTitle}>3. User Eligibility</Text>
                            <Text style={styles.termsText}>
                                Users must be at least 13 years old (13 years or older with parental approval) to use
                                the social sports network application. By using the application, users affirm that they
                                meet the age requirement.
                            </Text>
                            <Text style={styles.termsTitle}>2. Privacy Policy</Text>
                            <Text style={styles.termsText}>
                                Don't misuse our services. You may use our services only as permitted by law, including
                                applicable export and re-export control laws and regulations. We may suspend or stop
                                providing our services to you if you do not comply with our terms or policies or if we
                                are investigating suspected misconduct.
                            </Text>
                            <Text style={styles.termsTitle}>4. Acceptance of Terms</Text>
                            <Text style={styles.termsText}>
                                Users must accept and comply with the terms of service, community guidelines, and
                                privacy policy to access and use the application.
                            </Text>
                            <Text style={styles.termsTitle}>2. Privacy Policy</Text>
                            <Text style={styles.termsText}>
                                Don't misuse our services. You may use our services only as permitted by law, including
                                applicable export and re-export control laws and regulations. We may suspend or stop
                                providing our services to you if you do not comply with our terms or policies or if we
                                are investigating suspected misconduct.
                            </Text>
                            <Text style={styles.termsTitle}>5. Your Access to and Use of Our Services</Text>
                            <Text style={styles.termsText}>
                                Users are granted a non-exclusive, non-transferable, revocable license to access and use
                                the services provided by the application. Unauthorized use or access may result in
                                termination of user accounts.
                            </Text>
                            <Text style={styles.termsTitle}>6. User Content</Text>
                            <Text style={styles.termsText}>
                                Users are responsible for the content they share on the platform, ensuring it aligns
                                with the sports-focused community guidelines. The application reserves the right to
                                remove content that violates these guidelines.
                            </Text>
                            <Text style={styles.termsTitle}>7. Community Guidelines</Text>
                            <Text style={styles.termsText}>
                                Users must adhere to the community guidelines, promoting positive and sports-centric
                                interactions within the platform. Prohibited content includes but is not limited to:
                                hate speech, harassment, and any content violating the rights of others. Respect for
                                diverse opinions, fair play, and sportsmanship is encouraged.
                            </Text>
                            <Text style={styles.termsTitle}>8. Regulated Goods and Commercial Activities</Text>
                            <Text style={styles.termsText}>
                                Users agree to engage in commercial activities and trade regulated goods on the platform
                                responsibly and in compliance with all applicable laws and regulations. The application
                                reserves the right to restrict or remove content related to regulated goods or
                                commercial activities that may cause harm or violate laws.
                            </Text><Text style={styles.termsTitle}>9. Privacy and Data Collection</Text>
                            <Text style={styles.termsText}>
                                The application collects and processes user data for the purpose of providing
                                sports-related features and services. Users have the right to review, delete, and manage
                                their data in accordance with the privacy policy
                            </Text><Text style={styles.termsTitle}>10. Children's Information and COPPA
                                Compliance</Text>
                            <Text style={styles.termsText}>
                                The application complies with the Children's Online Privacy Protection Act (COPPA).
                                Users under the age of 13 must obtain parental consent for communication features within
                                the application. Parents will send an access code to their child, approving their
                                communication on the app once the child is 13 years or older. Parents are responsible
                                for overseeing their child's communication activities.
                            </Text><Text style={styles.termsTitle}>11. Parental Consent for Communication (Ages 13 and
                                Older)</Text>
                            <Text style={styles.termsText}>
                                Users aged 13 and older require parental consent for access to communication features.
                                Parents will send an access code to their child, granting approval for communication on
                                the app. Parents are responsible for overseeing their child's communication activities.
                            </Text>
                            <Text style={styles.termsTitle}>12. Paid Tiers and Subscription Services</Text>
                            <Text style={styles.termsText}>
                                The application offers paid tiers with additional features and benefits. Users
                                subscribing to paid tiers agree to the specified subscription terms, including billing
                                cycles, fees, and renewal conditions.
                            </Text>
                            <Text style={styles.termsTitle}>13. Payment and Billing</Text>
                            <Text style={styles.termsText}>
                                UUsers agree to provide accurate and up-to-date payment information for subscription
                                fees. The application may use third-party payment processors, and users acknowledge that
                                their financial information is subject to the processor's terms and policies
                            </Text>
                        </ScrollView>
                    </View>
                    <View style={styles.cardFooter}>
                        <View>
                            <View style={styles.checkBoxZone}>
                                <Checkbox
                                    onValueChange={(value) => setUserData({ ...userData, terms: value })}
                                    value={userData.terms}
                                    style={styles.checkBox} />
                                <View style={styles.termsPolicyAgreement}>
                                    <Text style={styles.text}>I accept with the </Text>
                                    <Text style={[styles.boldText, styles.text]}>Terms and Conditions</Text>
                                </View>
                            </View>
                            <View style={styles.checkBoxZone}>
                                <Checkbox
                                    onValueChange={(value) => setUserData({ ...userData, privacy: value })}
                                    value={userData.privacy}
                                    style={styles.checkBox} />
                                <View style={styles.termsPolicyAgreement}>
                                    <Text style={styles.text}>I agree with the </Text>
                                    <Text style={[styles.boldText, styles.text]}>Privacy Policy</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.btnGroup}>
                            <TouchableOpacity
                                onPress={_handleDecline}
                                style={[styles.btnStyle, {
                                    backgroundColor: 'white',
                                    borderColor: 'grey',
                                    borderWidth: 1
                                }]}>
                                <Text style={[styles.btnText, { color: 'grey' }]}>Decline</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={_handlerAccept}
                                style={[styles.btnStyle, { backgroundColor: '#2757CB' }]}>
                                <Text style={[styles.btnText, { color: 'white' }]}>Accept</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}


const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        width: wp(100),
        //height: hp(100) - 100,
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
        paddingTop: 30,
        padding: 20,
    },
    cardTitle: {
        fontWeight: 'bold',
        textAlign: "center",
        fontSize: 25
    },
    cardFooter: {
        //backgroundColor: 'red',
    },
    btnGroup: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 20
    },
    btnStyle: {
        backgroundColor: 'yellow',
        alignItems: "center",
        justifyContent: "center",
        width: 150,
        height: 45,
        borderRadius: 20
    },
    btnText: {
        fontSize: 22
    },
    checkBoxZone: {
        flexDirection: "row",
        alignContent: "center",
        paddingLeft: 10,
        marginTop: 20
    },
    termsPolicyAgreement: {
        flexDirection: "row",
        marginLeft: 10,
        alignItems: "center"
    },
    checkBox: {
        borderColor: 'grey',
        borderRadius: 5,
        height: 23,
        width: 23
    },
    boldText: {
        fontWeight: "bold"
    },
    text: {
        fontSize: 14
    },
    termsTitle: {
        fontWeight: "bold",
        fontSize: 12,
        marginTop: 20
    },
    termsText: {
        textAlign: "justify",
        marginTop: 3,
        marginLeft: 5
    }
});


export default TermsPolicies;