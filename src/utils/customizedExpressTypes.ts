import { Request, Response } from "express";

export type RequestWithParams<P> = Request<P>;
export type RequestWithBody<B> = Request<{}, {}, B>;
export type RequestWithParamsAndBody<P, B> = Request<P, {}, B>;
