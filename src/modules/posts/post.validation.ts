import  z from "zod";
import { allowsComments, Availablility } from "../../model/post.model.js";
import { v4 as uuidv4 } from "uuid";

export enum actiontype {
    like = "like",
    unlike = "unlike",
}

export const createPostSchema = {
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
        mentions: z.array(z.any()).optional(),
        allowsComments: z.enum(allowsComments).default(allowsComments.allowsComments).optional(),
        availablility: z.enum(Availablility).default(Availablility.public).optional(),
    }).superRefine((val, ctx) => {
        if(!val.content && !val.attachments){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "content or attachments is required",
            });
        }
    })
};

export const likePostSchema = {
    params: z.object({
        postId: z.string(),
    }) ,
    query: z.object({
        action: z.enum(actiontype).default(actiontype.like),
    })
}


export type CreatePostSchemaType = z.infer<typeof createPostSchema>;
export type LikePostSchemaType = z.infer<typeof likePostSchema>;