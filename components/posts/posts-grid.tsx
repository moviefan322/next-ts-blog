import React from "react";
import classes from "./posts-grid.module.css";
import PostItem from "./post-item";
import { Post } from "../../types/types";

type PostsGridProps = {
  posts: Post[];
};

function PostsGrid({ posts }: PostsGridProps) {
  console.log(posts);
  return (
    <ul className={classes.grid}>
      {posts.map((post) => (
        <PostItem key={post.slug} post={post} />
      ))}
    </ul>
  );
}

export default PostsGrid;
