/* eslint-disable react/no-unescaped-entities */
import React from "react";
import Image from "next/image";
import classes from "./hero.module.css";

function Hero() {
  return (
    <section className={classes.hero}>
      <div className={classes.image}>
        <Image
          src="/images/site/topcat.png"
          alt="an image of Phil"
          width={300}
          height={300}
          priority
        />
      </div>
      <h1>Hi, I'm Phil</h1>
      <p>I blog about my journey in web development.</p>
    </section>
  );
}

export default Hero;
