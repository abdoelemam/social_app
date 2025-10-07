import mongoose, { Document, Model, Types } from "mongoose";
import { string } from "zod";

export enum Gendertype {
  male = "male",
  female = "female",
  other = "other",
}

export enum Roletype {
  user = "user",
  admin = "admin",
}

export interface RevokeToken  {
  userId: Types.ObjectId  ;
  tokenId: string;
  expiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const revoketokenschema = new mongoose.Schema<RevokeToken>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    tokenId: { type: String, required: true },
    expiredAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);



const RevokeToken: Model<RevokeToken> =
  mongoose.models.RevokeToken || mongoose.model<RevokeToken>("RevokeToken", revoketokenschema);

export default RevokeToken;
