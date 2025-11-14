import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { GOOGLE_ADS_BANNER_UNIT_ID, GOOGLE_ADS_BANNER_UNIT_ID_ANDROID, GOOGLE_ADS_BANNER_UNIT_ID_IOS } from '@/appConfig';

// Try to import ad components, but handle case where native module isn't available
let GoogleBannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  const adsModule = require('react-native-google-mobile-ads');
  GoogleBannerAd = adsModule.BannerAd;
  BannerAdSize = adsModule.BannerAdSize;
  TestIds = adsModule.TestIds;
} catch (error) {
  console.log('Google Mobile Ads native module not available. Using placeholder only.');
}

interface BannerAdComponentProps {
  adUnitId?: string;
  size?: any;
}

const BannerAdComponent: React.FC<BannerAdComponentProps> = ({ 
  adUnitId, 
  size 
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  
  // If native module is not available, always show placeholder
  if (!GoogleBannerAd) {
    return (
      <View style={styles.adContainer}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Ads Banner</Text>
        </View>
      </View>
    );
  }
  
  // Get the ad unit ID
  const adSize = size || BannerAdSize?.BANNER;
  const unitId = adUnitId || (Platform.OS === 'ios' ? GOOGLE_ADS_BANNER_UNIT_ID_IOS : GOOGLE_ADS_BANNER_UNIT_ID_ANDROID) || GOOGLE_ADS_BANNER_UNIT_ID || TestIds?.BANNER;
  
  // Always show placeholder initially (will be replaced when ad loads)
  if (!adLoaded) {
    return (
      <View style={styles.adContainer}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Ads Banner</Text>
        </View>
        {/* Load ad in background */}
        <GoogleBannerAd
          unitId={unitId}
          size={adSize}
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
          }}
          onAdLoaded={() => {
            console.log('✅ Ad loaded successfully');
            setAdLoaded(true);
            setAdError(false);
          }}
          onAdFailedToLoad={(error: any) => {
            console.log('❌ Ad failed to load:', error);
            setAdError(true);
          }}
        />
      </View>
    );
  }
  
  // Show ad when loaded
  return (
    <View style={styles.adContainer}>
      <GoogleBannerAd
        unitId={unitId}
        size={adSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('Ad loaded successfully');
          setAdLoaded(true);
          setAdError(false);
        }}
        onAdFailedToLoad={(error: any) => {
          console.log('Ad failed to load:', error);
          setAdError(true);
          setAdLoaded(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  adContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    minHeight: 60,
    marginVertical: 10,
  },
  placeholderContainer: {
    width: '100%',
    height: 60,
    backgroundColor: '#2196F3', // Blue color
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    minWidth: 320,
  },
  placeholderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BannerAdComponent;

