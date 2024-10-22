import { Request } from "express";
export declare const fileNameEditor: (req: Request, file: any, callback: (error: any, filename: any) => void) => void;
export declare const imageFileFilter: (req: Request, file: any, callback: (error: any, valid: boolean) => void) => void;
