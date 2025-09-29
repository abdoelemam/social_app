import { Router } from "express";
const userRouter = Router();
import U from "./user.services.js";
import { signupSchema } from "./uservalidation.js";
import { validate } from "../../middleware/validation.js";


userRouter.post("/signup", validate(signupSchema as any), U.signup);
userRouter.post("/signin", U.signin);

export default userRouter;

