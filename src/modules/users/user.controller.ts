import { Router } from "express";
const userRouter = Router();
import U from "./user.services.js";
import { confirmEmailSchema, signinSchema, signupSchema } from "./uservalidation.js";
import { validate } from "../../middleware/validation.js";
import { authentication } from "../../middleware/authentication.js";
import { Tokentype } from "../../utils/token.js";
import { filevalidation, MulterHost, StorageEnum } from "../../middleware/multer.cloud.js";



userRouter.post("/signup", validate(signupSchema as any), U.signup); 
userRouter.post("/confirmemail", validate(confirmEmailSchema as any), U.confirmEmail);
userRouter.post("/signin", validate(signinSchema as any) , U.signin);
userRouter.get("/getProfile", authentication(), U.getProfile );  
userRouter.post("/logout", authentication(), U.logout);
userRouter.post("/refreshtoken", authentication(Tokentype.refresh) ,U.refreshToken);
userRouter.post("/loginwithgmail", U.loginWithGmail);
userRouter.post("/forgetpassword", U.forgetPassword);
userRouter.post("/resetpassword", U.resetPassword);
// userRouter.post("/uploadimage", authentication(), MulterHost({filetypes: filevalidation.image}).single("file"), U.uploadImage);
userRouter.post("/uploadimage", U.uploadImage);
userRouter.post("/freezeaccount/:userId", authentication(), U.freezeAccount);
userRouter.post("/unfreezeaccount/:userId", authentication(), U.unfreezeAccount);
userRouter.post("/deleteaccount/:userId", authentication(), U.deleteAccount);
userRouter.post("/restoreaccount/:userId", authentication(), U.restoreAccount);

export default userRouter;

