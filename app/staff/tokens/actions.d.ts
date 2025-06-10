export interface SignupToken {
  id: string;
  token: string;
  email: string;
  batchId: string;
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export declare function createToken(email: string, batchId: string): Promise<SignupToken | null>;
export declare function getTokens(): Promise<SignupToken[]>;
export declare function getBatches(): Promise<Array<{
  id: string;
  name: string;
  type: string;
}>>;