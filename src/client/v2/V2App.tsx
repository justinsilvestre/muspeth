import { Route, Routes } from "react-router";
import { ColorSchemeSwitcher } from "../theme/ColorSchemeSwitcher";
import { SceneView } from "./scene/SceneView";
import { V2Navigation } from "./V2Navigation";

/** Shows the second version of the app, whose views are served under `/v2`. */
export function V2App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col p-6 font-sans">
      <header className="mb-4 flex items-center justify-between gap-4">
        <h1 className="font-semibold text-2xl">Multispecies ethnography</h1>
        <ColorSchemeSwitcher />
      </header>
      <V2Navigation />
      <Routes>
        <Route index element={<SceneView />} />
      </Routes>
    </main>
  );
}
