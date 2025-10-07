import { Model } from "mongoose";
import { RevokeToken } from "../../model/revoketoken.js";
import { DbRepository } from "./db.repository.js";
import { HydratedDocument } from "mongoose";
import { AppError } from "../../utils/classError.js";




export class RevokeTokenRepository extends DbRepository<RevokeToken> {
    constructor(protected readonly  model:Model<RevokeToken>) {
        super(model);
     }


}