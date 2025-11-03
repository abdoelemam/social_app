import { Router } from "express";
const postRouter = Router();
import U from "./post.services.js";
import { createPostSchema, likePostSchema } from "./post.validation.js";
import { validate } from "../../middleware/validation.js";
import { filevalidation, MulterHost } from "../../middleware/multer.cloud.js";
import { authentication } from "../../middleware/authentication.js";
import {commentRouter} from "../comments/comment.controller.js";



postRouter.use("/:postId/comments", commentRouter);

postRouter.post("/createpost", authentication() ,MulterHost({filetypes: filevalidation.image }).array("attachments") , validate(createPostSchema as any), U.createPost);
postRouter.post("/likepost/:postId", authentication() , validate(likePostSchema as any), U.likePost);
postRouter.put("/updatepost/:postId", authentication(), MulterHost({filetypes: filevalidation.image }).array("attachments") , validate(createPostSchema as any), U.updatePost);
postRouter.delete("/deletepost/:postId", authentication(), U.deletePost);
postRouter.post("/restorepost/:postId", authentication(), U.restorePost);
postRouter.get("/getposts/:userId",  U.getPosts);
export default postRouter;

