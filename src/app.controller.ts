
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {config} from "dotenv"
import path from "path";
import { AppError } from "./utils/classError.js";
import userRouter from "./modules/users/user.controller.js";
import connectDB from "./DB/connectionDB.js";
import { deletefile, deletefiles, getFile, listfiles } from "./utils/s3.config.js";
import { promisify } from "util";
import { pipeline } from "stream";

const writepipeline = promisify(pipeline);

config({path: path.resolve("./config/.env")});

const app:express.Application = express();
const port:string | number = process.env.PORT || 5000;
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
    message: "Too many requests from this IP, please try again after 15 minutes",
    statusCode: 429, // 429 status = Too Many Requests (RFC 6585)
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers

    // ai made
    // standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
   //  max: 100 limit each IP to 100 requests per windowMs
});

const bootstarp = async () => {
    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(limiter);

    await connectDB();

    app.get("/", (_req:express.Request, res:express.Response) => {
        return res.status(200).json({message:"welcome with my soccial app"});
    })

    // app.get("/getfiles", async (req:express.Request, res:express.Response) => {
    //     const response = await listfiles({path:"general"})
    //     const keys = response.Contents?.map((file) => file.Key)
    //     return res.status(200).json({response: keys});
    // })

    // app.get("/upload/deletefiles", async (req:express.Request, res:express.Response) => {
    //     // const {path} = req.params as  unknown as {path:string[] }
    //     // const key = path.join("/");
    //     const response = await   deletefiles({
    //         urls: [
    //             "general/fd649eba-d97f-4c13-a92c-c64c0461888a-ai.jpg",
    //             "general/5e4dec99-501a-42b2-9bba-c2cc6df7cbfc-لقطة_شاشة_2023-06-13_140420.png"
    //         ]
    //     })

    //     return res.status(200).json({response});
    // })

    // app.get("/upload/delete/*path", async (req:express.Request, res:express.Response) => {
    //     const {path} = req.params as  unknown as {path:string[] }
    //     const key = path.join("/");
    //     const response = await   deletefile({key})

    //     return res.status(200).json({response});
    // })


    // app.get("/upload/*path", async (req:express.Request, res:express.Response) => {
    //     const {path} = req.params as  unknown as {path:string[] }
    //     const key = path.join("/");
    //     const {downloadname} = req.query as {downloadname:string} 
    //     const response = await   getFile({key})
    //     const stream = response.Body as NodeJS.ReadableStream;
    //     res.setHeader("Content-Type", response.ContentType!);
    //     // stream.pipe(res);

    //     if(downloadname){
    //         res.setHeader("Content-Disposition", `attachment; filename=${downloadname} || ${path.join("/").split("/").pop()}`);
    //     }
    //     await writepipeline(stream, res);

    //     // return res.status(200).json({response});
    // })

    

    app.use("/users", userRouter);

    // ❌ أي Route مش موجود - 404 handler
    app.use((req: Request, res: Response, next: NextFunction) => {
        throw new AppError(`Invalid Url ${req.originalUrl}`, 404);
    });

    // ✅ Error handler
    app.use(
        (err: AppError, req: Request, res: Response, next: NextFunction) => {
        return res.status(err.statusCode || 500).json({
            message: err.message,
            stack: err.stack,
        });
        }
    );

    

    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}

export default bootstarp;