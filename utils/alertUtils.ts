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

export const showAlert = (config: AlertConfig) => {
    const {
        title,
        message,
        onConfirm,
        onCancel,
        confirmText = 'OK',
        cancelText = 'Cancel',
        showCancel = false
    } = config;

    if (Platform.OS === 'android') {
        // For Android, we'll use a callback system
        // The component using this should handle the state
        return {
            type: 'android' as const,
            config: {
                title,
                message,
                onConfirm: onConfirm || (() => {}),
                onCancel: onCancel || (() => {}),
                confirmText,
                cancelText,
                showCancel
            }
        };
    } else {
        // For iOS, use native Alert
        if (showCancel) {
            Alert.alert(
                title,
                message,
                [
                    {
                        text: cancelText,
                        style: 'cancel',
                        onPress: onCancel
                    },
                    {
                        text: confirmText,
                        onPress: onConfirm
                    }
                ]
            );
        } else {
            Alert.alert(
                title,
                message,
                [
                    {
                        text: confirmText,
                        onPress: onConfirm
                    }
                ]
            );
        }
        return { type: 'ios' as const };
    }
};

// Convenience functions for common alert types
export const showErrorAlert = (message: string, onConfirm?: () => void) => {
    return showAlert({
        title: 'Error',
        message,
        onConfirm,
        confirmText: 'OK'
    });
};

export const showSuccessAlert = (message: string, onConfirm?: () => void) => {
    return showAlert({
        title: 'Success',
        message,
        onConfirm,
        confirmText: 'OK'
    });
};

export const showConfirmationAlert = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
) => {
    return showAlert({
        title,
        message,
        onConfirm,
        onCancel,
        confirmText,
        cancelText,
        showCancel: true
    });
}; 