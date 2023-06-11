import React from "react";
import PostHeader from "./post-header";
import { Post } from "../../types/types";
import classes from "./post-content.module.css";
import ReactMarkdown from "react-markdown";
import { customRenderers } from "@/utils/customRenderers";

interface PostContentProps {
  post: Post;
}

function PostContent({ post }: PostContentProps) {
  const { title, image, content, slug } = post;

  const imagePath = `/images/posts/${image}`;

  return (
    <article className={classes.content}>
      <PostHeader title={title} image={imagePath} />
      <ReactMarkdown components={customRenderers}>{content}</ReactMarkdown>
    </article>
  );
}

export default PostContent;
