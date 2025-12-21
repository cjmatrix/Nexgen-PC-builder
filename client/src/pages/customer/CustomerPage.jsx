import React from "react";
import Navbar from "../../components/Navbar";
import { Outlet } from "react-router-dom";

function CustomerPage() {
  return (
    <div>
      <Navbar></Navbar>
      <div className=" mt-16"> 
         <Outlet></Outlet>
      </div>
     
    </div>
  );
}

export default CustomerPage;
