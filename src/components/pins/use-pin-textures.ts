import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { TownMedHover, TownMed } from "@/assets/images/pins";

const PIN_PATHS = {
  base: TownMed,
  hover: TownMedHover,
};

export function usePinTextures() {
  const allPinPaths: string[] = [PIN_PATHS.base, PIN_PATHS.hover];

  const pinTextures = useTexture(allPinPaths, (textures) => {
    textures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
    });
  });

  return { base: pinTextures[0], hover: pinTextures[1] };
}
