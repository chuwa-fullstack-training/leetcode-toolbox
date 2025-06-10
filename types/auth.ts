export interface SignupToken {
    id: string;
    token: string;
    email: string;
    batchId: string;
    isUsed: boolean;
    expiresAt: Date;
    createdAt: Date;
}

export interface User {
    id: string;
    email: string;
    name: string;
    batchId?: string;
    createdAt: Date;
    onboardingCompleted: boolean;
}