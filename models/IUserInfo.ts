export interface IUserInfo {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    countryCode: string,
    imageUrl?: string
}

export interface IResetTokenObj {
    id: string,
    resetToken: string
}