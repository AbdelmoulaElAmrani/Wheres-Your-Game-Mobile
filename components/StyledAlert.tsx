import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

interface AlertConfig {
    title: string;
    message: string;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
}

interface StyledAlertProps {
    visible: boolean;
    config: AlertConfig;
    onClose: () => void;
}

const StyledAlert: React.FC<StyledAlertProps> = ({ visible, config, onClose }) => {
    if (!visible || Platform.OS !== 'android') return null;

    const {
        title,
        message,
        onConfirm,
        onCancel,
        confirmText = 'OK',
        cancelText = 'Cancel',
        showCancel = false
    } = config;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.alertOverlay}>
                <View style={styles.alertContainer}>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>{title}</Text>
                        <Text style={styles.alertMessage}>{message}</Text>
                        
                        <View style={[
                            styles.alertButtonContainer,
                            !showCancel && styles.alertSingleButtonContainer
                        ]}>
                            {showCancel && (
                                <TouchableOpacity
                                    style={[styles.alertButton, styles.alertCancelButton]}
                                    onPress={onCancel || onClose}
                                >
                                    <Text style={styles.alertCancelButtonText}>{cancelText}</Text>
                                </TouchableOpacity>
                            )}
                            
                            <TouchableOpacity
                                style={[
                                    styles.alertButton, 
                                    styles.alertConfirmButton,
                                    !showCancel && styles.alertSingleButton
                                ]}
                                onPress={async () => {
                                    try {
                                        if (onConfirm) {
                                            await onConfirm();
                                        }
                                    } catch (error) {
                                        console.error('Error in alert confirm:', error);
                                    }
                                }}
                            >
                                <Text style={styles.alertConfirmButtonText}>{confirmText}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    alertOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    alertContainer: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 28,
        width: '100%',
        maxWidth: 380,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
    },
    alertContent: {
        alignItems: 'center',
    },
    alertTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
        textAlign: 'center',
    },
    alertMessage: {
        fontSize: 16,
        color: '#666',
        marginBottom: 28,
        textAlign: 'center',
        lineHeight: 22,
    },
    alertButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: 12,
    },
    alertButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    alertCancelButton: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    alertCancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6c757d',
    },
    alertConfirmButton: {
        backgroundColor: '#2757CB',
    },
    alertConfirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    alertSingleButton: {
        backgroundColor: '#2757CB',
        maxWidth: 200,
        alignSelf: 'center',
    },
    alertSingleButtonContainer: {
        justifyContent: 'center',
    },
});

export default StyledAlert; 