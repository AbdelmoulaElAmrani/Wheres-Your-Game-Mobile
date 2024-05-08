enum SportLevel {
    Beginner,
    Intermediate,
    Advance,
}


export const convertStringToEnumValue = <T>(enumObj: T, value: any): T[keyof T] | null => {
    
    const formattedValue = value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase();

    const entries = Object.entries(enumObj as Record<string, any>).find(([, v]) => {
        return v === formattedValue;
    });

    if (entries) {
         return enumObj[entries[0] as keyof T];
    }
    return null;
};


export default SportLevel