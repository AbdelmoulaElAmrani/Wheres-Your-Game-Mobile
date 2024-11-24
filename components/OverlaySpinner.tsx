import React from 'react';
import { View, StyleSheet } from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import { MD2Colors } from 'react-native-paper';

interface SpinnerProps {
    visible: boolean;
    color?: string;
    size?: number | "small" | "large";
}


const OverlaySpinner: React.FC<SpinnerProps> = ({ visible, color = MD2Colors.blueA700, size = 40 }) => {
    if (!visible) return null;

    return (
        <View style={styles.container}>
            <ActivityIndicator animating={true} color={color} size={size} />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
});

export default OverlaySpinner