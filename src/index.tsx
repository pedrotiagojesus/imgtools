import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.min.css";

// Css
import "./assets/css/bootstrap-theme-cable.css";
import "./assets/css/theme.css";

// Pages
import Resize from "./pages/Resize/Resize";
import Convert from "./pages/Convert/Convert";
import ChangeDpi from "./pages/ChangeDpi/ChangeDpi";
import CreatePdf from "./pages/CreatePdf/CreatePdf";

const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <App />,
            children: [
                {
                    index: true,
                    element: <Resize />,
                },
                {
                    path: "resize",
                    element: <Resize />,
                },
                {
                    path: "convert",
                    element: <Convert />,
                },
                {
                    path: "change-dpi",
                    element: <ChangeDpi />,
                },
                {
                    path: "create-pdf",
                    element: <CreatePdf />,
                },
            ],
        },
    ],
    {
        basename: "/imgtools",
    }
);
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
