import React from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import atomDark from "react-syntax-highlighter/dist/cjs/styles/prism/atom-dark";
import js from "react-syntax-highlighter/dist/cjs/languages/prism/javascript";
import ts from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import bash from "react-syntax-highlighter/dist/cjs/languages/prism/bash";
import PostHeader from "./post-header";
import { Post } from "../../types/types";
import classes from "./post-content.module.css";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

SyntaxHighlighter.registerLanguage("js", js);
SyntaxHighlighter.registerLanguage("ts", ts);
SyntaxHighlighter.registerLanguage("ts", bash);

interface PostContentProps {
  post: Post;
}

function PostContent({ post }: PostContentProps) {
  const { title, image, content, slug } = post;

  const imagePath = `/images/posts/${slug}/${image}`;

  const customRenderers = {
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
    h2(h2: any) {
      const { node } = h2;
      const firstChild = node.children[0];
      const id = node.children[1].value.split('"')[1];

      const splitText = firstChild.value.split(" ");

      const joinedText = splitText.join(" ");

      return <h2 id={id}>{joinedText}</h2>;
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
