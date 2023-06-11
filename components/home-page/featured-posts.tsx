import React from "react";
import classes from "./featured-posts.module.css";
import PostGrid from "../posts/posts-grid";
import { Post } from "../../types/types";

type FeaturedPostsProps = {
  posts: Post[];
};

function FeaturedPosts({ posts }: FeaturedPostsProps) {
  return (
    <section className={classes.latest}>
      <h2>Featured Posts</h2>
      <PostGrid posts={posts} />
    </section>
  );
}

export default FeaturedPosts;
