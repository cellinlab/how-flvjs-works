import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import Layout from "./Layout";
import Home from "./pages/home";
import Data from "./pages/data";
import Demuxer from "./pages/demuxer";
import Remuxer from "./pages/remuxer";
import Mse from "./pages/mse";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/data" element={<Data />} />
          <Route path="/demuxer" element={<Demuxer />} />
          <Route path="/remuxer" element={<Remuxer />} />
          <Route path="/mse" element={<Mse />} />
        </Route>
      </Routes>
      <Analytics />
    </>
  );
}

export default App;
