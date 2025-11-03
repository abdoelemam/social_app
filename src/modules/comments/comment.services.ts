import { PostRepository } from "../../DB/repositories/post.reposirory.js";
import { NextFunction, Request, Response } from "express";
import { UserRepository } from "../../DB/repositories/user.repository.js";
import postModel, { allowsComments, Availablility } from "../../model/post.model.js";
import userModel from "../../model/user.model.js";
import { deletefiles, uploadFiles } from "../../utils/s3.config.js";
import { AppError } from "../../utils/classError.js";
import { url } from "inspector";
import { CommentRepository } from "../../DB/repositories/comment.repository.js";
import Comment from "../../model/comment.model.js";
import { Types } from "mongoose";

class UserService{

    // private _userModel:Model<User> = userModel;
    private _userModel = new UserRepository(userModel);
    private _postModel = new PostRepository(postModel);
    private _commentModel = new CommentRepository(Comment);
    constructor(){

    }


    createComment = async (req: Request, res: Response) => {
        const { postId } = req.params;
        const { content } = req.body;
        let urls: string[] = [];
        if(req.files?.length){
            urls = await uploadFiles({ files: req.body.attachments as Express.Multer.File[], path: `Users/${req.user._id}/comments` });
        }

        const post = await this._postModel.findOne({ _id: postId });
        if(!post){
            throw new AppError("post not found", 404);
        }

 
        const comment = await this._commentModel.create({ content, attachments: urls, post: new Types.ObjectId(postId), createdBy: req.user._id });
        return res.status(200).json({ message: "comment created", params :req.params, comment });
    }
    
    createReply = async (req: Request, res: Response) => {
        const { postId, commentId } = req.params; // هناخد الأب (الكومنت)
        const { content } = req.body;
        let urls: string[] = [];

        if(req.files?.length){
            urls = await uploadFiles({ files: req.body.attachments as Express.Multer.File[], path: `Users/${req.user._id}/comments` });
        }
        const post = await this._postModel.findOne({ _id: postId });
        if (!post) {
            throw new AppError("Post not found", 404);
        }

        
        const parentComment = await this._commentModel.findOne({ _id: commentId, post: postId });
        if (!parentComment) {
            throw new AppError("Parent comment not found", 404);
        }

       
        const reply = await this._commentModel.create({
            content,
            attachments: urls,
            post: new Types.ObjectId(postId),
            createdBy: req.user._id,
            parentComment: new Types.ObjectId(commentId) 
        });

        return res.status(201).json({ message: "Reply created", reply });
    }


    getComments = async (req: Request, res: Response) => {
        const { postId } = req.params;

       
        const comments = await Comment.find({ 
                post: postId,
                parentComment: null 
            })
            .populate("createdBy", "fname lname image") 
            .populate({
                path: "replies", 
                populate: { 
                    path: "createdBy",
                    select: "fname lname image" 
                }
            })
            .sort({ createdAt: -1 })
            .exec(); 

        return res.status(200).json({ message: "comments", comments });
    }

    


    

}

export default new UserService();
