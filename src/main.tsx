import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.min.css";

// Css
import "./assets/css/bootstrap-theme-cable.css";
import "./assets/css/theme.css";

// Pages
import Resize from "@pages/Resize/Resize";
import Convert from "@pages/Convert/Convert";
import ChangeDpi from "@pages/ChangeDpi/ChangeDpi";
import CreatePdf from "@pages/CreatePdf/CreatePdf";

import App from "./App.tsx";

const router = createBrowserRouter([
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
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
