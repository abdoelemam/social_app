import { Router } from "express";
import U from "./comment.services.js";
import { createCommentSchema } from "./comment.validation.js";
import { validate } from "../../middleware/validation.js";
import { authentication } from "../../middleware/authentication.js";
import { filevalidation, MulterHost } from "../../middleware/multer.cloud.js";

export const commentRouter = Router({mergeParams: true});


commentRouter.post("/createcomment/", authentication() ,MulterHost({filetypes: filevalidation.image }).array("attachments") , validate(createCommentSchema as any), U.createComment);
commentRouter.get("/getcomments/", U.getComments);
commentRouter.post("/createreply/:commentId", authentication() ,MulterHost({filetypes: filevalidation.image }).array("attachments") , validate(createCommentSchema as any), U.createReply);


