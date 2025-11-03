import { PostRepository } from "../../DB/repositories/post.reposirory.js";
import { NextFunction, Request, Response } from "express";
import { UserRepository } from "../../DB/repositories/user.repository.js";
import postModel, { Availablility } from "../../model/post.model.js";
import userModel from "../../model/user.model.js";
import { deletefiles, uploadFiles } from "../../utils/s3.config.js";
import { AppError } from "../../utils/classError.js";
import { actiontype } from "./post.validation.js";



class UserService{

    // private _userModel:Model<User> = userModel;
    private _userModel = new UserRepository(userModel);
    private _postModel = new PostRepository(postModel);
    constructor(){

    }

    // create post
    createPost = async (req: Request, res: Response) => {
        const { content , mentions, allowsComments, availablility } = req.body;
        let urls: string[] = [];
        if(req.files?.length){
            urls = await  uploadFiles({ files: req.body.attachments as Express.Multer.File[], path: `Users/${req.user._id}/posts` });
        }


        const post = await this._postModel.create({ content, attachments: urls , user: req.user._id, createdBy: req.user._id, mentions, allowsComments, availablility });

        return res.status(200).json({ message: "post created", post });
    }

    // like post
    likePost = async (req: Request, res: Response) => {
        const { postId } = req.params;
        const {action} = req.query; // like or unlike?

        const operator = (action === actiontype.unlike) ? '$pull' : '$addToSet';

        const updatequery = {
            [operator]: { likes: req.user._id }
        };

        const post = await this._postModel.updateOne({ _id: postId ,
            $or:[
                {availablility: Availablility.public},
                {availablility: Availablility.friends, createdBy: [...req.user.friends || [], req.user._id]},
                {availablility: Availablility.private, createdBy: req.user._id},
            ]
        }, updatequery);
        if(!post){
            throw new AppError("post not found", 404);
        }
        return res.status(200).json({ message: "post liked", post });
    }

    // update post
    updatePost = async (req: Request, res: Response, next: NextFunction) => {
        const { postId } = req.params;
        const { content, mentions, allowsComments, availablility } = req.body;

        let urls: string[] = [];
        if(req.files?.length){
            urls = await  uploadFiles({ files: req.body.attachments as Express.Multer.File[], path: `Users/${req.user._id}/posts` });
        }

        const oldattachments = await this._postModel.findOne({ _id: postId }, { attachments: 1, _id: 0 });
        const getKeys = oldattachments?.attachments?.map(url => {
        return url.replace(/https:\/\/s3bucketsocial\.s3\.eu-north-1\.amazonaws\.com\//, '');
        });

        if(oldattachments?.attachments?.length ){
            await deletefiles({ urls: getKeys as string[] });
        }

        const post = await this._postModel.findOneAndUpdate({ _id: postId, createdBy: req.user._id }, { content, attachments: urls, mentions,  allowsComments, availablility }, { new: true });
        if(!post){
            throw new AppError("post not found", 404);
        }
        return res.status(200).json({ message: "post updated", post });
    }

    // soft delete post
    deletePost = async (req: Request, res: Response) => {
        const { postId } = req.params;

        const post = await this._postModel.updateOne({ _id: postId, createdBy: req.user._id }, { deletedAt: new Date(), deletedBy: req.user._id });
        if(!post){
            throw new AppError("post not found", 404);
        }
        return res.status(200).json({ message: "post deleted", post });
    }

    // restore post
    restorePost = async (req: Request, res: Response) => {
        const { postId } = req.params;

        const post = await this._postModel.updateOne({ _id: postId, createdBy: req.user._id }, { deletedAt: null, deletedBy: null, restoredAt: new Date(), restoredBy: req.user._id });
        if(!post){
            throw new AppError("post not found", 404);
        }
        return res.status(200).json({ message: "post restored", post });
    }
    
    // get posts
    getPosts = async (req: Request, res: Response) => {
        const { userId } = req.params;
        const {page = 1, limit = 2 } = req.query as any;

        const skip = (Number(page) - 1) * Number(limit);
        const posts = await this._postModel.findWithPopulate({ createdBy: userId }, "comments");
        return res.status(200).json({ message: "posts", posts });
    }

}

export default new UserService();
