import React from "react";
import PostContent from "@/components/posts-detail/post-content";
import { getPostData, getPostsFiles } from "@/utils/posts-util";
import { Post } from "@/types/types";
import Head from "next/head";

interface PostDetailPageProps {
  post: Post;
}

function PostDetailPage({ post }: PostDetailPageProps): JSX.Element {
  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.excerpt} />
      </Head>
      <PostContent post={post} />
    </>
  );
}

export function getStaticProps(context: any) {
  const { params } = context;
  const { slug } = params;
  const post = getPostData(slug);

  return {
    props: {
      post,
    },
    revalidate: 1800,
  };
}

export function getStaticPaths() {
  const postFilenames = getPostsFiles();
  console.log(postFilenames);
  const slugs = postFilenames.map((fileName) => fileName.replace(/\.md$/, ""));

  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export default PostDetailPage;
