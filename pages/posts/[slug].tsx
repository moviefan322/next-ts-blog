import React from "react";
import PostContent from "@/components/posts-detail/post-content";
import { DUMMY_POSTS } from "@/utils/dummyData";

function PostDetailPage() {
  return (
    <>
      <PostContent post={DUMMY_POSTS[0]} />
    </>
  );
}

export default PostDetailPage;
