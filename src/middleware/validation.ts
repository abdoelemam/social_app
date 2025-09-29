import express, { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/classError.js";
import { ZodType } from "zod";

type reqtype = keyof Request;
type schematype = Partial<Record<reqtype , ZodType>>;

export const validate = (schema: schematype) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const validatederrors = []
        for(const key of Object.keys(schema)){
            const typedKey = key as reqtype;
            if(!schema[typedKey]) continue;
            
            const result = schema[typedKey].safeParse(req[typedKey]);
            if(!result.success){
                validatederrors.push(result.error)
  
            }
        }

        if(validatederrors.length){
                throw new AppError(JSON.parse(validatederrors as unknown as string), 400);
            }

            next()
        
    }}