import type { NextFunction, Request, Response } from "express";

export async function AsyncHandler(fn: (req: Request, resp: Response, next: NextFunction)=>Promise<void>){
    return (req: Request, resp: Response, next: NextFunction) =>{
        Promise.resolve(fn(req, resp, next))
        .catch((err)=>{
            next(err)
        })
    }
}