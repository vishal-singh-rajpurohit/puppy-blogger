import type { Response } from "express";

export default class APIRepsonse<T = unknown>{
    private body: T;
    private statusCode: number;
    private message: string;
    private success: boolean;
    constructor(statusCode: number, body: T, message: string){
        this.body = body;
        this.statusCode = statusCode;
        this.message = message;
        this.success = statusCode < 400
    }
} 