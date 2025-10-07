import  z from "zod";


export const confirmEmailSchema = {
  body: z.object({
    email: z.string().email(),
    otp: z.string(),
  }),
};

export const signinSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
};;


export const signupSchema = {
  body: signinSchema.body.extend({
    username: z.string(),
    cpassword: z.string(),
    age: z.number(),
    gender: z.string(),
    phone: z.string(),
  }),
};;


export type SignupSchemaType = z.infer<typeof signupSchema>;  
export type ConfirmEmailSchemaType = z.infer<typeof confirmEmailSchema["body"]>;