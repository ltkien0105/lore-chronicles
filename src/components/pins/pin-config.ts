const TOWN_MED_PIN_ICON_SIZE_BASE: [number, number, number] = [0.7, 0.7, 1];
const TOWN_MED_PIN_ICON_SIZE_HOVER: [number, number, number] = [1.5, 1.5, 1];
export const TOWN_MED_PIN_ICON_SIZE = {
  base: TOWN_MED_PIN_ICON_SIZE_BASE,
  hover: TOWN_MED_PIN_ICON_SIZE_HOVER,
};

export const Pin = { TOWN: "town", TOWN_MED: "town-med" } as const;
export type PinType = (typeof Pin)[keyof typeof Pin];

export interface PinConfig {
  id: string;
  name: string;
  position: [number, number]; // [x, y] on plane
  anchorX?: number | "center" | "left" | "right" | undefined;
  pinType: PinType;
}

const IONIA_PINS: PinConfig[] = [
  {
    id: "hirana-monastery",
    name: "Hirana Monastery",
    position: [27.3, 17.7],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "kinkou-monastery",
    name: "Kinkou Monastery",
    position: [20.3, 14.2],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "temple-of-pallas",
    name: "Temple of Pallas",
    position: [31.7, 1.5],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "faelor",
    name: "Fae'lor",
    position: [17.5, 9.7],
    pinType: Pin.TOWN,
    anchorX: "right",
  },
  {
    id: "wehle",
    name: "Weh'le",
    position: [21.1, 9],
    pinType: Pin.TOWN,
    anchorX: "right",
  },
  {
    id: "wuju",
    name: "Wuju",
    position: [22.7, 8.2],
    pinType: Pin.TOWN,
    anchorX: "right",
  },
  {
    id: "tevasa",
    name: "Tevasa",
    position: [23, 9.2],
    pinType: Pin.TOWN,
  },
  {
    id: "vlonqo",
    name: "Vlonqo",
    position: [27.4, 10.6],
    pinType: Pin.TOWN,
  },
  {
    id: "puboe",
    name: "Puboe",
    position: [21.9, 16.7],
    pinType: Pin.TOWN,
  },
  {
    id: "zhyunia",
    name: "Zhyunia",
    position: [29, 6.4],
    pinType: Pin.TOWN,
    anchorX: "right",
  },
  {
    id: "kashuri",
    name: "Kashuri",
    position: [31.5, 6.1],
    pinType: Pin.TOWN,
  },
  {
    id: "tuula",
    name: "Tuula",
    position: [30.2, 4.8],
    pinType: Pin.TOWN,
  },
  {
    id: "temple-of-the-jaggled-knife",
    name: "Temple of the Jaggled Knife",
    position: [28.7, 3.3],
    pinType: Pin.TOWN,
  },
  {
    id: "raikkon",
    name: "Raikkon",
    position: [28.4, 2.4],
    pinType: Pin.TOWN,
  },
];

const FRELJORD_PINS: PinConfig[] = [
  {
    id: "yetis-vigil",
    name: "Yeti's Vigil",
    position: [-14, 19.7],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "foundling-village",
    name: "Foundling Village",
    position: [-12.9, 20.2],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "naljaag",
    name: "Naljaäg",
    position: [-13.7, 14.6],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "vathcaer",
    name: "Vathcaer",
    position: [-19.4, 15.5],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "ornnkaal-rocks",
    name: "Ornnkaal Rocks",
    position: [-20.3, 15.4],
    anchorX: "right",
    pinType: Pin.TOWN_MED,
  },
  {
    id: "yadulsk",
    name: "Yadulsk",
    position: [-21.3, 15.8],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "quchar",
    name: "Quchar",
    position: [-21.9, 15.9],
    anchorX: "right",
    pinType: Pin.TOWN_MED,
  },
  {
    id: "village-of-the-ice-children",
    name: "Village of the Ice Children",
    position: [-19.8, 13.6],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "ghulfrost",
    name: "Ghulfrost",
    position: [-20.5, 13.3],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "rakelstake",
    name: "Rakelstake",
    position: [-22.2, 9.2],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "glaserport",
    name: "Glaserport",
    position: [-33.9, 9.2],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "ryganns-reach",
    name: "Rygann's Reach",
    position: [-32.2, 8.2],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "valars-hollow",
    name: "Valar's Hollow",
    position: [-30.2, 7.3],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "frostheld",
    name: "Frostheld",
    position: [-27.9, 5.5],
    pinType: Pin.TOWN_MED,
  },
];

const DEMACIA_PINS: PinConfig[] = [
  {
    id: "fossbarrow",
    name: "Fossbarrow",
    position: [-24.5, 4.1],
    anchorX: "right",
    pinType: Pin.TOWN_MED,
  },
  {
    id: "high-silvermere",
    name: "High Silvermere",
    position: [-23.7, 4.1],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "uwendale",
    name: "Uwendale",
    position: [-19.9, 5.4],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "trevale",
    name: "Trevale",
    position: [-15.5, -3.5],
    pinType: Pin.TOWN_MED,
  },
];

const NOXUS_PINS: PinConfig[] = [
  {
    id: "basilich",
    name: "Basilich",
    position: [15.1, 0.3],
    pinType: Pin.TOWN_MED,
  },
];

const BILGEwATER_PINS: PinConfig[] = [
  {
    id: "bilgewater-bay",
    name: "Bilgewater Bay",
    position: [24.7, -9.2],
    pinType: Pin.TOWN_MED,
  },
];

const SHURIMA_PINS: PinConfig[] = [
  {
    id: "belzhun",
    name: "Bel'zhun",
    position: [6.8, -9.1],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "nashramae",
    name: "Nashramae",
    position: [0, -10.7],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "the-city-of-gardens",
    name: "The City of Gardens",
    position: [-4, -21.2],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "zirima",
    name: "Zirima",
    position: [0, -23.6],
    pinType: Pin.TOWN_MED,
  },
  {
    id: "marrowmark",
    name: "Marrowmark",
    position: [2.5, -21.6],
    pinType: Pin.TOWN_MED,
  },
];

export const PINS: PinConfig[] = [
  ...IONIA_PINS,
  ...FRELJORD_PINS,
  ...DEMACIA_PINS,
  ...NOXUS_PINS,
  ...BILGEwATER_PINS,
  ...SHURIMA_PINS,
];
