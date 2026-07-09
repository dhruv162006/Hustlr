import { TokenPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  profile?: any;
}
