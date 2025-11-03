import  z from "zod";
import { allowsComments, Availablility } from "../../model/post.model.js";
import { v4 as uuidv4 } from "uuid";

export enum actiontype {
    like = "like",
    unlike = "unlike",
}

export const createCommentSchema = {
    body: z.object({
        content: z.string().optional(),
        attachments: z.array(z.object({
            fieldname: z.string(),
            originalname: z.string(),
            encoding: z.string(),
            mimetype: z.string(),
            buffer: z.instanceof(Buffer),
            path: z.string().optional(),
            size: z.number(),
        })).optional(),
    }).superRefine((val, ctx) => {
        if(!val.content && !val.attachments){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "content or attachments is required",
            });
        }
    })
};


export type CreatePostSchemaType = z.infer<typeof createCommentSchema>;
