import Joi from "joi";
import { ObjectId } from "mongodb";

import { client } from "../../db/db";
import { HTTP_CODES, HttpStatusType } from "../../utils/httpResponsesCodes";
import {
  transformJoiError,
  mapMongoToViewBlog,
} from "../../utils/utilityFunctions";
import { BlogInputModel } from "./models/BlogInputModel";
import { BlogViewModel } from "./models/BlogViewModel";
import { APIErrorResult } from "../../utils/apiErrors";

const blogSchema = Joi.object({
  name: Joi.string().trim().max(15).required().messages({
    "any.required": "name is required",
    "string.base": "name must be a string",
    "string.max": "name can't be longer than 15 characters",
    "string.empty": "empty string can't be used as a name",
  }),
  description: Joi.string().trim().max(500).required().messages({
    "any.required": "description is required",
    "string.base": "description must be a string",
    "string.max": "description can't be longer than 500 characters",
    "string.empty": "empty string can't be used as a description",
  }),
  websiteUrl: Joi.string()
    .trim()
    .max(100)
    .pattern(
      new RegExp(
        "^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$"
      )
    )
    .required()
    .messages({
      "any.required": "websiteUrl is required",
      "string.base": "websiteUrl must be a string",
      "string.max": "websiteUrl can't be longer than 100 characters",
      "string.empty": "empty string can't be used as a websiteUrl",
      "string.pattern.base": "incorrect url",
    }),
});

export const getBlogsRepository = {
  async readAllBlogs(): Promise<[HttpStatusType, BlogViewModel[]]> {
    const allMongoBlogs = await client
      .db("homework")
      .collection<BlogViewModel>("blogs")
      .find({})
      .toArray();
    const allViewBlogs = allMongoBlogs.map((b) => mapMongoToViewBlog(b));
    return [HTTP_CODES.OK_200, allViewBlogs];
  },

  async createBlog(
    input: BlogInputModel
  ): Promise<[HttpStatusType, BlogViewModel | APIErrorResult]> {
    const { error, value } = blogSchema.validate(input, {
      abortEarly: false,
      stripUnknown: true,
    });
    let responseCode: HttpStatusType;
    let responseObject: BlogViewModel | APIErrorResult;
    if (error) {
      responseCode = HTTP_CODES.BAD_REQUEST_400;
      responseObject = transformJoiError(error);
    } else {
      responseCode = HTTP_CODES.CREATED_201;
      const inputObject = {
        ...value,
        createdAt: new Date().toISOString(),
        isMembership: false,
      };
      const insertResult = await client
        .db("homework")
        .collection("blogs")
        .insertOne(inputObject);
      responseObject = mapMongoToViewBlog({
        ...inputObject,
        _id: insertResult.insertedId,
      });
    }

    return [responseCode, responseObject];
  },

  async readBlogById(
    id: string
  ): Promise<HttpStatusType | [HttpStatusType, BlogViewModel]> {
    const mongoBlog = await client
      .db("homework")
      .collection<BlogViewModel>("blogs")
      .findOne({ _id: new ObjectId(id) });
    const viewBlog = mongoBlog ? mapMongoToViewBlog(mongoBlog) : null;
    return viewBlog ? [HTTP_CODES.OK_200, viewBlog] : HTTP_CODES.NOT_FOUND_404;
  },

  async updateBlogById(
    id: string,
    input: BlogInputModel
  ): Promise<HttpStatusType | [HttpStatusType, APIErrorResult]> {
    const { error, value } = blogSchema.validate(input, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return [HTTP_CODES.BAD_REQUEST_400, transformJoiError(error)];
    }
    const updateBlogResult = await client
      .db("homework")
      .collection<BlogViewModel>("blogs")
      .updateOne({ _id: new ObjectId(id) }, { $set: { ...value } });
    if (updateBlogResult.modifiedCount === 0) {
      return HTTP_CODES.NOT_FOUND_404;
    }
    return HTTP_CODES.NO_CONTENT_204;
  },

  async deleteBlogById(id: string): Promise<HttpStatusType> {
    const deleteBlogResult = await client
      .db("homework")
      .collection<BlogViewModel>("blogs")
      .deleteOne({ _id: new ObjectId(id) });
    if (deleteBlogResult.deletedCount === 0) {
      return HTTP_CODES.NOT_FOUND_404;
    } else {
      return HTTP_CODES.NO_CONTENT_204;
    }
  },
};
