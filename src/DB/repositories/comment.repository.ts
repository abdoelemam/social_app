import { Model } from "mongoose";
import { DbRepository } from "./db.repository.js";
import { HydratedDocument } from "mongoose";
import { AppError } from "../../utils/classError.js";
import commentModel, { Comment } from "../../model/comment.model.js";




export class CommentRepository extends DbRepository<Comment> {
    constructor(protected readonly  model:Model<Comment>) {
        super(model);
     }



}