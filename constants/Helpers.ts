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
}