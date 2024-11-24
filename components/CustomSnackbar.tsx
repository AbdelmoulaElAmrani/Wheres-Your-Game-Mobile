import {StyleSheet} from 'react-native'
import React from 'react'
import {Snackbar} from 'react-native-paper';


interface Props {
    visible: boolean;
    onDismissSnackBar: () => void;
    duration: number;
    content: string;
    type?: 'success' | 'error';
}

const CustomSnackbar: React.FC<Props> = ({visible, onDismissSnackBar, duration, content, type}) => {
    return (
        <Snackbar
            visible={visible}
            onDismiss={onDismissSnackBar}
            duration={duration}
            action={{
                label: 'Close',
                onPress: onDismissSnackBar,
            }}
            style={[styles.snackbar, type === 'error' &&
            // @ts-ignore
            {backgroundColor: 'red', color: 'white', fontWeight: 'bold'},
                type === 'success' &&
                // @ts-ignore
                {backgroundColor: 'green', color: 'white', fontWeight: 'bold'}
            ]}>
            {content}
        </Snackbar>
    )
}

export default CustomSnackbar

const styles = StyleSheet.create({
    snackbar: {
        zIndex: 999,
        marginBottom: 60,
    },
});