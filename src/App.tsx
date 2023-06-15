import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import Layout from "./Layout";
import Home from "./pages/home";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
      <Analytics />
    </>
  );
}

export default App;
