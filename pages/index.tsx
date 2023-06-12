import React from "react";
import FeaturedPosts from "../components/home-page/featured-posts";
import Hero from "../components/home-page/hero";
import { getFeaturedPosts } from "@/utils/posts-util";
import { Post } from "@/types/types";
import Head from "next/head";

interface HomePageProps {
  posts: Post[];
}

function HomePage({ posts }: HomePageProps): JSX.Element {
  return (
    <>
      <Head>
        <title>NextJS Blog</title>
        <meta name="description" content="NextJS Blog" />
      </Head>
      <Hero />
      <FeaturedPosts posts={posts} />
    </>
  );
}

export function getStaticProps(): { props: HomePageProps; revalidate: number } {
  const featuredPosts = getFeaturedPosts();

  return {
    props: {
      posts: featuredPosts,
    },
    revalidate: 1800,
  };
}

export default HomePage;
