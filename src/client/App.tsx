import { Navigate, Route, Routes, useLocation } from "react-router";
import { V1App } from "./v1/V1App";
import { v1BasePath } from "./v1/v1Path";
import { V2App } from "./v2/V2App";

/**
 * Serves each version of the app under its own address prefix.
 * Any other address, such as a link shared before the versions existed, leads to the same page of the first version.
 */
export function App() {
  return (
    <Routes>
      <Route path="v1/*" element={<V1App />} />
      <Route path="v2/*" element={<V2App />} />
      <Route path="*" element={<RedirectToV1 />} />
    </Routes>
  );
}

function RedirectToV1() {
  const { pathname, search, hash } = useLocation();
  const path = pathname === "/" ? "" : pathname;
  return <Navigate replace to={`${v1BasePath}${path}${search}${hash}`} />;
}
