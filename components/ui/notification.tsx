import classes from "./notification.module.css";
import ReactDOM from "react-dom";

interface NotificationProps {
  title: string;
  message: string;
  status: string;
}

function Notification({ title, message, status }: NotificationProps) {
  let statusClasses = "";

  if (status === "success") {
    statusClasses = classes.success;
  }

  if (status === "error") {
    statusClasses = classes.error;
  }

  const cssClasses = `${classes.notification} ${statusClasses}`;

  return ReactDOM.createPortal(
    <div className={cssClasses}>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>,
    document.getElementById("notifications")!
  );
}

export default Notification;
