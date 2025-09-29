import  z from "zod";


export const signupSchema = {
  body: z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string(),
    cpassword: z.string(),
    age: z.number(),
    gender: z.string(),
    phone: z.string(),
  }),
};;


// export type SignupSchemaType = z.infer<typeof signupSchema>;  