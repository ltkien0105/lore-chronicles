import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as THREE from "three"
import { DEFAULT_FOV } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert perspective camera distance + FOV into an orthographic-style zoom value.
 * Uses viewport height to preserve existing zoom thresholds across camera types.
 */
export const getEffectiveZoom = (
  camera: THREE.PerspectiveCamera,
  size: { height: number },
) => {
  const height = Math.max(size.height, 1);
  const distance = Math.max(Math.abs(camera.position.z), 0.0001); // Make sure distance is never zero
  const fov = THREE.MathUtils.degToRad(camera.fov);
  return height / (2 * distance * Math.tan(fov / 2));
};

/**
 * Inverse of getEffectiveZoom: compute camera distance for a desired zoom.
 * Keeps zoom-driven behaviors consistent by solving for distance.
 */
export const getDistanceForZoom = (
  zoom: number,
  size: { height: number },
  fov: number = DEFAULT_FOV,
) => {
  const height = Math.max(size.height, 1);
  const safeZoom = Math.max(zoom, 0.0001);
  const fovRad = THREE.MathUtils.degToRad(fov);
  return height / (2 * safeZoom * Math.tan(fovRad / 2));
};
