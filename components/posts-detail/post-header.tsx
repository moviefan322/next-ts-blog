import React from "react";
import Image from "next/image";
import classes from "./post-header.module.css";

interface PostHeaderProps {
  title: string;
  image: string;
}

function PostHeader({ title, image }: PostHeaderProps) {
  return (
    <header className={classes.header}>
      <h1>{title}</h1>
      <Image src={image} alt={title} width={200} height={150} />
    </header>
  );
}

export default PostHeader;
