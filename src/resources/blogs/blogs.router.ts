import { Request, Response, Router } from "express";

import { authenticate } from "../../utils/utilityFunctions";

import { getBlogsRepository } from "./blogs.repository";

import { BlogIdParamModel } from "./models/BlogIdParamModel";
import { BlogInputModel } from "./models/BlogInputModel";
import { BlogViewModel } from "./models/BlogViewModel";

import { APIErrorResult } from "../../utils/apiErrors";

import {
  RequestWithParams,
  RequestWithBody,
  RequestWithParamsAndBody,
} from "../../utils/customizedExpressTypes";

export const blogsRouter = Router();

blogsRouter.get("/", async (req: Request, res: Response<BlogViewModel[]>) => {
  const [responseCode, responseObject] =
    await getBlogsRepository.readAllBlogs();
  res.status(responseCode).json(responseObject);
});

blogsRouter.post(
  "/",
  authenticate,
  async (
    req: RequestWithBody<BlogInputModel>,
    res: Response<BlogViewModel | APIErrorResult>
  ) => {
    const [responseCode, responseObject] = await getBlogsRepository.createBlog(
      req.body
    );
    res.status(responseCode).json(responseObject);
  }
);

blogsRouter.get(
  "/:id",
  async (
    req: RequestWithParams<BlogIdParamModel>,
    res: Response<BlogViewModel>
  ) => {
    const response = await getBlogsRepository.readBlogById(req.params.id);
    if (Array.isArray(response)) {
      let [responseCode, responseObject] = response;
      res.status(responseCode as number).json(responseObject as BlogViewModel); //? WEIRD SOLUTION
    } else {
      res.sendStatus(response);
    }
  }
);

blogsRouter.put(
  "/:id",
  authenticate,
  async (
    req: RequestWithParamsAndBody<BlogIdParamModel, BlogInputModel>,
    res: Response
  ) => {
    const response = await getBlogsRepository.updateBlogById(
      req.params.id,
      req.body
    );
    if (Array.isArray(response)) {
      let [responseCode, responseObject] = response;
      res.status(responseCode as number).json(responseObject);
    } else {
      res.sendStatus(response);
    }
  }
);

blogsRouter.delete(
  "/:id",
  authenticate,
  async (req: RequestWithParams<BlogIdParamModel>, res: Response) => {
    const response = await getBlogsRepository.deleteBlogById(req.params.id);
    res.sendStatus(response);
  }
);
