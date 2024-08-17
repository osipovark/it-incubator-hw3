import Joi from "joi";
import { ObjectId } from "mongodb";

import { client } from "../../db/db";
import { HTTP_CODES, HttpStatusType } from "../../utils/httpResponsesCodes";
import {
  transformJoiError,
  mapMongoToViewPost,
} from "../../utils/utilityFunctions";
import { PostInputModel } from "./models/PostInputModel";
import { PostViewModel } from "./models/PostViewModel";
import { BlogViewModel } from "../blogs/models/BlogViewModel";
import { APIErrorResult } from "../../utils/apiErrors";

const postSchema = Joi.object({
  title: Joi.string().trim().max(30).required().messages({
    "any.required": "title is required",
    "string.base": "title must be a string",
    "string.max": "title can't be longer than 30 characters",
    "string.empty": "empty string can't be used as a title",
  }),
  shortDescription: Joi.string().trim().max(100).required().messages({
    "any.required": "shortDescription is required",
    "string.base": "shortDescription must be a string",
    "string.max": "shortDescription can't be longer than 100 characters",
    "string.empty": "empty string can't be used as a shortDescription",
  }),
  content: Joi.string().trim().max(1000).required().messages({
    "any.required": "content is required",
    "string.base": "content must be a string",
    "string.max": "content can't be longer than 1000 characters",
    "string.empty": "empty string can't be used as a content",
  }),
  blogId: Joi.string().trim().required().messages({
    "any.required": "blogId is required",
    "string.base": "blogId must be a string",
    "string.empty": "empty string can't be used as a blogId",
  }),
});

export const getPostsRepository = {
  async readAllPosts(): Promise<[HttpStatusType, PostViewModel[]]> {
    const allMongoPosts = await client
      .db("homework")
      .collection<PostViewModel>("posts")
      .find({})
      .toArray();
    const allViewPosts = allMongoPosts.map((p) => mapMongoToViewPost(p));
    return [HTTP_CODES.OK_200, allViewPosts];
  },

  async createPost(
    input: PostInputModel
  ): Promise<[HttpStatusType, PostViewModel | APIErrorResult]> {
    const { error, value } = postSchema.validate(input, {
      abortEarly: false,
      stripUnknown: true,
    });
    const blogWithGivenId = await client
      .db("homework")
      .collection<BlogViewModel>("blogs")
      .findOne({ _id: new ObjectId(input.blogId) });
    let responseCode;
    let responseObject;
    if (error || !blogWithGivenId) {
      responseCode = HTTP_CODES.BAD_REQUEST_400;
      const validationErrorsMessages = error
        ? transformJoiError(error).errorsMessages
        : [];
      const blogNonExistentErrorsMessages = !blogWithGivenId
        ? [
            {
              message:
                "there is no blog with an id value of blogId in the database",
              field: "blogId",
            },
          ]
        : [];
      responseObject = {
        errorsMessages: [
          ...validationErrorsMessages,
          ...blogNonExistentErrorsMessages,
        ],
      };
    } else {
      responseCode = HTTP_CODES.CREATED_201;
      const inputObject = {
        blogName: blogWithGivenId.name,
        ...value,
        createdAt: new Date().toISOString(),
      };
      const insertResult = await client
        .db("homework")
        .collection<PostViewModel>("posts")
        .insertOne(inputObject);
      responseObject = mapMongoToViewPost({
        ...inputObject,
        _id: insertResult.insertedId,
      });
    }

    return [responseCode, responseObject];
  },

  async readPostById(
    id: string
  ): Promise<HttpStatusType | [HttpStatusType, PostViewModel]> {
    const mongoPost = await client
      .db("homework")
      .collection<PostViewModel>("posts")
      .findOne({ _id: new ObjectId(id) });
    const viewPost = mongoPost ? mapMongoToViewPost(mongoPost) : null;
    return viewPost ? [HTTP_CODES.OK_200, viewPost] : HTTP_CODES.NOT_FOUND_404;
  },

  async updatePostById(
    id: string,
    input: PostInputModel
  ): Promise<HttpStatusType | [HttpStatusType, APIErrorResult]> {
    const { error, value } = postSchema.validate(input, {
      abortEarly: false,
      stripUnknown: true,
    });
    const blogWithInputId = await client
      .db("homework")
      .collection<BlogViewModel>("blogs")
      .findOne({ _id: new ObjectId(input.blogId) });
    let responseCode;
    let responseObject;
    if (error || !blogWithInputId) {
      responseCode = HTTP_CODES.BAD_REQUEST_400;
      const validationErrorsMessages = error
        ? transformJoiError(error).errorsMessages
        : [];
      const blogNonExistentErrorsMessages = !blogWithInputId
        ? [
            {
              message:
                "there is no blog with an id value of blogId in the database",
              field: "blogId",
            },
          ]
        : [];
      responseObject = {
        errorsMessages: [
          ...validationErrorsMessages,
          ...blogNonExistentErrorsMessages,
        ],
      };
      return [responseCode, responseObject];
    } else {
      const updatePostResult = await client
        .db("homework")
        .collection<PostViewModel>("posts")
        .updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              blogName: blogWithInputId.name,
              ...value,
            },
          }
        );
      return updatePostResult.modifiedCount === 1
        ? HTTP_CODES.NO_CONTENT_204
        : HTTP_CODES.NOT_FOUND_404;
    }
  },

  /*
  async updatePostById(
    id: string,
    input: PostInputModel
  ): Promise<HttpStatusType | [HttpStatusType, APIErrorResult]> {
    const postWithGivenId = await client
      .db("homework")
      .collection<PostViewModel>("posts")
      .findOne({ _id: new ObjectId(id) });
    if (!postWithGivenId) {
      return HTTP_CODES.NOT_FOUND_404;
    }
    const { error, value } = postSchema.validate(input, {
      abortEarly: false,
      stripUnknown: true,
    });
    const blogWithInputId = await client
      .db("homework")
      .collection<BlogViewModel>("blogs")
      .findOne({ _id: new ObjectId(input.blogId) });
    let responseCode;
    let responseObject;
    if (error || !blogWithInputId) {
      responseCode = HTTP_CODES.BAD_REQUEST_400;
      const validationErrorsMessages = error
        ? transformJoiError(error).errorsMessages
        : [];
      const blogNonExistentErrorsMessages = !blogWithInputId
        ? [
            {
              message:
                "there is no blog with an id value of blogId in the database",
              field: "blogId",
            },
          ]
        : [];
      responseObject = {
        errorsMessages: [
          ...validationErrorsMessages,
          ...blogNonExistentErrorsMessages,
        ],
      };
      return [responseCode, responseObject];
    } else {
      const test = await client
        .db("homework")
        .collection<PostViewModel>("posts")
        .replaceOne(
          { id: id },
          {
            id,
            blogName: blogWithInputId.name,
            ...value,
          }
        );
      return HTTP_CODES.NO_CONTENT_204;
    }
  },
  */

  async deletePostById(id: string): Promise<HttpStatusType> {
    const deletePostResult = await client
      .db("homework")
      .collection<PostViewModel>("posts")
      .deleteOne({ _id: new ObjectId(id) });
    if (deletePostResult.deletedCount === 1) {
      return HTTP_CODES.NO_CONTENT_204;
    } else {
      return HTTP_CODES.NOT_FOUND_404;
    }
  },
};
