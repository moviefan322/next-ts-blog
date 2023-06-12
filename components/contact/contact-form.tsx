import React, { useRef, useState, useEffect } from "react";
import classes from "./contact-form.module.css";
import Notification from "../ui/notification";
import { Message } from "../../types/types";

function ContactForm() {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    if (requestStatus === "pending") {
      setNotification({
        title: "Sending message...",
        message: "Your message is on its way!",
        status: "pending",
      });
    }

    if (requestStatus === "success") {
      setNotification({
        title: "Success!",
        message: "Message sent successfully!",
        status: "success",
      });
    }

    if (requestStatus === "error") {
      setNotification({
        title: "Error!",
        message: error || "Something went wrong!",
        status: "error",
      });
    }

    if (requestStatus === "success" || requestStatus === "error") {
      const timer = setTimeout(() => {
        setNotification(null);
        setError(null);
      }, 3000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [requestStatus, error]);

  async function sendContactData(contactDetails: any) {
    const res = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(contactDetails),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Something went wrong!");
    }
  }

  async function sendMessageHandler(event: React.FormEvent) {
    event.preventDefault();

    const enteredEmail = emailInputRef.current!.value;
    const enteredName = nameInputRef.current!.value;
    const enteredMessage = messageInputRef.current!.value;

    if (
      enteredEmail.trim() === "" ||
      enteredName.trim() === "" ||
      enteredMessage.trim() === ""
    ) {
      // throw an error
      throw new Error("Invalid input");
    }

    if (enteredMessage.trim().length < 5) {
      // throw an error
      throw new Error("Message too short");
    }

    if (!enteredEmail.match(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/)) {
      // throw an error
      throw new Error("Invalid Email");
    }

    setRequestStatus("pending");

    const contactDetails: Message = {
      email: enteredEmail,
      name: enteredName,
      message: enteredMessage,
    };

    try {
      await sendContactData(contactDetails);
    } catch (error: any) {
      setRequestStatus("error");
      setError(error.message);
    }

    // fetch API

    setRequestStatus("success");

    // clear the form
    emailInputRef.current!.value = "";
    nameInputRef.current!.value = "";
    messageInputRef.current!.value = "";
  }

  return (
    <section className={classes.contact}>
      <h1>How can I help you?</h1>
      <form className={classes.form} onSubmit={sendMessageHandler}>
        <div className={classes.controls}>
          <div className={classes.control}>
            <label htmlFor="email">Your Email</label>
            <input type="email" id="email" required ref={emailInputRef} />
          </div>
          <div className={classes.control}>
            <label htmlFor="name">Your Name</label>
            <input type="text" id="name" required ref={nameInputRef} />
          </div>
        </div>
        <div className={classes.control}>
          <label htmlFor="message">Your Message</label>
          <textarea id="message" rows={5} required ref={messageInputRef} />
        </div>
        <div className={classes.actions}>
          <button>Send Message</button>
        </div>
      </form>

      {notification && (
        <Notification
          title={notification.title}
          message={notification.message}
          status={notification.status}
        />
      )}
    </section>
  );
}

export default ContactForm;
