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
  anchorX?: number | "center" | "left" | "right" | undefined;
}

const IONIA_PINS: PinConfig[] = [
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
  {
    id: "temple-of-pallas",
    name: "Temple of Pallas",
    position: [31.7, 1.5],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
  },
];

const FRELJORD_PINS: PinConfig[] = [
  {
    id: "yetis-vigil",
    name: "Yeti's Vigil",
    position: [-14, 19.7],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
  },
  {
    id: "foundling-village",
    name: "Foundling Village",
    position: [-12.9, 20.2],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
  },
  {
    id: "naljaag",
    name: "Naljaäg",
    position: [-13.7, 14.6],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
  },
  {
    id: "vathcaer",
    name: "Vathcaer",
    position: [-19.4, 15.5],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
  },
  {
    id: "ornnkaal-rocks",
    name: "Ornnkaal Rocks",
    position: [-20.3, 15.4],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
    anchorX: "right",
  },
  {
    id: "yadulsk",
    name: "Yadulsk",
    position: [-21.3, 15.8],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
  },
  {
    id: "quchar",
    name: "Quchar",
    position: [-21.9, 15.9],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
    anchorX: "right",
  },
  {
    id: "village-of-the-ice-children",
    name: "Village of the Ice Children",
    position: [-19.8, 13.6],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
  },
  {
    id: "ghulfrost",
    name: "Ghulfrost",
    position: [-20.5, 13.3],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
  },
  {
    id: "rakelstake",
    name: "Rakelstake",
    position: [-22.2, 9.2],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
  },
  {
    id: "glaserport",
    name: "Glaserport",
    position: [-33.9, 9.2],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
  },
  {
    id: "ryganns-reach",
    name: "Rygann's Reach",
    position: [-32.2, 8.2],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
  },
  {
    id: "valars-hollow",
    name: "Valar's Hollow",
    position: [-30.2, 7.3],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
  },
  {
    id: "frostheld",
    name: "Frostheld",
    position: [-27.9, 5.5],
    iconSize: {
      base: PIN_ICON_SIZE_BASE,
      hover: PIN_ICON_SIZE_HOVER,
    },
  },
];

export const PINS: PinConfig[] = [...IONIA_PINS, ...FRELJORD_PINS];
