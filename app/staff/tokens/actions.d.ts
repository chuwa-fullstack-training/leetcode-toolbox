export interface SignupToken {
  id: string;
  token: string;
  email: string;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export declare function createToken(email: string): Promise<SignupToken | null>;
export declare function getTokens(): Promise<SignupToken[]>;