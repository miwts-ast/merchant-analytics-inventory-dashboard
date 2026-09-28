import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Dashboard from './Dashboard.jsx'
import Layout from './Layout.jsx'
import NotFound from './NotFound.jsx'
import Sales from './Sales.jsx'
import Inventory from './Inventory.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "home", element: <Dashboard /> },
      { path: "sales", element: <Sales /> },
      { path: "inventory", element: <Inventory /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
)
