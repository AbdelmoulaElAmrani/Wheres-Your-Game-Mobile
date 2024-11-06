import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import axios from 'axios';
import {linkPreviewAPi} from "@/appConfig";
import * as Linking from "expo-linking";

interface LinkPreviewProps {
    link: string;
}

interface Metadata {
    title: string;
    description: string;
    image: string;
    url: string;
}


const LinkPreviewComponent: React.FC<LinkPreviewProps> = ({link}) => {
    const [metadata, setMetadata] = useState<Metadata | null>(null);
    const [loading, setLoading] = useState<boolean>(true);


    useEffect(() => {
        const fetchLinkPreview = async () => {
            try {
                const response = await axios.get(`https://api.linkpreview.net/?key=${linkPreviewAPi}&q=${link}`);
                setMetadata(response.data);
            } catch (error) {
                console.error("Error fetching link preview:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLinkPreview();
    }, [link]);

    if (loading) {
        return <ActivityIndicator size="small" color="#0000ff"/>;
    }

    if (!metadata) {
        return <Text>Preview not available</Text>;
    }

    const _openTheLink = () => {
        if (link === undefined) return;
        if (!link.startsWith('http://') && !link.startsWith('https://')) {
            link = `https://${link}`;
        }
        Linking.canOpenURL(link)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(link);
                }
            })
            .catch((err) => {
                console.error("Failed to open URL:", err);
            });
    };

    return (
        <TouchableOpacity
            onPress={_openTheLink}
            style={styles.container}>
            {metadata.image && (
                <Image source={{uri: metadata.image}} style={styles.image}/>
            )}
            <View style={styles.textContainer}>
                <Text style={styles.title}>{metadata.title}</Text>
                <Text style={styles.description} numberOfLines={2}>
                    {metadata.description}
                </Text>
                <Text style={styles.url}>{metadata.url}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        padding: 10,
        width: '100%',
        borderRadius: 8,
        marginVertical: 10,
        backgroundColor: '#f9f9f9',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    url: {
        fontSize: 12,
        color: '#007aff',
    },
});

export default LinkPreviewComponent;
