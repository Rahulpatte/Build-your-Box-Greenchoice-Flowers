import * as React from "react";
import { parseLengthAndUnit, cssValue } from "./helpers/unitConverter";
import { createAnimation } from "./helpers/animation";

const moon = createAnimation("MoonLoader", "100% {transform: rotate(360deg)}", "moon");

function MoonLoader({
  loading = true,
  color = "#064b56",
  speedMultiplier = 1,
  cssOverride = {},
  size = 40,
  ...additionalprops
}) {
  const { value, unit } = parseLengthAndUnit(size);
  const moonSize = Math.round(value / 7);

  const wrapper = {
    display: "inherit",
    position: "relative",
    width: `${value + moonSize * 2}${unit}`,
    height: `${value + moonSize * 2}${unit}`,
    animation: `${moon} ${0.6 / speedMultiplier}s 0s infinite linear`,
    animationFillMode: "forwards",
    ...cssOverride,
  };

  const ballStyle = (size) => {
    return {
      width: cssValue(size),
      height: cssValue(size),
      borderRadius: "100%",
    };
  };

  const ball = {
    ...ballStyle(moonSize),
    backgroundColor: color,
    opacity: "0.8",
    position: "absolute",
    top: `${value / 2 - moonSize / 2}${unit}`,
    animation: `${moon} ${0.6 / speedMultiplier}s 0s infinite linear`,
    animationFillMode: "forwards",
  };

  const circle = {
    ...ballStyle(value),
    border: `${moonSize}px solid ${color}`,
    opacity: "0.1",
    boxSizing: "content-box",
    position: "absolute",
  };

  if (!loading) {
    return null;
  }

  return (
    <span style={wrapper} {...additionalprops}>
      <span style={ball} />
      <span style={circle} />
    </span>
  );
}

export default MoonLoader;
