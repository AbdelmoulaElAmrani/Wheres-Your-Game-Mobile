import React, {useEffect, useState} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {ResizeMode, Video} from "expo-av";
import {FontAwesome} from "@expo/vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";


interface VideoComponentProps {
    url: string;
}

const VideoComponent: React.FC<VideoComponentProps> = ({url}) => {

    const video = React.useRef(null);
    const [clicked, setClicked] = useState<boolean>(false);
    const isYoutubeUrl = (url: string): boolean => {
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getYouTubeVideoId = (url: string): string => {
        // Handle YouTube Shorts URLs
        const shortsMatch = url.match(/youtube\.com\/shorts\/([^#\&\?\/]+)/);
        if (shortsMatch) {
            return shortsMatch[1];
        }
        
        // Handle regular YouTube URLs
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
    };


    const _handlePlayVideo = () => {
        if (isYoutubeUrl(url)) {

        } else {
            setClicked(true);
            // @ts-ignore
            video?.current?.playAsync();
        }
    }

    return (
        <View style={styles.container}>
            {isYoutubeUrl(url) ? (
                <View style={[styles.video]}>
                    <YoutubePlayer
                        height={300}
                        webViewStyle={styles.video}
                        //play={playing}
                        videoId={getYouTubeVideoId(url)}
                        //onChangeState={onStateChange}
                    />
                </View>
            ) : (<Video
                    ref={video}
                    style={styles.video}
                    source={{uri: url}}
                    useNativeControls
                    resizeMode={ResizeMode.COVER}
                />
            )}
            {!clicked && !isYoutubeUrl(url) && <TouchableOpacity style={styles.playIcon} onPress={_handlePlayVideo}>
                <FontAwesome name="play-circle" size={60}
                             color="rgba(255,255,255,0.8)"
                />
            </TouchableOpacity>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    playIcon: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{translateX: -25}, {translateY: -25}],
    }
});

export default VideoComponent;
