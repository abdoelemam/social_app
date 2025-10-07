import { Router } from "express";
const userRouter = Router();
import U from "./user.services.js";
import { confirmEmailSchema, signinSchema, signupSchema } from "./uservalidation.js";
import { validate } from "../../middleware/validation.js";
import { authentication } from "../../middleware/authentication.js";
import { Tokentype } from "../../utils/token.js";



userRouter.post("/signup", validate(signupSchema as any), U.signup); 
userRouter.post("/confirmemail", validate(confirmEmailSchema as any), U.confirmEmail);
userRouter.post("/signin", validate(signinSchema as any) , U.signin);
userRouter.get("/getProfile", authentication(), U.getProfile );  
userRouter.post("/logout", authentication(), U.logout);
userRouter.post("/refreshtoken", authentication(Tokentype.refresh) ,U.refreshToken);
userRouter.post("/loginwithgmail", U.loginWithGmail);
userRouter.post("/forgetpassword", U.forgetPassword);
userRouter.post("/resetpassword", U.resetPassword);


export default userRouter;

