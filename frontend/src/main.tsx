import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import "@arcgis/core/assets/esri/themes/light/main.css";
import { ConfigProvider } from "antd";

createRoot(document.getElementById("root")!).render(
  <ConfigProvider
    theme={{
      token: {
        fontFamily: "Gilroy, sans-serif",
      },
      components: {
      Table: {
        colorText: "#6a7282", 
        colorTextHeading: "#1e2939",
      },
    },
    }}
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ConfigProvider>
);
