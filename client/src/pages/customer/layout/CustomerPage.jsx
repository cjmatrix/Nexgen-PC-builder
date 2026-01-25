import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import NotificationListener from "../../../components/NotificationListener";
import ScrollToTop from "../../../components/ScrollToTop";

function CustomerPage() {
  return (
    <div>
      <ScrollToTop></ScrollToTop>
      <Navbar></Navbar>
      <NotificationListener />
      <div className=" mt-16">
        <Outlet></Outlet>
      </div>
    </div>
  );
}

export default CustomerPage;
