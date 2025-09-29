import mongoose, { Types } from "mongoose";

export enum Gendertype {
    male = "male",
    female = "female",
    other = "other",
}

export enum Roletype {
    user = "user",
    admin = "admin",
}

export interface User {
    Id: Types.ObjectId;
    fname: string;
    lname: string;
    username?: string;
    email: string;
    password: string;
    age: number;
    gender: Gendertype;
    phone?: string;
    role?: Roletype;
    createdAt: Date;
    updatedAt: Date;
    // country: string;
    // city: string;
    // image: string;
    // status: string;
}

const userschema = new mongoose.Schema<User>({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true , min: 3, max: 20 },
    age: { type: Number, required: true },
    gender: { type: String, enum: Gendertype, required: true },
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: Roletype, default: Roletype.user }, 
    // country: { type: String, required: false },
    // city: { type: String, required: false },
    // image: { type: String, required: false },
    // status: { type: String, required: false },
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
})

userschema.virtual("username").set(function(value){
    const [fname, lname] = value.split(" ");
    this.set({ fname, lname });
}).get(function () {
    return this.fname + " " + this.lname;
})


const userModel = mongoose.models.User || mongoose.model<User>("User", userschema);

export default userModel;