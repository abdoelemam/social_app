import { HydratedDocument } from "mongoose";
import { User } from "../model/user.model";
import { JwtPayload } from "jsonwebtoken";


//declaration merging
declare module "express-serve-static-core" {
    interface Request {
        user: HydratedDocument<User>;
        decoded: JwtPayload;
    }
}