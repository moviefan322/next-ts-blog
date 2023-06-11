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
          height={326}
        />
      </div>
      <h1>Hi, I&#39m Phil</h1>
      <p>
        I blog about web development - especially frontend frameworks like React
      </p>
    </section>
  );
}

export default Hero;
