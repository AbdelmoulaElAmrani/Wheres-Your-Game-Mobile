import { useState } from 'react';
import { Alert, Platform } from 'react-native';

export interface AlertConfig {
    title: string;
    message: string;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
}

export const useAlert = () => {
    const [showStyledAlert, setShowStyledAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState<AlertConfig>({
        title: '',
        message: '',
        onConfirm: () => {},
        onCancel: () => {},
        confirmText: 'OK',
        cancelText: 'Cancel',
        showCancel: false
    });

    const showAlert = (config: AlertConfig) => {
        if (Platform.OS === 'android') {
            setAlertConfig(config);
            setShowStyledAlert(true);
        } else {
            // For iOS, use native Alert
            if (config.showCancel) {
                Alert.alert(
                    config.title,
                    config.message,
                    [
                        {
                            text: config.cancelText || 'Cancel',
                            style: 'cancel',
                            onPress: config.onCancel
                        },
                        {
                            text: config.confirmText || 'OK',
                            onPress: config.onConfirm
                        }
                    ]
                );
            } else {
                Alert.alert(
                    config.title,
                    config.message,
                    [
                        {
                            text: config.confirmText || 'OK',
                            onPress: config.onConfirm
                        }
                    ]
                );
            }
        }
    };

    const showErrorAlert = (message: string, onConfirm?: () => void) => {
        showAlert({
            title: 'Error',
            message,
            onConfirm,
            confirmText: 'OK'
        });
    };

    const showSuccessAlert = (message: string, onConfirm?: () => void) => {
        showAlert({
            title: 'Success',
            message,
            onConfirm,
            confirmText: 'OK'
        });
    };

    const showConfirmationAlert = (
        title: string,
        message: string,
        onConfirm: () => void | Promise<void>,
        onCancel?: () => void,
        confirmText = 'Confirm',
        cancelText = 'Cancel'
    ) => {
        showAlert({
            title,
            message,
            onConfirm,
            onCancel,
            confirmText,
            cancelText,
            showCancel: true
        });
    };

    const closeAlert = () => {
        setShowStyledAlert(false);
    };

    return {
        showAlert,
        showErrorAlert,
        showSuccessAlert,
        showConfirmationAlert,
        closeAlert,
        showStyledAlert,
        alertConfig
    };
}; 