import { HydratedDocument, Model, ProjectionType, RootFilterQuery } from "mongoose";

export abstract class DbRepository<TDocument> {
    constructor(protected readonly  model:Model<TDocument>) { }

    async create(data:Partial<TDocument>): Promise<HydratedDocument<TDocument>>{
        return  this.model.create(data);
    }

    async findOne(filter:RootFilterQuery<TDocument>, select?: ProjectionType<TDocument>): Promise<HydratedDocument<TDocument> | null []>{
        return  this.model.find(filter);
    }


}