import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, Platform } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from "react-native-safe-area-context";
import { Modal, Searchbar, TextInput } from 'react-native-paper';
import React, { useState } from "react";
import { FontAwesome } from '@expo/vector-icons';
import { ImageBackground } from "expo-image";
import VideoComponent from "@/components/VideoComponent";
import * as Sharing from 'expo-sharing';
import CustomButton from "@/components/CustomButton";



const validDomains = ['facebook.com', 'instagram.com', 'youtube.com', 'tiktok.com'];

const GClips = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [videos, setVideos] = useState([
        {
            title: '5 Tips for your First Day of Shooting Archery',
            info: 'Mike added a videos',
            videoUri: 'https://www.youtube.com/watch?v=HiQG9Jbqr0E',
            uploadHour: 1
        },
        {
            title: 'How to Swim All Four Strokes',
            info: 'John added a video',
            videoUri: 'https://www.youtube.com/watch?v=8c_lt66Yvn4',
            uploadHour: 2
        },
        {
            title: '20 min Full Body STRETCH/YOGA for STRESS & ANXIETY Relief\n',
            info: 'MadFit added a video',
            videoUri: 'https://www.youtube.com/watch?v=sTANio_2E0Q',
            uploadHour: 3
        }]);
    const tags = ['New', 'Trending', 'Popular', 'Top Photos', 'Top Videos'];
    const [isPostModalVisible, setPostModalVisible] = useState(false);
    const [postLink, setPostLink] = useState('');
    const [postTitle, setPostTitle] = useState('');
    const [isSocialMediaCardVisible, setSocialMediaCardVisible] = useState(false);
    const [socialMediaLink, setSocialMediaLink] = useState({
        facebook: '',
        instagram: '',
        tiktok: '',
        youtube: '',
        twitter: '',
    });


    const _renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            disabled={true}
            style={[styles.tag, selectedTag === item ? styles.selectedTag : null]}
            onPress={() => setSelectedTag(item)}>
            <Text style={[styles.tagText, { color: selectedTag === item ? 'white' : 'black' }]}>{item}</Text>
        </TouchableOpacity>
    );

    const _videoPreview = ({ video }: { video: any }) => {
        return (
            <View style={{ marginBottom: 30 }}>
                <Text style={styles.videoTitle}>{video?.title}</Text>
                <View style={styles.videoPreview}>
                    <View style={{ height: '100%', width: '100%' }}>
                        <VideoComponent url={video.videoUri} />
                    </View>
                </View>
                <View style={styles.videoInfoContainer}>
                    <Text style={styles.videoInfo}>{video?.info}</Text>
                    <View style={styles.infoIconContainer}>
                        <Text style={styles.uploadHour}>{video?.uploadHour} hour ago</Text>
                        <TouchableOpacity onPress={() => _handleShareClip(video)}>
                            <FontAwesome name="share-alt" size={20} color="grey" style={styles.shareIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    const _handleShareClip = async (video: any) => {
        await Sharing.shareAsync(video.videoUri);
    }

    const _showPostModal = () => {
        setPostModalVisible(true);
    }
    const _hidePostModal = () => {
        setPostModalVisible(false);
    }
    const _handlePost = () => {
        const isValidLink = validDomains.some(domain => postLink.includes(domain));
        if (!isValidLink) {
            // Show an error alert if the link is invalid
            Alert.alert(
                'Invalid Link',
                'Please enter a valid link from Facebook, Instagram, YouTube, or TikTok.',
                [{ text: 'OK' }]
            );
            return;
        }

        console.log('Link is valid. Proceeding with post...' + postLink + ' ' + postTitle);
        setVideos([...videos, {
            title: postTitle,
            info: 'You added a video',
            videoUri: postLink,
            uploadHour: 0
        }]);
        setPostModalVisible(false);
        setPostLink('');
    }
    const _showSocialMediaCard = () => {
        setSocialMediaCardVisible(true);
    }
    const _hideSocialMediaCard = () => {
        setSocialMediaCardVisible(false);
    }
    const _handleSocialMediaLink = () => {
        console.log('Social Media Links: ', socialMediaLink);
        setSocialMediaCardVisible(false);
    }

    const shareAppLink = async () => {
        try {
            const shareOptions = {
                message: '🔥 Discover Where\'s Your Game - the ultimate app to find and track live sports events! 🏀🏈🎾 Stay updated and never miss a game with real-time event notifications! Download it now and join the action: ',
                url: Platform.OS === 'ios'
                    ? 'https://apps.apple.com/app/idxxxxxxxx' //TODO: App Store URL for iOS
                    : 'https://play.google.com/store/apps/details?id=com.example.app', //TODO: Play Store URL for Android
            };

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(shareOptions.url, {
                    dialogTitle: 'Invite Friends to the App!',
                    mimeType: 'text/plain', // Setting a mime type for text
                    UTI: 'public.url', // UTI for iOS
                });
            } else {
                alert('Sharing is not available on this device');
            }
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    return (
        <ImageBackground
            style={{ height: hp(100) }}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader showBackArrow={false} showSkip={false} showLogo={true} />
                <View style={styles.searchBarContainer}>
                    <Searchbar
                        placeholder="Search Videos"
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        placeholderTextColor="#808080"
                        iconColor="#808080"
                        style={styles.searchBar}
                    />
                </View>
                <View style={styles.horizontalButtonContainer}>
                    <TouchableOpacity style={[styles.button, styles.whiteButton]}
                        onPress={_showSocialMediaCard}
                    >
                        <Text style={styles.buttonText}>
                            Link Social Media
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.whiteButton]}>
                        <Text style={styles.buttonText}>
                            Followers
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.whiteButton]}
                        onPress={shareAppLink}
                    >
                        <Text style={styles.buttonText}>
                            Invite
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.blueButton]}
                        onPress={_showPostModal}
                    >
                        <Text style={[styles.buttonText, { color: 'white' }]}>
                            Post
                        </Text>
                    </TouchableOpacity>

                </View>
                <View style={styles.cardContainer}>
                    <FlatList
                        data={tags}
                        renderItem={_renderItem}
                        keyExtractor={item => item}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        style={styles.flatList}
                    />

                    <View style={styles.videoHeader}>
                        <Text style={styles.videoListTitle}>New Videos</Text>
                        <TouchableOpacity
                            disabled={true}>
                            <Text style={{ color: 'grey', fontSize: 17 }}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.videoListContainer}>
                        <FlatList
                            data={videos}
                            renderItem={({ item }) => _videoPreview({ video: item })}
                            keyExtractor={item => item.title}
                            horizontal={false}
                            showsVerticalScrollIndicator={false}
                            style={styles.videosFlatList}
                            bouncesZoom={true}
                        />
                    </View>

                </View>
                <Modal visible={isPostModalVisible} onDismiss={_hidePostModal}
                    contentContainerStyle={styles.postModalContainer}>
                    <Text style={{
                        fontSize: 25,
                        fontWeight: 'bold',
                        marginTop: 20
                    }}>Add a post</Text>
                    <TextInput
                        placeholder="Add a caption"
                        style={[styles.inputStyle, { marginTop: 15 }]}
                        cursorColor='black'
                        placeholderTextColor={'grey'}
                        underlineColor={"transparent"}
                        left={<TextInput.Icon color={'#D3D3D3'} icon='comment' size={25} />}
                        value={postTitle}
                        onChangeText={text => setPostTitle(text)}

                    />
                    <TextInput
                        placeholder="Paste your link here"
                        style={[styles.inputStyle, { marginTop: 25 }]}
                        cursorColor='black'
                        placeholderTextColor={'grey'}
                        underlineColor={"transparent"}
                        left={<TextInput.Icon color={'#D3D3D3'} icon='link' size={25} />}
                        onChangeText={text => setPostLink(text)}
                        value={postLink}
                    />


                    <CustomButton
                        text="Post"
                        onPress={_handlePost}
                        style={{ marginTop: 20, width: '50%', height: 50 }}
                    />

                </Modal>
                <Modal visible={isSocialMediaCardVisible} onDismiss={_hideSocialMediaCard}
                    contentContainerStyle={[styles.postModalContainer, { height: '50%' }]}>
                    <Text style={{
                        fontSize: 25,
                        fontWeight: 'bold',
                        marginTop: 20
                    }}>Link Social Media</Text>

                    <TextInput
                        placeholder="Facebook"
                        style={[styles.inputStyle, { marginTop: 10 }]}
                        cursorColor='black'
                        placeholderTextColor={'grey'}
                        underlineColor={"transparent"}
                        left={<TextInput.Icon color={'#D3D3D3'} icon='link' size={25} />}
                        value = {socialMediaLink.facebook}
                        onChangeText={text => setSocialMediaLink({...socialMediaLink, facebook: text})}
                    />
                    <TextInput
                        placeholder="Instagram"
                        style={[styles.inputStyle, { marginTop: 5 }]}
                        cursorColor='black'
                        placeholderTextColor={'grey'}
                        underlineColor={"transparent"}
                        left={<TextInput.Icon color={'#D3D3D3'} icon='link' size={25} />}
                        value = {socialMediaLink.instagram}
                        onChangeText={text => setSocialMediaLink({...socialMediaLink, instagram: text})}
                    />
                    <TextInput
                        placeholder="Tiktok"
                        style={[styles.inputStyle, { marginTop: 5 }]}
                        cursorColor='black'
                        placeholderTextColor={'grey'}
                        underlineColor={"transparent"}
                        left={<TextInput.Icon color={'#D3D3D3'} icon='link' size={25} />}
                        value = {socialMediaLink.tiktok}
                        onChangeText={text => setSocialMediaLink({...socialMediaLink, tiktok: text})}
                    />
                    <TextInput
                        placeholder="Youtube"
                        style={[styles.inputStyle, { marginTop: 5 }]}
                        cursorColor='black'
                        placeholderTextColor={'grey'}
                        underlineColor={"transparent"}
                        left={<TextInput.Icon color={'#D3D3D3'} icon='link' size={25} />}
                        value = {socialMediaLink.youtube}
                        onChangeText={text => setSocialMediaLink({...socialMediaLink, youtube: text})}
                    />
                    <TextInput
                        placeholder="Twitter"
                        style={[styles.inputStyle, { marginTop: 5 }]}
                        cursorColor='black'
                        placeholderTextColor={'grey'}
                        underlineColor={"transparent"}
                        left={<TextInput.Icon color={'#D3D3D3'} icon='link' size={25} />}
                        value = {socialMediaLink.twitter}
                        onChangeText={text => setSocialMediaLink({...socialMediaLink, twitter: text})}
                    />
                    <CustomButton
                        text="Link"
                        onPress={_handleSocialMediaLink}
                        style={{ marginTop: 20, width: '50%', height: 50 }}
                    />

                </Modal>


            </SafeAreaView>
        </ImageBackground>
    )
}


const styles = StyleSheet.create({
    searchBarContainer: {
        padding: 15,
        justifyContent: 'center'
    },
    searchBar: {
        backgroundColor: 'white'
    },
    cardContainer: {
        width: wp('100'),
        height: hp('80'),
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 40,
        padding: 20,
        marginTop: hp(2),
        position: 'relative',
    },
    flatList: {
        marginBottom: hp(2),
    },
    tag: {
        backgroundColor: 'rgba(82,80,80,0.22)',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
        marginHorizontal: 5,
    },
    selectedTag: {
        backgroundColor: '#295AD2',
        color: 'white'
    },
    tagText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    tagTextSelected: {
        color: 'white',
    },
    videoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: hp(5),
    },
    videoListContainer: {
        height: hp(62),
        width: wp(100),
        marginBottom: hp(1),
    },
    videoListTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    videoPreview: {
        width: wp(90),
        height: hp(25),
        backgroundColor: 'white',
        borderRadius: 30,
    },
    videoThumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
        shadowColor: 'black',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 2,
    },
    videoInfo: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'grey',
        marginLeft: 10,
        marginBottom: 10
    },
    videoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        marginLeft: 5,
        marginBottom: 10,
        width: '90%',
    },
    videosFlatList: {
        marginTop: hp(2),
        marginBottom: hp(15),
        width: wp(100),
        height: hp(50),
        alignSelf: 'center'

    },
    videoInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: wp(8),
    },
    uploadHour: {
        color: 'grey',
    },
    shareIcon: {
        marginLeft: wp(20)
    },
    horizontalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 2,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    whiteButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    blueButton: {
        backgroundColor: '#295AD2',
    },
    buttonText: {
        color: 'black',
        marginLeft: 5,
        fontWeight: '600',
    },
    postModalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 5,
        width: '95%',
        height: '33%',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'flex-start',
        marginTop: 10,
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
        borderWidth: 1,
        width: '100%',
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 10,

    },
})

export default GClips;