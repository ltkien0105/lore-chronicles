import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { TownMedHover, TownMed, Town } from "@/assets/images/pins";

const PIN_PATHS = {
  "town-med": {
    base: TownMed,
    hover: TownMedHover,
  },
  town: Town,
};

export function usePinTextures() {
  const allPinPaths: string[] = [
    PIN_PATHS["town-med"].base,
    PIN_PATHS["town-med"].hover,
    PIN_PATHS.town,
  ];

  const pinTextures = useTexture(allPinPaths, (textures) => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
    });
  });

  return {
    "town-med": {
      base: pinTextures[0],
      hover: pinTextures[1],
    },
    town: pinTextures[2],
  };
}
