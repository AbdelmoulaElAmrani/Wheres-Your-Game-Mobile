import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';

interface TikTokOEmbedComponentProps {
    url: string;
    onPress?: () => void;
}

interface TikTokOEmbedData {
    title: string;
    author_name: string;
    author_url: string;
    thumbnail_url: string;
    html: string;
    width: number;
    height: number;
}

// Simple in-memory cache
const oembedCache = new Map<string, { data: TikTokOEmbedData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const TikTokOEmbedComponent: React.FC<TikTokOEmbedComponentProps> = ({ url, onPress }) => {
    const [oembedData, setOembedData] = useState<TikTokOEmbedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTikTokOEmbed();
    }, [url]);

    const fetchTikTokOEmbed = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Check cache first
            const cached = oembedCache.get(url);
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                setOembedData(cached.data);
                setLoading(false);
                return;
            }
            
            const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
            const response = await axios.get(oembedUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; TikTok-Embed/1.0)'
                }
            });

            if (response.data) {
                // Cache the response
                oembedCache.set(url, { data: response.data, timestamp: Date.now() });
                setOembedData(response.data);
            }
        } catch (err: any) {
            console.error('Error fetching TikTok oEmbed:', err);
            
            // Handle rate limiting specifically
            if (err.response?.status === 429) {
                setError('Rate limit exceeded. Please try again later.');
            } else if (err.code === 'ECONNABORTED') {
                setError('Request timeout. Please check your connection.');
            } else {
                setError('Failed to load TikTok preview');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePress = () => {
        Linking.openURL(url);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000000" />
                <Text style={styles.loadingText}>Loading TikTok preview...</Text>
            </View>
        );
    }

    if (error || !oembedData) {
        return (
            <TouchableOpacity style={styles.errorContainer} onPress={handlePress}>
                <Text style={styles.errorText}>{error || 'Failed to load TikTok preview'}</Text>
                <Text style={styles.urlText}>{url}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <View style={styles.thumbnailContainer}>
                {oembedData.thumbnail_url && (
                    <Image 
                        source={{ uri: oembedData.thumbnail_url }} 
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />
                )}
                <View style={styles.playButton}>
                    <Text style={styles.playIcon}>▶️</Text>
                </View>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={2}>
                    {oembedData.title || 'TikTok Video'}
                </Text>
                <Text style={styles.author}>
                    @{oembedData.author_name}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loadingContainer: {
        height: 280,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 14,
    },
    errorContainer: {
        height: 280,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 20,
    },
    errorText: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
    urlText: {
        color: '#999',
        fontSize: 12,
        textAlign: 'center',
    },
    thumbnailContainer: {
        position: 'relative',
        height: 200,
        backgroundColor: '#f0f0f0',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    playButton: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIcon: {
        fontSize: 20,
        color: '#ffffff',
    },
    infoContainer: {
        padding: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    author: {
        fontSize: 14,
        color: '#666',
    },
});

export default TikTokOEmbedComponent; 