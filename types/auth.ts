export interface SignupToken {
    id: string;
    token: string;
    email: string;
    isUsed: boolean;
    expiresAt: Date;
    createdAt: Date;
}

export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    onboardingCompleted: boolean;
}