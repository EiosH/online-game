import React from "react";
import ReactDOM from "react-dom";
import eruda from "eruda";

import "./index.css";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

let el = document.createElement("div");
document.body.appendChild(el);

eruda.init({
  container: el,
  tool: ["console", "elements"],
});
