import React from "react";
import MainNavigation from "./main-navigation";
import { type } from "os";

type Props = {
  children: React.ReactNode;
};

function Layout(props: Props) {
  return (
    <>
      <MainNavigation />
      <main>{props.children}</main>
    </>
  );
}

export default Layout;
