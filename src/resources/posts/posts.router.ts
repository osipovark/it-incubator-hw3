import { Request, Response, Router } from "express";

import { authenticate } from "../../utils/utilityFunctions";

import { getPostsRepository } from "./posts.repository";

import { PostIdParamModel } from "./models/PostIdParamModel";
import { PostInputModel } from "./models/PostInputModel";
import { PostViewModel } from "./models/PostViewModel";

import { APIErrorResult } from "../../utils/apiErrors";

import {
  RequestWithParams,
  RequestWithBody,
  RequestWithParamsAndBody,
} from "../../utils/customizedExpressTypes";

export const postsRouter = Router();

postsRouter.get("/", async (req: Request, res: Response<PostViewModel[]>) => {
  const [responseCode, responseObject] =
    await getPostsRepository.readAllPosts();
  res.status(responseCode).json(responseObject);
});

postsRouter.post(
  "/",
  authenticate,
  async (
    req: RequestWithBody<PostInputModel>,
    res: Response<PostViewModel | APIErrorResult>
  ) => {
    const [responseCode, responseObject] = await getPostsRepository.createPost(
      req.body
    );
    res.status(responseCode).json(responseObject);
  }
);

postsRouter.get(
  "/:id",
  async (
    req: RequestWithParams<PostIdParamModel>,
    res: Response<PostViewModel>
  ) => {
    const response = await getPostsRepository.readPostById(req.params.id);
    if (Array.isArray(response)) {
      let [responseCode, responseObject] = response;
      res.status(responseCode as number).json(responseObject as PostViewModel); //? WEIRD SOLUTION
    } else {
      res.sendStatus(response);
    }
  }
);

postsRouter.put(
  "/:id",
  authenticate,
  async (
    req: RequestWithParamsAndBody<PostIdParamModel, PostInputModel>,
    res: Response
  ) => {
    const response = await getPostsRepository.updatePostById(
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

postsRouter.delete(
  "/:id",
  authenticate,
  async (req: RequestWithParams<PostIdParamModel>, res: Response) => {
    const response = await getPostsRepository.deletePostById(req.params.id);
    res.sendStatus(response);
  }
);
