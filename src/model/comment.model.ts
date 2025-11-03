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


export interface Comment extends Document {
    _id: mongoose.Types.ObjectId;
    content: string;
    attachments?: string[];
    post: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    parentComment?: mongoose.Types.ObjectId;
    // image: string;
    // video: string;
    // audio: string;
    // shares?: mongoose.Types.ObjectId[];
    // mentions: mongoose.Types.ObjectId[];
    // allowsComments: allowsComments;
    // availablility?: Availablility;
    createdBy: mongoose.Types.ObjectId;
    deletedAt?: Date;
    deletedBy?: mongoose.Types.ObjectId;
    restoredAt?: Date;
    restoredBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}


const Commentschema = new mongoose.Schema<Comment>({
    content: { type: String },
    attachments: { type: [String] },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    // shares: { type: [mongoose.Schema.Types.ObjectId], ref: "Post" },
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

Commentschema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
})

const postModel: mongoose.Model<Comment> =
  mongoose.models.Comment || mongoose.model<Comment>("Comment", Commentschema);

export default postModel;
