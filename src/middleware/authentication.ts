import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/classError.js";
import { getdecoded, getSignature, Tokentype } from "../utils/token.js";
import userModel, { User } from "../model/user.model.js";
// import { HydratedDocument } from "mongoose";
import RevokeToken from "../model/revoketoken.js";
import { RevokeTokenRepository } from "../DB/repositories/RevokeToken.js";
import { UserRepository } from "../DB/repositories/user.repository.js";


const _revokeTokenModel = new RevokeTokenRepository(RevokeToken);
const _userModel = new UserRepository(userModel);
// export interface AuthRequest extends Request {
//     user: HydratedDocument<User>;
//     decoded: JwtPayload;
//   }



export const authentication =  (tokenType:Tokentype = Tokentype.access) => {

    return async (req:Request, res:Response, next:NextFunction) => {
        const {authorization} = req.headers;

        const [prefix , token] = authorization!.split("_")
   
        if(!token || !prefix){
            throw new AppError("Invalid token", 400);
        }

        const signature = getSignature(tokenType, prefix)
        
        const decoded = getdecoded(token, signature!);
        const user = await  _userModel.findOne({ email: decoded.email }) as User; // userModel.findOne(decoded.email)
        if (!user) {
           throw new AppError("user not found", 400);
        }
        if(user.frozen){
            throw new AppError("account  frozen", 400);
        }
        if(user.DeletedAt){
            throw new AppError("account deleted", 400);
        }
             
        // if(req.url !== "/refreshtoken"){
        //     if(await  _revokeTokenModel.findOne({tokenId: decoded.jti! })) 
        //     { throw new AppError("token revoked", 400) } ;        
        
        //     if(user.changeCardentails!.getTime() > (decoded.iat! * 1000)){
        //         throw new AppError("token has expired", 400);
        //     }
        // }

        // if(await _userModel.findOne({ _id: decoded.id, changeCardentails: { $gt: decoded.iat! * 1000 } })){
        //     throw new AppError("token has expired", 400);
        // }
        
       
        req.user = user as Request["user"];
        req.decoded = decoded;
        return next()
    }


    // } catch (error) {
    //     if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    //         throw new AppError(`Invalid token ${error}`,  400);
    //     }
    //     return res.status(400).json({ message: "server error", error });
    // }

}