import type {
    NextFunction,
    Request,
    Response,
    RequestHandler
} from "express";

export function asyncHandler(fn: (req: Request, resp: Response, next: NextFunction) => Promise<void>): RequestHandler {
    return (req: Request, resp: Response, next: NextFunction) => {
        Promise.resolve(fn(req, resp, next)).catch(next);
    };
}