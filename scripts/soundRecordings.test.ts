import { describe, expect, it } from "vitest";
import {
  type GbifSoundOccurrence,
  toHeardInConnection,
  toRecordedNearConnection,
  toSoundRecording,
} from "./soundRecordings.ts";

function makeOccurrence(overrides: Partial<GbifSoundOccurrence> = {}) {
  return {
    key: 6131629395,
    datasetKey: "50c9509d",
    datasetName: "iNaturalist research-grade observations",
    license: "http://creativecommons.org/licenses/by-nc/4.0/legalcode",
    species: "Apis mellifera",
    speciesKey: 1341976,
    kingdom: "Animalia",
    class: "Insecta",
    decimalLatitude: 48.4,
    decimalLongitude: -123.2,
    eventDate: "2026-01-09T14:24:50",
    stateProvince: "British Columbia",
    country: "Canada",
    media: [
      { type: "StillImage", identifier: "https://example.org/bee.jpg" },
      {
        type: "Sound",
        identifier: "https://example.org/bee.wav",
        references: "https://www.inaturalist.org/sounds/1",
        license: "http://creativecommons.org/licenses/by-nc-nd/4.0/",
        creator: "Bob",
        rightsHolder: "Bob McDougall",
      },
    ],
    ...overrides,
  } satisfies GbifSoundOccurrence;
}

function recordingOf(overrides: Partial<GbifSoundOccurrence> = {}) {
  const recording = toSoundRecording(makeOccurrence(overrides));
  if (!recording) throw new Error("Expected a recording");
  return recording;
}

describe("toSoundRecording", () => {
  it("links the sound, not another medium", () => {
    expect(recordingOf().node.media.url).toBe("https://example.org/bee.wav");
  });

  it("keeps the sound's own licence, even one that forbids adaptation", () => {
    expect(recordingOf().node.media.licence).toBe("CC-BY-NC-ND-4.0");
  });

  it("credits the rights holder", () => {
    expect(recordingOf().node.media.credit).toBe("Bob McDougall");
  });

  it("labels the recording with its species, place and year", () => {
    expect(recordingOf().node.label).toBe("Apis mellifera, British Columbia, Canada, 2026");
  });

  it("keeps the date of an event date", () => {
    expect(recordingOf().date).toBe("2026-01-09");
  });

  it("keeps both ends of a date interval", () => {
    expect(recordingOf({ eventDate: "2019-05-01T10:00/2019-05-03" }).date).toBe(
      "2019-05-01/2019-05-03",
    );
  });

  it("gives nothing for an occurrence without a sound", () => {
    expect(toSoundRecording(makeOccurrence({ media: [] }))).toBeNull();
  });

  it("gives nothing for a sound under an unknown licence", () => {
    const media = [{ type: "Sound", identifier: "https://example.org/a.mp3", license: "©" }];
    expect(toSoundRecording(makeOccurrence({ media }))).toBeNull();
  });

  it("gives nothing for an occurrence without a species", () => {
    expect(toSoundRecording(makeOccurrence({ species: undefined }))).toBeNull();
  });
});

describe("toHeardInConnection", () => {
  it("records where the recording was made", () => {
    const connection = toHeardInConnection("wikidata:Q30034", recordingOf(), []);
    expect([connection.latitude, connection.longitude]).toEqual([48.4, -123.2]);
  });

  it("carries the occurrence record's licence", () => {
    expect(toHeardInConnection("wikidata:Q30034", recordingOf(), []).licence).toBe("CC-BY-NC-4.0");
  });
});

describe("toRecordedNearConnection", () => {
  it("links the recording to the place", () => {
    const connection = toRecordedNearConnection(recordingOf(), "site:48.400,-123.000", 14.83);
    expect([connection.sourceNodeId, connection.targetNodeId]).toEqual([
      "gbif-occurrence:6131629395",
      "site:48.400,-123.000",
    ]);
  });

  it("weighs the link by the distance in kilometres", () => {
    expect(toRecordedNearConnection(recordingOf(), "site:1", 14.83).weight).toBe(14.8);
  });
});
