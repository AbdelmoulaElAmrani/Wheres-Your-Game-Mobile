import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import {StyleSheet, Text, View, FlatList, TouchableOpacity} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {SafeAreaView} from "react-native-safe-area-context";
import {Searchbar} from 'react-native-paper';
import React, {useState} from "react";
import {FontAwesome} from '@expo/vector-icons';
import {ImageBackground} from "expo-image";
import VideoComponent from "@/components/VideoComponent";
import * as Sharing from 'expo-sharing';


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

    const _renderItem = ({item}: { item: any }) => (
        <TouchableOpacity
            style={[styles.tag, selectedTag === item ? styles.selectedTag : null]}
            onPress={() => setSelectedTag(item)}>
            <Text style={[styles.tagText, {color: selectedTag === item ? 'white' : 'black'}]}>{item}</Text>
        </TouchableOpacity>
    );

    const _videoPreview = ({video}: { video: any }) => {
        return (
            <View style={{marginBottom: 30}}>
                <Text style={styles.videoTitle}>{video?.title}</Text>
                <View style={styles.videoPreview}>
                    <View style={{height: '100%', width: '100%'}}>
                        <VideoComponent url={video.videoUri}/>
                    </View>
                </View>
                <View style={styles.videoInfoContainer}>
                    <Text style={styles.videoInfo}>{video?.info}</Text>
                    <View style={styles.infoIconContainer}>
                        <Text style={styles.uploadHour}>{video?.uploadHour} hour ago</Text>
                        <TouchableOpacity onPress={() => _handleShareClip(video)}>
                            <FontAwesome name="share-alt" size={20} color="grey" style={styles.shareIcon}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    const _handleShareClip = async (video: any) => {
        await Sharing.shareAsync(video.videoUri);
    }

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
                        <TouchableOpacity>
                            <Text style={{color: 'blue', fontSize: 17}}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.videoListContainer}>
                        <FlatList
                            data={videos}
                            renderItem={({item}) => _videoPreview({video: item})}
                            keyExtractor={item => item.title}
                            horizontal={false}
                            showsVerticalScrollIndicator={false}
                            style={styles.videosFlatList}
                            bouncesZoom={true}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    )
}


const styles = StyleSheet.create({
    searchBarContainer: {
        padding: 20,
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
        backgroundColor: 'white',
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
        color: 'black',
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
        shadowOffset: {width: 0, height: 2},
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
    }
})

export default GClips;