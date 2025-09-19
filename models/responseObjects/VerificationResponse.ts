interface VerificationResponse {
    isValid?: boolean; // Made optional for backward compatibility
    valid?: boolean; // Backend returns this field
    resetToken: string;
    message?: string; // Added this field
}

export default VerificationResponse;