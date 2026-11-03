import { Route, Routes } from "react-router";
import { ColorSchemeSwitcher } from "../theme/ColorSchemeSwitcher";
import { Backdrop } from "./Backdrop";
import { BodiesView } from "./bodies/BodiesView";
import { SceneView } from "./scene/SceneView";
import { V2Navigation } from "./V2Navigation";

/** Shows the second version of the app, whose views are served under `/v2`. */
export function V2App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-3 p-4 font-sans sm:gap-6 sm:p-6">
      <Backdrop>
        <header className="flex items-center justify-between gap-4">
          <h1 className="font-semibold text-lg sm:text-2xl">Multispecies ethnography</h1>
          <ColorSchemeSwitcher />
        </header>
        <V2Navigation />
      </Backdrop>
      <Routes>
        <Route index element={<SceneView />} />
        <Route path="biological-glottometry" element={<BodiesView />} />
      </Routes>
    </main>
  );
}
