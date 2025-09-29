import { Model } from "mongoose";
import { User } from "../../model/user.model";
import { DbRepository } from "./db.repository.js";
import { HydratedDocument } from "mongoose";
import { AppError } from "../../utils/classError.js";




export class UserRepository extends DbRepository<User> {
    constructor(protected readonly  model:Model<User>) {
        super(model);
     }

    async createOneUser(data:Partial<User>): Promise<HydratedDocument<User>>{
       const user: HydratedDocument<User> = await this.model.create(data);
       if(!user){
        throw new AppError("fail to create user", 500);
       }
       return user;
    }

}