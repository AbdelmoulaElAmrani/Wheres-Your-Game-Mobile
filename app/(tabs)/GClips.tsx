import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, Platform} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator, MD2Colors, Modal, Searchbar, TextInput} from 'react-native-paper';
import React, {useEffect, useState} from "react";
import {AntDesign, FontAwesome} from '@expo/vector-icons';
import {ImageBackground} from "expo-image";
import VideoComponent from "@/components/VideoComponent";
import * as Sharing from 'expo-sharing';
import CustomButton from "@/components/CustomButton";
import {PostService} from "@/services/PostService";
import {PostResponse} from "@/models/responseObjects/PostResponse";
import {UserService} from "@/services/UserService";
import {useDispatch, useSelector} from "react-redux";
import {UserResponse} from "@/models/responseObjects/UserResponse";
import {getUserProfile} from "@/redux/UserSlice";
import LinkPreviewComponent from "@/components/LinkPreviewComponent";
import {Helpers} from "@/constants/Helpers";
import {useNavigation} from "expo-router";


const validDomains = {
    youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
    facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/.+$/,
    instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/.+$/,
    tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/.+$/
};
const GClips = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('New');
    const tags = ['New', 'Trending', 'Popular', 'Top Photos', 'Top Videos'];
    const [isPostModalVisible, setPostModalVisible] = useState(false);
    const [postLink, setPostLink] = useState('');
    const [postTitle, setPostTitle] = useState('');
    const [isSocialMediaCardVisible, setSocialMediaCardVisible] = useState(false);
    const [socialMediaLink, setSocialMediaLink] = useState({
        facebook: '',
        instagram: '',
        tiktok: '',
        youtube: ''
    });
    const [postLinkError, setPostLinkError] = useState('');
    const [posts, setPosts] = useState([] as PostResponse[]);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [tag, setTag] = useState('new');
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const {socialMediaLinks} = useSelector((state: any) => state.user.userData) as UserResponse;
    const isFocused = useNavigation().isFocused();


    const dispatch = useDispatch();

    useEffect(() => {
        if (isFocused) {
            (async () => {
                await dispatch(getUserProfile() as any)
            })()
            setSocialMediaLink({
                facebook: socialMediaLinks?.facebookAccount || '',
                instagram: socialMediaLinks?.instagramAccount || '',
                tiktok: socialMediaLinks?.tiktokAccount || '',
                youtube: socialMediaLinks?.youtubeAccount || '',
            });
        }
    }, [isFocused]);

    useEffect(() => {
        if (isFocused) {
            setPosts([]);
            setHasMore(true);
            handleFetchPosts();
        }
    }, [page, selectedTag, isFocused]);

    const handleFetchPosts = async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        try {
            const newPosts = await PostService.getFilteredPosts(selectedTag, page, pageSize);
            if (newPosts) {
                if (newPosts?.content.length > 0) {
                    setPosts(prevPosts => {
                        const allPosts = [...prevPosts, ...newPosts.content];
                        const uniquePosts = Array.from(new Set(allPosts.map(post => post.id)))
                            .map(id => allPosts.find(post => post.id === id))
                            .filter((post): post is PostResponse => post !== undefined);
                        return uniquePosts;
                    });

                    // Check if the current page is the last
                    const isLastPage = newPosts.number + 1 === newPosts.totalPages;
                    setHasMore(!isLastPage);
                }
            } else {
                setHasMore(false); // Stop further pagination if no more posts
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const _renderItem = ({item}: { item: any }) => (
        <TouchableOpacity
            style={[styles.tag, selectedTag === item ? styles.selectedTag : null]}
            onPress={() => setSelectedTag(item)}>
            <Text style={[styles.tagText, {color: selectedTag === item ? 'white' : 'black'}]}>{item}</Text>
        </TouchableOpacity>
    );

    const _videoPreview = ({video}: { video: any }) => {
        const isYoutube: boolean = Helpers.isVideoLink(video.link);

        return (
            <TouchableOpacity style={{marginBottom: 30}}>
                <Text style={styles.videoTitle}>{video?.title}</Text>
                <View style={[styles.videoPreview, !isYoutube && {height: 100, alignItems: 'center'}]}>
                    <View>
                        {
                            isYoutube ? (
                                <VideoComponent url={video.link}/>
                            ) : (
                                <LinkPreviewComponent link={video.link}/>
                            )
                        }
                    </View>
                </View>
                <View style={styles.videoInfoContainer}>
                    <Text style={styles.videoInfo}>{video?.info}</Text>
                    <Text style={styles.uploadHour}>
                        {Helpers.formatDateOnNotificationOrChat(video.postedAt, true)} Ago</Text>
                    <View style={[styles.infoIconContainer]}>
                        <TouchableOpacity onPress={() => _handleShareClip(video)}>
                            <AntDesign name="sharealt" size={20} color="grey"/>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    const _handleShareClip = async (video: any) => {
        await Sharing.shareAsync(video.link);
    }
    const _showPostModal = () => {
        setPostModalVisible(true);
    }
    const _hidePostModal = () => {
        setPostModalVisible(false);
        setPostLink('');
        setPostTitle('');
        setPostLinkError('');
    }
    const _handlePost = async () => {
        setPostLinkError('');
        const isValidLink = Object.values(validDomains).some(pattern => pattern.test(postLink));
        if (!isValidLink) {
            setPostLinkError('Please enter a valid link from Facebook, Instagram, YouTube, or TikTok.');
            return;
        }
        var createdPost = await PostService.createPost({title: postTitle, link: postLink});
        if (!createdPost) {
            Alert.alert(
                'Error',
                'An error occurred while creating the post. Please try again later.',
                [{text: 'OK'}]
            );
            return;
        }

        setPosts([...posts, {
            title: createdPost.title,
            link: createdPost.link,
            postedAt: createdPost.postedAt,
            accountId: createdPost.accountId
        } as PostResponse]);


        setPostModalVisible(false);
        setPostLink('');
        setPostTitle('');
    }
    const _showSocialMediaCard = () => {
        setSocialMediaCardVisible(true);
    }
    const _hideSocialMediaCard = () => {
        setSocialMediaCardVisible(false);
    }
    const _handleSocialMediaLink = async () => {
        // Check if any link is provided and validate against domains
        var isValidLink = socialMediaLink.facebook.length > 0 && socialMediaLink.facebook.includes('facebook.com')
            || socialMediaLink.instagram.length > 0 && socialMediaLink.instagram.includes('instagram.com')
            || socialMediaLink.tiktok.length > 0 && socialMediaLink.tiktok.includes('tiktok.com')
            || socialMediaLink.youtube.length > 0 && socialMediaLink.youtube.includes('youtube.com');

        if (!isValidLink) {
            // Show an error alert if the link is invalid
            Alert.alert(
                'Invalid Link',
                'Please enter a valid link from Facebook, Instagram, YouTube, or TikTok.',
                [{text: 'OK'}]
            );
            return;
        }

        var updatedLink = await UserService.updateUserSocialLinks({
            facebookAccount: socialMediaLink.facebook,
            instagramAccount: socialMediaLink.instagram,
            tiktokAccount: socialMediaLink.tiktok,
            youtubeAccount: socialMediaLink.youtube,
        });
        setSocialMediaLink({
            facebook: updatedLink?.facebookAccount || '',
            instagram: updatedLink?.instagramAccount || '',
            tiktok: updatedLink?.tiktokAccount || '',
            youtube: updatedLink?.youtubeAccount || '',
        });
        setSocialMediaCardVisible(false);

    };
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
            console.error('Error sharing:', error);
        }
    };

    return (
        <ImageBackground
            style={{height: hp(100)}}
            source={require('../../assets/images/signupBackGround.jpg')}>
            <SafeAreaView>
                <CustomNavigationHeader showBackArrow={false} showSkip={false} showLogo={true}/>
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
                {/***********Upper Button***************/}
                <View style={styles.horizontalButtonContainer}>
                    <TouchableOpacity style={[styles.button, styles.whiteButton]}
                                      onPress={_showSocialMediaCard}>
                        <Text style={styles.buttonText}>
                            Link Social Media
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.whiteButton]}
                                      onPress={() => {
                                          setSelectedTag('followers');
                                      }}>
                        <Text style={styles.buttonText}>
                            Followers
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.whiteButton]}
                                      onPress={shareAppLink}>
                        <Text style={styles.buttonText}>
                            Invite
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.blueButton]}
                                      onPress={_showPostModal}>
                        <Text style={[styles.buttonText, {color: 'white'}]}>
                            Post
                        </Text>
                    </TouchableOpacity>
                </View>
                {/***********Container***************/}
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
                        <Text style={styles.videoListTitle}>New Posts</Text>
                        <TouchableOpacity
                            disabled={true}>
                            <Text style={{color: 'grey', fontSize: 17}}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.videoListContainer}>
                        {!loading && posts.length === 0 &&
                            <Text style={{color: 'grey', fontSize: 16, textAlign: 'center', marginTop: 20}}>No Post
                                found</Text>}
                        {loading && posts.length === 0 &&
                            <ActivityIndicator animating={true} color={MD2Colors.blueA700} size={50}/>}
                        {posts.length > 0 && (
                            <FlatList
                                data={posts}
                                renderItem={({item}) => _videoPreview({video: item})}
                                keyExtractor={item => item.id}
                                horizontal={false}
                                showsVerticalScrollIndicator={false}
                                style={styles.videosFlatList}
                                bouncesZoom={true}
                                onEndReachedThreshold={0.1}
                                onEndReached={() => {
                                    if (!loading && hasMore) { // Only load more if more pages are available
                                        setPage(prevPage => prevPage + 1);
                                    }
                                }}
                                getItemLayout={(data, index) => (
                                    {length: 50, offset: 50 * index, index}
                                )}
                            />
                        )}
                    </View>

                </View>
                {/******Create Post*******/}
                <Modal visible={isPostModalVisible} onDismiss={_hidePostModal}
                       contentContainerStyle={styles.postModalContainer}>
                    <Text style={{
                        fontSize: 25,
                        fontWeight: 'bold',
                        marginTop: 20
                    }}>Create a Post</Text>
                    <View style={{width: '90%', alignItems: 'center', marginTop: 40}}>
                        <TextInput
                            placeholder="Title"
                            style={[styles.inputStyle, {marginTop: 15}]}
                            cursorColor='black'
                            placeholderTextColor={'grey'}
                            underlineColor={"transparent"}
                            left={<TextInput.Icon color={'#D3D3D3'} icon='comment' size={25}/>}
                            value={postTitle}
                            onChangeText={text => setPostTitle(text)}

                        />
                        <TextInput
                            placeholder="Paste your link here"
                            style={[styles.inputStyle, {marginTop: 15}]}
                            cursorColor='black'
                            placeholderTextColor={'grey'}
                            underlineColor={"transparent"}
                            left={<TextInput.Icon color={'#D3D3D3'} icon='link' size={25}/>}
                            onChangeText={text => setPostLink(text)}
                            value={postLink}
                        />
                        {postLinkError.length > 0 && <Text style={{
                            color: 'red', fontSize: 12,
                            position: 'absolute', bottom: 70, alignSelf: 'center'
                        }}>{postLinkError}</Text>}

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '80%',
                            marginTop: 40
                        }}>
                            <CustomButton
                                text="Cancel"
                                onPress={_hidePostModal}
                                style={{
                                    marginTop: 20,
                                    width: '40%',
                                    height: 35,
                                    backgroundColor: 'white',
                                    borderColor: '#ccc',
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    shadowColor: '#000',
                                    shadowOffset: {width: 0, height: 2},
                                    shadowOpacity: 0.2,
                                    shadowRadius: 2,
                                    elevation: 2,
                                }}
                                textStyle={{color: 'black'}}
                            />
                            <CustomButton
                                text="Post"
                                onPress={_handlePost}
                                style={{
                                    marginTop: 20,
                                    width: '40%',
                                    height: 35,
                                    borderRadius: 8,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    shadowColor: '#000',
                                    shadowOffset: {width: 0, height: 2},
                                    shadowOpacity: 0.2,
                                    shadowRadius: 2,
                                    elevation: 2,
                                }}
                                textStyle={{color: 'white'}}
                            />

                        </View>
                    </View>
                </Modal>
                {/******User Social Medial links*******/}
                <Modal visible={isSocialMediaCardVisible} onDismiss={_hideSocialMediaCard}
                       contentContainerStyle={[styles.postModalContainer, {height: '50%'}]}>
                    <Text style={{
                        fontSize: 25,
                        fontWeight: 'bold',
                        marginTop: 20
                    }}>Link Social Media</Text>
                    <View style={{width: '97%', alignItems: 'center', marginTop: 10}}>
                        <TextInput
                            placeholder="Facebook"
                            style={[styles.inputStyle, {
                                marginTop: 10,
                                flexShrink: 1,  // Prevents wrapping
                                width: '100%',
                                height: 55,
                            }]}
                            cursorColor='black'
                            placeholderTextColor={'grey'}
                            underlineColor={"transparent"}
                            left={<TextInput.Icon color={'#D3D3D3'} icon='facebook' size={25}/>}
                            value={socialMediaLink.facebook}
                            onChangeText={text => setSocialMediaLink({...socialMediaLink, facebook: text})}
                            multiline={false}
                        />
                        <TextInput
                            placeholder="Instagram"
                            style={[styles.inputStyle, {
                                marginTop: 5,
                                flexShrink: 1,
                                width: '100%',
                                height: 55,
                            }]}
                            cursorColor='black'
                            placeholderTextColor={'grey'}
                            underlineColor={"transparent"}
                            left={<TextInput.Icon color={'#D3D3D3'} icon='instagram' size={25}/>}
                            value={socialMediaLink.instagram}
                            onChangeText={text => setSocialMediaLink({...socialMediaLink, instagram: text})}
                            multiline={false}
                        />
                        <TextInput
                            placeholder="Tiktok"
                            style={[styles.inputStyle, {
                                marginTop: 5,
                                flexShrink: 1,
                                width: '100%',
                                height: 55,
                            }]}
                            cursorColor='black'
                            placeholderTextColor={'grey'}
                            underlineColor={"transparent"}
                            left={<TextInput.Icon color={'#D3D3D3'} icon='link' size={25}/>}
                            value={socialMediaLink.tiktok}
                            onChangeText={text => setSocialMediaLink({...socialMediaLink, tiktok: text})}
                            multiline={false}
                        />
                        <TextInput
                            placeholder="Youtube"
                            style={[styles.inputStyle, {
                                marginTop: 5,
                                flexShrink: 1,
                                width: '100%',
                                height: 55,
                            }]}
                            cursorColor='black'
                            placeholderTextColor={'grey'}
                            underlineColor={"transparent"}
                            left={<TextInput.Icon color={'#D3D3D3'} icon='youtube' size={25}/>}
                            value={socialMediaLink.youtube}
                            onChangeText={text => setSocialMediaLink({...socialMediaLink, youtube: text})}
                            multiline={false}
                        />
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '80%'}}>
                            <CustomButton
                                text="Cancel"
                                onPress={_hideSocialMediaCard}
                                style={{
                                    marginTop: 20,
                                    width: '40%',
                                    height: 35,
                                    backgroundColor: 'white',
                                    borderColor: '#ccc',
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    shadowColor: '#000',
                                    shadowOffset: {width: 0, height: 2},
                                    shadowOpacity: 0.2,
                                    shadowRadius: 2,
                                    elevation: 2,
                                }}
                                textStyle={{color: 'black'}}
                            />
                            <CustomButton
                                text="Link"
                                onPress={_handleSocialMediaLink}
                                style={{
                                    marginTop: 20,
                                    width: '40%',
                                    height: 35,
                                    borderRadius: 8,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    shadowColor: '#000',
                                    shadowOffset: {width: 0, height: 2},
                                    shadowOpacity: 0.2,
                                    shadowRadius: 2,
                                    elevation: 2,
                                }}

                            />
                        </View>
                    </View>

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
        paddingHorizontal: 6,
        marginHorizontal: 5,
        paddingVertical: 5,
        marginVertical: 3,
    },
    selectedTag: {
        backgroundColor: '#295AD2',
        color: 'white'
    },
    tagText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
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
        height: 200,
        backgroundColor: 'white',
        borderRadius: 30,
    },
    videoInfo: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'grey',
        marginLeft: 10,
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
        width: '90%',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    infoIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        borderRadius: 5,
    },
    uploadHour: {
        color: 'grey',
    },
    horizontalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 1,
        marginHorizontal: 10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 9,
        paddingHorizontal: 6,
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
        fontWeight: 'bold',
        fontSize: 13,
    },
    postModalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 5,
        width: '95%',
        height: '40%',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'flex-start',
        marginTop: 10,
        marginBottom: '30%'
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
        marginBottom: 10

    },
})

export default GClips;