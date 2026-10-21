import { useState } from "react";
import { findNearestRadiusStep, radiusStepsKm } from "./radiusSteps";

type RadiusSliderProps = {
  radiusKm: number;
  onChange: (radiusKm: number) => void;
};

/** Chooses how far from the place to search, in steps from 1 to 1000 km. */
export function RadiusSlider({ radiusKm, onChange }: RadiusSliderProps) {
  // The slider keeps its own step, since the address it updates may change only after the next input.
  const [step, setStep] = useState(() => findNearestRadiusStep(radiusKm));
  const [givenRadiusKm, setGivenRadiusKm] = useState(radiusKm);
  if (radiusKm !== givenRadiusKm) {
    setGivenRadiusKm(radiusKm);
    setStep(findNearestRadiusStep(radiusKm));
  }
  const shownRadiusKm = radiusStepsKm[step] ?? radiusKm;
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Within</span>
      <input
        type="range"
        min={0}
        max={radiusStepsKm.length - 1}
        value={step}
        aria-valuetext={`${shownRadiusKm} km`}
        onChange={(event) => {
          const nextStep = Number(event.target.value);
          setStep(nextStep);
          onChange(radiusStepsKm[nextStep] ?? radiusKm);
        }}
        className="w-32 accent-ink"
      />
      <span className="w-16 tabular-nums">{shownRadiusKm} km</span>
    </label>
  );
}
