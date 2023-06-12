import { ObjectId } from "mongodb";

export type Post = {
  title: string;
  image: string;
  excerpt: string;
  slug: string;
  date: string;
  content: string;
  isFeatured: boolean;
};

export type Message = {
  name: string;
  email: string;
  message: string;
  _id?: ObjectId;
};
