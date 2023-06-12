import React from "react";
import AllPosts from "../../components/posts/all-posts";
import { Post } from "@/types/types";
import { getAllPosts } from "@/utils/posts-util";
import Head from "next/head";

interface AllPostsPageProps {
  posts: Post[];
}

function AllPostsPage({ posts }: AllPostsPageProps): JSX.Element {
  return (
    <>
      <Head>
        <title>All Posts</title>
        <meta
          name="description"
          content="A list of all programming-related tutorials and posts!"
        />
      </Head>
      <AllPosts posts={posts} />
    </>
  );
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
