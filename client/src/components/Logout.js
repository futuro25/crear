import React, {useState} from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  sessionStorage.clear()
  window.location.assign('login')
  // const navigate = useNavigate()
  // navigate('./login');

  return (<div></div>);
}
