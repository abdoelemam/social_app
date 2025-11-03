import mongoose, { Document, Model, Types } from "mongoose";

export enum Gendertype {
  male = "male",
  female = "female",
  other = "other",
}

export enum Roletype {
  user = "user",
  admin = "admin",
}

export enum Provider {
  google = "google",
  facebook = "facebook",
  local = "local",
}

export interface User extends Document {
  _id: Types.ObjectId;
  fname?: string;
  lname?: string;
  username?: string;
  email: string;
  password: string;
  age?: number;
  gender?: Gendertype;
  phone?: string;
  role?: Roletype;
  confirmed?: boolean;
  otp?: string;
  image?: string;
  tempimage?: string;
  changeCardentails?: Date;
  provider?: Provider; // or Provider.facebook or Provider.local
  DeletedAt?: Date;
  DeletedBy?: Types.ObjectId;
  restoredAt?: Date;
  frozen?: boolean;
  frozenAt?: Date;
  restoredBy?: Types.ObjectId;
  friends?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userschema = new mongoose.Schema<User>(
  {
    fname: { type: String },
    lname: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    age: { type: Number },
    gender: { type: String, enum: Object.values(Gendertype) },
    phone: { type: String,  unique: true },
    role: { type: String, enum: Object.values(Roletype), default: Roletype.user },
    confirmed: { type: Boolean, default: false },
    otp: { type: String },
    image: { type: String },
    tempimage: { type: String },
    changeCardentails: { type: Date },
    frozen: { type: Boolean, default: false },
    frozenAt: { type: Date },
    DeletedAt: { type: Date },
    DeletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restoredAt: { type: Date },
    restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    friends: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
    provider: { type: String, enum: Object.values(Provider), default: Provider.local }, // or Provider.facebook or Provider.local, default: Provider.local
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

userschema
  .virtual("username")
  .set(function (this: User, value: string) {
    const [fname, lname] = value.split(" ");
    this.set({ fname, lname });
  })
  .get(function (this: User) {
    return this.fname + " " + this.lname;
  });

const userModel: Model<User> =
  mongoose.models.User || mongoose.model<User>("User", userschema);

export default userModel;
