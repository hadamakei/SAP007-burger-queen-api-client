import { Navigate } from "react-router-dom";
import Kitchen from "../pages/kitchen/index.js";
import Waitress from "../pages/waitress/index.js";
import { getToken } from "./storage"

const role = () => localStorage.getItem("role");
const isAuthenticated = () => {
  const token = getToken;
  if (token !== null && token !== "undefined") {
    return true;
  }
  return false;
};

const PrivateRoute = () => {
  if (isAuthenticated) {
    if (role() === "kitchen") {
      return <Kitchen />;
    }
    if (role() === "waitress") {
      return <Waitress />;
    }
  }
  return <Navigate to="/" />;
};

export default PrivateRoute;
