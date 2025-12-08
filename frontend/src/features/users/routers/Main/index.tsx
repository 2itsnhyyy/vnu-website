import React from "react";
import HomeRouters from "../Main/HomeRouters";
import NewsRouters from "../Main/NewsRouters";
import ContactRouters from "../Main/ContactRouters";
import MapRouters from "../Main/MapRouters";
import ForumRouters from "../Main/ForumRouters";
import IssuesRouters from "../Main/IssuesRouters";

const MainRouters = [
  ...HomeRouters,
  ...NewsRouters,
  ...ContactRouters,
  ...MapRouters,
  ...ForumRouters,
  ...IssuesRouters,
];

export default MainRouters;
