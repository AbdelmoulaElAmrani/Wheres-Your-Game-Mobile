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

    static _sanitizePhoneNumber = (phoneNumber: string): string => {
        return phoneNumber.replace(/[-\s()]/g, '');
    }

    static _isPasswordValid = (password: string): boolean => {
        //const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
        const re = /^(?=.*[A-Z]).{6,}$/;
        return re.test(password);
    }

    static timeAgo = (date: Date): string => {
        const now = new Date();
        const givenDate = new Date(date);
        const diffInSeconds = Math.floor((now.getTime() - givenDate.getTime()) / 1000);

        const secondsInMinute = 60;
        const secondsInHour = 60 * secondsInMinute;
        const secondsInDay = 24 * secondsInHour;
        const secondsInWeek = 7 * secondsInDay;
        const secondsInYear = 365 * secondsInDay;

        if (diffInSeconds < secondsInMinute) {
            return `${diffInSeconds}s`;
        } else if (diffInSeconds < secondsInHour) {
            const minutes = Math.floor(diffInSeconds / secondsInMinute);
            return `${minutes}min`;
        } else if (diffInSeconds < secondsInDay) {
            const hours = Math.floor(diffInSeconds / secondsInHour);
            return `${hours}h`;
        } else if (diffInSeconds < secondsInWeek) {
            const days = Math.floor(diffInSeconds / secondsInDay);
            return `${days}d`;
        } else if (diffInSeconds < secondsInYear) {
            const weeks = Math.floor(diffInSeconds / secondsInWeek);
            return `${weeks}w`;
        } else {
            const years = Math.floor(diffInSeconds / secondsInYear);
            return `${years}y`;
        }
    }
    static formatDateTime = (date: Date): string => {
        const now = new Date();
        const givenDate = new Date(date);

        // Helper function to add leading zero
        const addLeadingZero = (num: number) => (num < 10 ? `0${num}` : num);

        // Check if the date is today
        if (
            now.getDate() === givenDate.getDate() &&
            now.getMonth() === givenDate.getMonth() &&
            now.getFullYear() === givenDate.getFullYear()
        ) {
            const hours = givenDate.getHours();
            const minutes = addLeadingZero(givenDate.getMinutes());
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
            return `${formattedHours}:${minutes} ${ampm}`;
        }

        // Check if the date is yesterday
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (
            yesterday.getDate() === givenDate.getDate() &&
            yesterday.getMonth() === givenDate.getMonth() &&
            yesterday.getFullYear() === givenDate.getFullYear()
        ) {
            return 'yesterday';
        }

        // Check if the date is within the past week
        const dayDiff = Math.floor((now.getTime() - givenDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff < 7) {
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return daysOfWeek[givenDate.getDay()];
        }

        // Otherwise, return the date in DD/MM/yyyy format
        const day = addLeadingZero(givenDate.getDate());
        const month = addLeadingZero(givenDate.getMonth() + 1); // Months are zero-based
        const year = givenDate.getFullYear();
        return `${day}/${month}/${year}`;
    }

    static formatDateOnNotificationOrChat = (date: Date, isNotification: boolean = false): string => {
        if (isNotification) {
            return Helpers.timeAgo(date);
        } else {
            return Helpers.formatDateTime(date);
        }
    }

    static getImageSource = (imgSource: any) => {
        return `data:image/jpeg;base64,${imgSource}`
    }

    static calculateAge = (dateOfBirth: Date) => {
        if (!dateOfBirth) return "";
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    static checkIfAlreadyFollow = (personId: string | undefined, followers: string [] | undefined): boolean => {
        if (personId && followers) {
            return followers.includes(personId);
        }
        return false;
    }

    static isVideoLink = (url: string): boolean => {
        const videoExtensions = /\.(mp4|mov|avi|mkv|flv|wmv|webm)$/i;

        const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)/;

        if (videoExtensions.test(url)) {
            return true;
        }
        return youtubeRegex.test(url);
    };

    static validatePhoneNumber = (phoneNumber: string): boolean => {
        const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/; // Basic phone number regex
        return phoneRegex.test(phoneNumber);
    };


    static validEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

}