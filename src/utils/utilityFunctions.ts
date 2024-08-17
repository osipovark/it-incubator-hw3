import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { ObjectId, WithId, Document } from "mongodb";

import { APIErrorResult } from "./apiErrors";
import { BlogViewModel } from "../resources/blogs/models/BlogViewModel";
import { PostViewModel } from "../resources/posts/models/PostViewModel";

/*
type TypeWithUnderscoreId = {
  _id: ObjectId;
};
*/

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader: string | undefined = req.get("authorization");
  if (!authHeader) {
    res.sendStatus(401);
    return;
  }
  const [kind, token] = authHeader.split(" ");
  const [username, password] = Buffer.from(token, "base64")
    .toString()
    .split(":");
  if (kind === "Basic" && username === "admin" && password === "qwerty") {
    next();
  } else {
    res.sendStatus(401);
  }
};

export const transformJoiError = (error: Joi.ValidationError) => {
  const customError: APIErrorResult = {
    errorsMessages: [],
  };
  customError.errorsMessages = error.details.map((detail) => {
    return {
      message: detail.message,
      field: detail.path.join("."),
    };
  });
  customError.errorsMessages = customError.errorsMessages.filter(
    (em, i, arr) => {
      const searchArr = arr.slice(0, i);
      if (searchArr.find((item) => item.field === em.field)) return false;
      return true;
    }
  );
  return customError;
};

export function mapMongoToViewBlog(obj: WithId<BlogViewModel>): BlogViewModel {
  const { _id: id, ...rest } = obj;
  const blogView = { ...rest, id: id.toString() };
  return blogView;
}

export function mapMongoToViewPost(obj: WithId<PostViewModel>): PostViewModel {
  const { _id: id, ...rest } = obj;
  const postView = { ...rest, id: id.toString() };
  return postView;
}
