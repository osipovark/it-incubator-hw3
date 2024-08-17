import express from "express";
import cors from "cors";

import { db } from "./db/db";
import { blogsRouter } from "./resources/blogs/blogs.router";
import { postsRouter } from "./resources/posts/posts.router";
import { testingRouter } from "./resources/testing/testing.router";

export const routersPaths = {
  blogs: "/blogs",
  posts: "/posts",
  testing: "/testing",
};

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(db);
});

app.use(routersPaths.blogs, blogsRouter);

app.use(routersPaths.posts, postsRouter);

app.use(routersPaths.testing, testingRouter);
