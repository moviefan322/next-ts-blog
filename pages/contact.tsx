import React from "react";
import ContactForm from "@/components/contact/contact-form";
import Head from "next/head";

function Contact() {
  return (
    <>
      <ContactForm />
      <Head>
        <title>Contact Me</title>
        <meta name="description" content="Send me your messages" />
      </Head>
    </>
  );
}

export default Contact;
