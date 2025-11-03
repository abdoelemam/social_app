import mongoose, { Document, Model, Types } from "mongoose";



export enum allowsComments {
    allowsComments = "allowsComments",
    notAllowsComments = "denyComments",
}

export enum Availablility {
    public = "public",
    private = "private",
    friends = "friends",
}


export interface Post extends Document {
    _id: mongoose.Types.ObjectId;
    content: string;
    attachments?: string[];
    user: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    // comments: mongoose.Types.ObjectId[];
    // shares?: mongoose.Types.ObjectId[];
    mentions: mongoose.Types.ObjectId[];
    allowsComments: allowsComments;
    availablility?: Availablility;
    createdBy: mongoose.Types.ObjectId;
    deletedAt?: Date;
    deletedBy?: mongoose.Types.ObjectId;
    restoredAt?: Date;
    restoredBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}


const postschema = new mongoose.Schema<Post>({
    content: { type: String },
    attachments: { type: [String] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
    // comments: { type: [mongoose.Schema.Types.ObjectId], ref: "Comment" },
    // shares: { type: [mongoose.Schema.Types.ObjectId], ref: "Post" },
    mentions: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
    allowsComments: { type: String, enum: Object.values(allowsComments), default: allowsComments.allowsComments },
    availablility: { type: String, enum: Object.values(Availablility), default: Availablility.public },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restoredAt: { type: Date },
    restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

postschema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
})

postschema.pre(/^find/, async  function (next) {
  const query: any = this;
  if (query.getOptions().withDeleted === true) {
    return next(); 
  }
  query.where({ deletedAt: { $eq: null } });
  
  next();
});


const postModel: mongoose.Model<Post> =
  mongoose.models.Post || mongoose.model<Post>("Post", postschema);

export default postModel;
