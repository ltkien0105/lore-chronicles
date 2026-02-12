// import { TownMedHover } from "@/assets/images/pins";

const PIN_ICON_SIZE_BASE: [number, number, number] = [0.7, 0.7, 1];
const PIN_ICON_SIZE_HOVER: [number, number, number] = [1.5, 1.5, 1];

// const PIN_PATHS: Record<string, string> = {
//   townMedHover: TownMedHover,
// };

export interface PinConfig {
  id: string;
  name: string;
  position: [number, number]; // [x, y] on plane
  iconSize: {
    base: [number, number, number];
    hover: [number, number, number];
  };
}

export const PINS: PinConfig[] = [
  {
    id: "hirana-monastery",
    name: "Hirana Monastery",
    position: [27.3, 17.7],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
  },
  {
    id: "kinkou-monastery",
    name: "Kinkou Monastery",
    position: [20.3, 14.2],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
  },
];
