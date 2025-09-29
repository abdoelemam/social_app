import express, { Request, Response, NextFunction } from "express";
import  z from "zod";
import { AppError } from "../../utils/classError.js";
import userModel, { User } from "../../model/user.model.js";
import { HydratedDocument, Model } from "mongoose";
// import { DbRepository } from "../../DB/repositories/db.repository.js";
import { UserRepository } from "../../DB/repositories/user.repository.js";
import { hashPassword } from "../../utils/hash.js";
import { generateOTP, sendmail } from "../../service/sendmail.js";
import { emailTemplate } from "../../service/email.temp.js";


class UserService{

    // private _userModel:Model<User> = userModel;
    private _userModel = new UserRepository(userModel);

    constructor(){

    }

    signup = async (req: Request, res: Response) => {
    const { username, email, password, cpassword, age, gender, phone } = req.body;

    // const user: HydratedDocument<User> = await this._userModel.create({ username, email, password, age, gender, phone });
    
    const existingUser = await this._userModel.findOne({ email });
    console.log(existingUser);
    if (!existingUser) {
    throw new AppError("email already exists", 400);
    }   

    // if(await this._userModel.findOne({ email }) !== null){
    //     throw new AppError("email already exists", 400);
    // }


    

    // hash password
    const hashedPassword = await hashPassword(password);
    await this._userModel.createOneUser({ username, email, password, age, gender, phone });  
    // generate otp
    const OTP = generateOTP(6);

    return res.status(200).json({ message: "signup successful" }), 
        await sendmail({
        to: email,
        subject: "Welcome to my app",
        html: emailTemplate(OTP),
        
    });;

}; 

    signin = (req: Request, res: Response) => {
    const {email, password } = req.body;

    return res.status(200).json({ message: "signin successful" });
}; 

}

export default new UserService();