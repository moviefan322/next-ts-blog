import React from "react";
import AllPosts from "./all-posts";
import { DUMMY_POSTS } from "@/utils/dummyData";

function AllPostsPage() {
  return <AllPosts posts={DUMMY_POSTS} />;
}

export default AllPostsPage;
