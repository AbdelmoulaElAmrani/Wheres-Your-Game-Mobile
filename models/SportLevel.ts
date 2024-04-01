enum SportLevel {
    Beginner,
    Intermediate,
    Advance,
}


export const convertStringToEnumValue = <T>(enumObj: T, value: any): T[keyof T] | null => {
    const entries = Object.entries(enumObj).find(([_, enumValue]) => enumValue === value);
    if (entries) {
        return enumObj[entries[0] as keyof T];
    }
    return null;
};


export default SportLevel