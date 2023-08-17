import React from "react";
import ReactDOM from "react-dom/client";
import { useState } from "react";
import "./index.css";
import App from "./App";
// import StarsRating from "./StarsRating";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarsRating maxRating={5} />
    <StarsRating
      maxRating={5}
      color="blue"
      messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
    />
    <Test /> */}
  </React.StrictMode>
);
