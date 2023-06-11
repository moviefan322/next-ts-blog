import React from "react";
import AllPosts from "./all-posts";
import { Post } from "@/types/types";
import { getAllPosts } from "@/utils/posts-util";

interface AllPostsPageProps {
  posts: Post[];
}

function AllPostsPage({ posts }: AllPostsPageProps): JSX.Element {
  return <AllPosts posts={posts} />;
}

export function getStaticProps(): {
  props: { posts: Post[] };
  revalidate: number;
} {
  const allPosts = getAllPosts();

  return {
    props: {
      posts: allPosts,
    },
    revalidate: 1800,
  };
}

export default AllPostsPage;
