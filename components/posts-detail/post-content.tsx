import React from "react";
import PostHeader from "./post-header";
import { Post } from "../../types/types";
import classes from "./post-content.module.css";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface PostContentProps {
  post: Post;
}

function PostContent({ post }: PostContentProps) {
  const { title, image, content, slug } = post;

  const imagePath = `/images/posts/${image}`;

  const customRenderers = {
    // img(image: any) {
    //   return (
    //     <Image
    //       src={`/images/posts/${slug}/${image.src}`}
    //       alt={image.alt}
    //       height={300}
    //       width={600}
    //     />
    //   );
    // },

    p(paragraph: any) {
      const { node } = paragraph;

      if (node.children[0].tagName === "img") {
        const image = node.children[0];

        return (
          <div className={classes.image}>
            <Image
              src={`/images/posts/${image.properties.src}`}
              alt={image.properties.alt}
              height={300}
              width={600}
            />
          </div>
        );
      }

      return <p>{paragraph.children}</p>;
    },
    code(code: any) {
      const { className, children } = code;
      const language = className.split("-")[1]; // className is something like language-js => we need the "js" part here
      return (
        <SyntaxHighlighter language={language} style={atomDark}>
          {children}
        </SyntaxHighlighter>
      );
    },
  };
  return (
    <article className={classes.content}>
      <PostHeader title={title} image={imagePath} />
      <ReactMarkdown components={customRenderers}>{content}</ReactMarkdown>
    </article>
  );
}

export default PostContent;
