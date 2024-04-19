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
}