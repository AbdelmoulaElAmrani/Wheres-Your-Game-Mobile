export class Helpers {

    static isObjectNullOrEmpty = <T extends object | string | null>(input: T): boolean => {
        if (input === null) return true;
        if (typeof input === 'string') return input.trim().length === 0;
        return Object.keys(input as object).length === 0;
    }

    static capitalize = (str?: string): string => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static _isEmailValid = (email: string): boolean => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    static _isPasswordValid = (password: string): boolean => {
        const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
        return re.test(password);
    }

    static formatNotificationDate = (timestamp: Date | undefined, isNotification?: boolean | false): string => {
        const messageDate = timestamp ? new Date(timestamp) : new Date();
        const currentDate = new Date();
        const yesterdayDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000));

        if (messageDate.toDateString() === currentDate.toDateString()) {
            const diffMinutes = (currentDate.getTime() - messageDate.getTime()) / (1000 * 60);
            if (diffMinutes < 1) {
                return "Now";
            }
            if (isNotification)
                return `${messageDate.getHours()}h ago`;
            else
                return `${messageDate.getHours()}:${messageDate.getMinutes().toString().padStart(2, '0')}`;
        }

        if (messageDate.toDateString() === yesterdayDate.toDateString()) {
            return "Yesterday";
        }

        return `${messageDate.getMonth() + 1}/${messageDate.getDate()}`;
    }
}