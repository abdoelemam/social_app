import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "./classError.js";

export enum Tokentype {
    access = "access",
    refresh = "refresh",
}

export const generateToken = async (payload: Object, signature: string, options?: jwt.SignOptions): Promise<string> => {
    return  jwt.sign(payload, signature, options);
}

export const verifyToken = async (token: string, signature: string): Promise<JwtPayload> => {
    return  jwt.verify(token, signature) as JwtPayload;
}

export const getSignature = (tokenType:Tokentype, prefix: string) => {
    let signature = "";
    if(tokenType === Tokentype.access){
        if(prefix === "Bearer"){
            return signature = process.env.access_signiture_user!;
        }
        else if(prefix === "Admin"){
            return signature = process.env.access_signiture_admin!;
        }
        return null
    }
    if(tokenType === Tokentype.refresh){
        if(prefix === "Bearer"){
            return signature = process.env.refresh_signiture_user!;
        }
        else if(prefix === "Admin"){
            return signature = process.env.refresh_signiture_admin!;
        }
        return null
    }
    
    return null;
    
}

export const getdecoded = (token:string, signature:string) => {
    
    try {
        return jwt.verify(token, signature) as jwt.JwtPayload;
    } catch (error) {
        throw new AppError(`Invalid token ${error}`,  400);
    }
}