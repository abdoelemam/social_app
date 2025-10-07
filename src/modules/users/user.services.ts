import express, { Request, Response, NextFunction } from "express";
import  z from "zod";
import { AppError } from "../../utils/classError.js";
import userModel, { Provider, Roletype, User } from "../../model/user.model.js";
import { HydratedDocument, Model } from "mongoose";
// import { DbRepository } from "../../DB/repositories/db.repository.js";
import { UserRepository } from "../../DB/repositories/user.repository.js";
import { comparePassword, hashPassword } from "../../utils/hash.js";
import { generateOTP, sendmail } from "../../service/sendmail.js";
import { emailTemplate } from "../../service/email.temp.js";
import { ConfirmEmailSchemaType } from "./uservalidation.js";
import { generateToken, getdecoded } from "../../utils/token.js";
import { RevokeTokenRepository } from "../../DB/repositories/RevokeToken.js";
import RevokeToken from "../../model/revoketoken.js";
import { v4 as uuidv4 } from 'uuid'; // or import { v4 as uuidv4 } from 'uuid'; if you are using Typescript
import { OAuth2Client } from 'google-auth-library'; // or import { OAuth2Client } from 'google-auth-library'; if you are using Typescript


class UserService{

    // private _userModel:Model<User> = userModel;
    private _userModel = new UserRepository(userModel);
    private _revokeTokenModel = new RevokeTokenRepository(RevokeToken);
    constructor(){

    }

    signup = async (req: Request, res: Response) => {
    const { username, email, password, cpassword, age, gender, phone } = req.body;

    // const user: HydratedDocument<User> = await this._userModel.create({ username, email, password, age, gender, phone });
    
    const existingUser = await this._userModel.findOne({ email });
    if (existingUser) {
    throw new AppError("email already exists", 400);
    }   

    // if(await this._userModel.findOne({ email }) !== null){
    //     throw new AppError("email already exists", 400);
    // }


    

    // hash password
    const hashedPassword = await hashPassword(password);
     
    // generate otp
    const OTP = generateOTP(6);
    const hashotp = await hashPassword(OTP);

    const user = await this._userModel.createOneUser({ username, email, password:hashedPassword, age, gender, phone, otp:hashotp }); 

    return res.status(200).json({ message: "signup successful", user }), 
        await sendmail({
        to: email,
        subject: "Welcome to my app",
        html: emailTemplate(OTP, "Confirm Email"),
        
    });;

}; 

    loginWithGmail = async (req: Request, res: Response) => {
        const { idToken } = req.body;

        // const { OAuth2Client } = require('google-auth-library'); // or import { OAuth2Client } from 'google-auth-library'; if you are using Typescript
        const client = new OAuth2Client();
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken ,
                audience: process.env.WEB_CLIENT_ID,  // Specify the WEB_CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
            });
            const payload = ticket.getPayload();
            return payload;
            // This ID is unique to each Google Account, making it suitable for use as a primary key
            // during account lookup. Email is not a good choice because it can be changed by the user.
            // const userid = payload['sub'];
            // console.log("userid", userid);
            // If the request specified a Google Workspace domain:
            // const domain = payload['hd'];
            }
            const data = await  verify()

            // const provider = Provider.google;
            

            let user = await this._userModel.findOne({ email: data?.email }) as HydratedDocument<User> | null;
            if(!user){
                user = await this._userModel.createOneUser({ username: data?.name, email: data?.email, password: "", confirmed: data?.email_verified!, image: data?.picture, role: Roletype.user, provider: Provider.google });
            }
            console.log(user?.provider)
            if( user?.provider !== Provider.google){
                throw new AppError("please login with system", 400);
            }

            
            const jwtid = uuidv4(); 
            
            const accesstoken = await generateToken({ id: user._id, email: user.email },   
            user.role === Roletype.user ? process.env.access_signiture_user! 
            : process.env.access_signiture_admin! , { expiresIn: "1h", jwtid: jwtid} );

            const refreshtoken = await generateToken({ id: user._id, email: user.email },   
            user.role === Roletype.user ? process.env.refresh_signiture_user as string
            : process.env.refresh_signiture_admin as string , { expiresIn: "1y", jwtid: jwtid } );

            return res.status(200).json({ message: "login successful", accesstoken, refreshtoken });
        }

    confirmEmail = async (req: Request, res: Response) => {
    const { email, otp }: ConfirmEmailSchemaType = req.body;

    const user = await this._userModel.findOne({ email, confirmed: false }  ) as HydratedDocument<User> | null;

    if (!user) {
        throw new AppError("email not found", 404);
    }
    if (user?.confirmed ) {
        throw new AppError("email already confirmed", 400);
    }

    // compare otp
    const compareotp = await comparePassword(otp, user.otp!);

    if (!compareotp) {
        throw new AppError("invalid otp", 400);
    }
    await this._userModel.updateOne({ email: user.email }, { confirmed: true, otp: "" });
    return res.status(200).json({ message: "email confirmed" });
};

    signin = async (req: Request, res: Response) => {
    const {email, password } = req.body;
    const user = await this._userModel.findOne({ email, confirmed: true }) as HydratedDocument<User> | null;
    const jwtid = uuidv4(); 
    if (!user) {
        throw new AppError("email not exist or not confirmed", 404);
    }
    if (!comparePassword(password, user.password)) {
        throw new AppError("invalid password", 400);
    }

    const accesstoken = await generateToken({ id: user._id, email: user.email },   
        user.role === Roletype.user ? process.env.access_signiture_user! 
        : process.env.access_signiture_admin! , { expiresIn: "1h", jwtid: jwtid} );

        const refreshtoken = await generateToken({ id: user._id, email: user.email },   
        user.role === Roletype.user ? process.env.refresh_signiture_user as string
        : process.env.refresh_signiture_admin as string , { expiresIn: "1y", jwtid: jwtid } );

    return res.status(200).json({ message: "signin successful", accesstoken, refreshtoken });
}; 

    getProfile = async (req: Request, res: Response) => {
    const { user } = req;
    return res.status(200).json({ message: "profile", user });
};

    logout = async (req: Request, res: Response) => {
    const { flag } = req.body;
    if(flag === "all"){
        await this._userModel.updateOne({ _id: req.decoded.id }, { changeCardentails: new Date() });
        return res.status(200).json({ message: "logout successful from all devices"});
    }


    await this._revokeTokenModel.create({ userId: req.decoded.id, tokenId: req.decoded.jti!, expiredAt: new Date(req.decoded.exp! * 1000) });
    return res.status(200).json({ message: "logout successful from this device"});
};

    refreshToken = async (req: Request, res: Response) => {
        console.log(req.user)
        const jwtid = uuidv4();
        const accesstoken = await generateToken({ id: req.user?._id, email: req.user?.email },   
        req.user.role === Roletype.user ? process.env.access_signiture_user! 
        : process.env.access_signiture_admin! , { expiresIn: "1h", jwtid: jwtid} );

        const refreshtoken = await generateToken({ id: req.user?._id, email: req.user?.email },   
        req.user.role === Roletype.user ? process.env.refresh_signiture_user as string
        : process.env.refresh_signiture_admin as string , { expiresIn: "1y", jwtid: jwtid } );

    return res.status(200).json({ message: "signin successful", accesstoken, refreshtoken });

    }

    forgetPassword = async (req: Request, res: Response) => {
        const { email } = req.body;
        const user = await this._userModel.findOne({ email }) as HydratedDocument<User> | null;
        if (!user) {
            throw new AppError("email not found", 404);
        } 
        const OTP = generateOTP(6);
        const hashotp = await hashPassword(OTP);
        await this._userModel.updateOne({ email }, { otp: hashotp });
        await sendmail({
            to: email,
            subject: "Forget Password",
            html: emailTemplate(OTP, "Forget Password"),
        });
        return res.status(200).json({ message: "email sent" });  
    }

    resetPassword = async (req: Request, res: Response) => {
        const { email, otp, password } = req.body;
        const user = await this._userModel.findOne({ email }) as HydratedDocument<User> | null;
        if (!user) {
            throw new AppError("email not found", 404);
        }
        if (!comparePassword(otp, user.otp!)) {
            throw new AppError("invalid otp", 400);
        }
        const hashedPassword = await hashPassword(password);
        await this._userModel.updateOne({ email }, { password: hashedPassword, otp: "" });
        return res.status(200).json({ message: "password reset  successful" });
    }


}

export default new UserService();
