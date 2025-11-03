import { Model, RootFilterQuery } from "mongoose";
import { DbRepository } from "./db.repository.js";
import { HydratedDocument } from "mongoose";
import { AppError } from "../../utils/classError.js";
import { Post } from "../../model/post.model";




export class PostRepository extends DbRepository<Post> {
    constructor(protected readonly  model:Model<Post>) {
        super(model);
     }

    async findWithPopulate(filter: RootFilterQuery<Post>, populateField: string): Promise<HydratedDocument<Post>[]> {
        return this.model.find(filter).populate(populateField);
    }


}