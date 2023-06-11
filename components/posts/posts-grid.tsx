import React from "react";
import classes from "./posts-grid.module.css";
import PostItem from "./post-item";
import { Post } from "../../types/types";

type PostsGridProps = {
  posts: Post[];
};

function PostsGrid({ posts }: PostsGridProps) {
  return (
    <ul className={classes.grid}>
      {posts.map((post) => (
        <li key={post.slug}>
          <PostItem post={post} />
        </li>
      ))}
    </ul>
  );
}

export default PostsGrid;
