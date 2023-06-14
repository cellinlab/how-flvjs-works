import { Link as RouterLink, Outlet } from "react-router-dom";
import GitHubIcon from "@mui/icons-material/GitHub";
import { IconButton, Link } from "@mui/material";

const Layout = () => {
  return (
    <main className="flex h-full">
      <div className="w-60 bg-slate-200 p-2">
        <div className="text-2xl mb-2">
          How <span className="text-sky-500 font-bold">flv.js</span> works
        </div>
        <nav className="text-lg">
          <ul>
            <li>
              <Link component={RouterLink} to="/" className="block hover:bg-slate-300">
                Official Demo
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="flex-1 overflow-auto relative p-3">
        <span className="absolute top-2 right-2">
          <IconButton
            className="text-lg"
            href="https://github.com/cellinlab/how-flvjs-works"
            target="_blank"
          >
            <GitHubIcon className="text-sky-500" />
          </IconButton>
        </span>
        <Outlet />
      </div>
    </main>
  );
};

export default Layout;
