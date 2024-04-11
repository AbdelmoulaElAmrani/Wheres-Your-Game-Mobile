import CustomNavigationHeader from "@/components/CustomNavigationHeader";
import { ImageBackground, StyleSheet, Text, View, FlatList, TouchableOpacity, Button, Image } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { SafeAreaView } from "react-native-safe-area-context";
import { Searchbar } from 'react-native-paper';
import { useState } from "react";
import { FontAwesome } from '@expo/vector-icons';


const GClips = () => {

    const _renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.tag, selectedTag === item ? styles.selectedTag : null]}
            onPress={() => setSelectedTag(item)}
        >
            <Text style={[styles.tagText, selectedTag === item ? styles.tagTextSelected : null]}>{item}</Text>
        </TouchableOpacity>
    );

    const _videoPreview = ({ video }: { video: any }) => (
        <>
            <Text style={styles.videoTitle}>{video?.title}</Text>
            <TouchableOpacity style={styles.videoPreview} onPress={() => _handlePlayClip(video)}>

                <View style={styles.thumbnailContainer}>
                    <Image
                        source={{ uri: video?.thumbnailUri || video?.uri }}
                        style={styles.videoThumbnail}
                        resizeMode="cover"
                    />
                    <FontAwesome name="play-circle" size={60} color="rgba(255,255,255,0.8)" style={styles.playIcon} />
                </View>
            </TouchableOpacity>
            <View style={styles.videoInfoContainer}>
                <Text style={styles.videoInfo}>{video?.info}</Text>
                <View style={styles.infoIconContainer}>
                    <Text style={styles.uploadHour}>{video?.uploadHour} hour ago</Text>
                    <TouchableOpacity onPress={() => _handleShareClip(video)}>
                    <FontAwesome name="share-alt" size={20} color="grey" style={styles.shareIcon} />
                    </TouchableOpacity>


                </View>
            </View>

        </>
    )

    const _handleShareClip = (video: any) => {
        console.log('Share Clip', video)
        //TODO: Implement Share Clip functionality
    }

    const _handlePlayClip = (video: any) => {
        console.log('Play Clip', video)
    
    }

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const tags = ['New', 'Trending', 'Popular', 'Top Photos', 'Top Videos'];
    const videos = [
        { title: 'Mike running last mile', info: 'Mike added 3 videos' , thumbnailUri: 'https://ak.picdn.net/shutterstock/videos/1040007623/thumb/1.jpg', uploadHour: 1 },
        { title: 'John playing football', info: 'John added 2 videos', thumbnailUri: 'https://athletetrainingandhealth.com/wp-content/uploads/2017/04/Sprinter_1.jpg', uploadHour: 2 }, 
        { title: 'Mat running last mile', info: 'Mat added 1 videos', thumbnailUri: 'https://maville.com/photosmvi/2021/08/06/P27610131D4443815G.jpg', uploadHour: 3 }];

    return (
        <ImageBackground
            style={{ height: hp(100) }}
            source={require('../../assets/images/signupBackGround.jpg')}
        >
            <SafeAreaView>
                <CustomNavigationHeader text="G Clips" showBackArrow={false} showSkip={false} showLogo={true} />

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
                        <Text style={styles.videoListTitle}>New Videos </Text>
                        <TouchableOpacity>
                            <Text style={{ color: 'blue', fontSize: 17 }}>View All</Text>
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
        position: 'relative'
    },
    flatList: {
        marginBottom: hp(2)

    },
    tag: {
        backgroundColor: 'white',
        borderColor: '#E9EDF9',
        shadowColor: '#E9EDF9',
        shadowOpacity: 0.3,
        borderWidth: 0.4,
        shadowOffset: { width: 0, height: 2 },
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 5
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
        marginBottom: hp(1)

    },
    videoListContainer: {
        height: hp(62),
        width: wp(100),
        marginBottom: hp(1),
        marginLeft: 'auto'

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
        padding: 2,
        marginBottom: hp(1),
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
        marginLeft: wp(2),
        marginTop: hp(1),
        marginBottom: hp(1)
    },
    videoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginLeft: wp(2),
        marginBottom: hp(1)
    },
    videosFlatList: {
        marginTop: hp(2),
        marginBottom: hp(15),
        width: wp(100),
        height: hp(50),
        alignSelf: 'center'

    },
    thumbnailContainer: {
        position: 'relative',
        borderRadius: 25,
        overflow: 'hidden',
    },
    playIcon: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
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