import React from "react";
import classes from "./all-posts.module.css";
import { Post } from "../../types/types";
import PostsGrid from "@/components/posts/posts-grid";

type AllPostsProps = {
  posts: Post[];
};

function AllPosts({ posts }: AllPostsProps) {
  return (
    <section className={classes.posts}>
      <h1>All Posts</h1>
      <PostsGrid posts={posts} />
    </section>
  );
}

export default AllPosts;
