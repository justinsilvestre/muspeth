import type { FormEvent } from "react";
import { defaultRadiusKm } from "../../shared/placeAndPeriodQuery";

type PlaceQueryFormProps = {
  /** The query in the address, which the form starts from. */
  params: URLSearchParams;
  onSubmit: (params: URLSearchParams) => void;
};

const fieldNames = ["latitude", "longitude", "radiusKm", "from", "to"] as const;

/** Asks for a place, as coordinates and a radius, and a period, either of which may be left out. */
export function PlaceQueryForm({ params, onSubmit }: PlaceQueryFormProps) {
  const [latitude = "", longitude = ""] = (params.get("near") ?? "").split(",");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(toQueryParams(new FormData(event.currentTarget), params));
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-6">
      <Field label="Latitude" name="latitude" defaultValue={latitude} placeholder="35.01" />
      <Field label="Longitude" name="longitude" defaultValue={longitude} placeholder="135.77" />
      <Field
        label="Radius (km)"
        name="radiusKm"
        defaultValue={params.get("radiusKm") ?? ""}
        placeholder={String(defaultRadiusKm)}
      />
      <Field label="From" name="from" defaultValue={params.get("from") ?? ""} placeholder="1990" />
      <Field label="To" name="to" defaultValue={params.get("to") ?? ""} placeholder="1992-06" />
      <button
        type="submit"
        className="self-end rounded border border-line bg-subtle px-3 py-1.5 font-medium hover:bg-selected"
      >
        Search
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: (typeof fieldNames)[number];
  defaultValue: string;
  placeholder: string;
};

function Field({ label, name, defaultValue, placeholder }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded border border-line bg-page px-2 py-1.5 text-base"
      />
    </label>
  );
}

/** Writes the form's fields over the query, keeping parameters the form does not hold, such as the filter. */
function toQueryParams(form: FormData, previous: URLSearchParams) {
  const value = (name: (typeof fieldNames)[number]) => String(form.get(name) ?? "").trim();
  const next = new URLSearchParams(previous);
  const near =
    value("latitude") || value("longitude") ? `${value("latitude")},${value("longitude")}` : "";
  const entries = { near, radiusKm: value("radiusKm"), from: value("from"), to: value("to") };
  for (const [name, text] of Object.entries(entries)) {
    if (text) next.set(name, text);
    else next.delete(name);
  }
  return next;
}
