import { useState } from "react";
import { useRoutes } from "react-router-dom";
import routes from "./features/shared/routes";
import { MainProvider } from "./features/shared/context/MainContext";

function App() {
  const element = useRoutes(routes);
  return <MainProvider>{element}</MainProvider>;
}

export default App;
