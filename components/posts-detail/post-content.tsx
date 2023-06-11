import React from "react";
import PostHeader from "./post-header";
import { Post } from "../../types/types";
import { DUMMY_POSTS } from "@/utils/dummyData";
import classes from "./post-content.module.css";

interface PostContentProps {
  post: Post;
}

function PostContent({ post }: PostContentProps) {
  const { title, image } = post;

  const imagePath = `/images/posts/${image}`;
  return (
    <article className={classes.content}>
      <PostHeader title={title} image={imagePath} />
      {DUMMY_POSTS[0].content}
    </article>
  );
}

export default PostContent;
