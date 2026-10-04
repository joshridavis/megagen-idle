import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MIN_SIGHTING_MS } from "../data/events";
import { useStore } from "../store";
import Sightings from "./Sightings";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => "visible",
  });
});

const setVisibility = (v: "visible" | "hidden") => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => v,
  });
  document.dispatchEvent(new Event("visibilitychange"));
};

describe("Sightings (0.91)", () => {
  it("waits while the tab is hidden and plays in full once visible", async () => {
    vi.useFakeTimers();
    useStore.getState().resetGame();
    setVisibility("hidden");
    render(<Sightings />);
    await act(async () => {
      useStore.setState({ activeSighting: { id: "aurora", at: 0 } });
    });
    expect(screen.queryByTestId("sighting-aurora")).toBeNull();
    await act(async () => {
      vi.advanceTimersByTime(MIN_SIGHTING_MS * 3);
    }); // hidden: nothing ends
    expect(useStore.getState().activeSighting).not.toBeNull();
    await act(async () => {
      setVisibility("visible");
    });
    expect(screen.getByTestId("sighting-aurora")).toBeTruthy();
    await act(async () => {
      vi.advanceTimersByTime(MIN_SIGHTING_MS - 1000);
    });
    expect(useStore.getState().activeSighting).not.toBeNull(); // still on screen
    await act(async () => {
      vi.advanceTimersByTime(10_000);
    });
    expect(useStore.getState().activeSighting).toBeNull();
  });
});

describe("Flock of birds sighting (owner request)", () => {
  it("draws a flock of gulls that flap their wings", async () => {
    useStore.getState().resetGame();
    render(<Sightings />);
    await act(async () => {
      useStore.setState({ activeSighting: { id: "birds", at: 0 } });
    });
    const flock = screen.getByTestId("sighting-birds");
    expect(flock.querySelectorAll(".sighting-bob")).toHaveLength(5);
    // two wing frames per gull swap to animate the flap
    expect(flock.querySelectorAll("img.frame-a")).toHaveLength(5);
    expect(flock.querySelectorAll("img.frame-b")).toHaveLength(5);
  });
});
