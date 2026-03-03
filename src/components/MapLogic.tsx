import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useCallback, useEffect } from "react";
import { MapControls as MapControlsImpl } from "three-stdlib";
import { MapControls } from "@react-three/drei";
import { DEFAULT_FOV, ZOOM_DEFAULT } from "@/lib/constants";
import { getDistanceForZoom, getEffectiveZoom } from "@/lib/utils";

export default function MapLogic({
  planeWidth,
  planeHeight,
}: {
  planeWidth: number;
  planeHeight: number;
}) {
  const { camera, size } = useThree();
  const perspectiveCamera = camera as THREE.PerspectiveCamera;
  const controlsRef = useRef<MapControlsImpl>(null);

  const minZoom = useMemo(() => {
    const zoomX = size.width / planeWidth;
    const zoomY = size.height / planeHeight;
    return Math.max(zoomX, zoomY);
  }, [size, planeWidth, planeHeight]);

  const minDistance = useMemo(() => {
    return getDistanceForZoom(60, size, DEFAULT_FOV);
  }, [size]);

  const maxDistance = useMemo(() => {
    return getDistanceForZoom(minZoom, size, DEFAULT_FOV);
  }, [minZoom, size]);

  // Calculate pan limits based on current zoom
  const getPanLimits = useCallback(() => {
    const zoom = getEffectiveZoom(perspectiveCamera, size);

    // Calculate visible area in world units
    const halfVisibleWidth = size.width / zoom / 2;
    const halfVisibleHeight = size.height / zoom / 2;

    const halfPlaneWidth = planeWidth / 2;

    // Calculate max pan distance (how far camera center can move from origin)
    const maxPanX = Math.max(0, halfPlaneWidth - halfVisibleWidth);

    // Restrict vertical panning: 20% from top, 10% from bottom
    // This creates an asymmetric panning boundary
    const topRestriction = planeHeight * 0.2; // 20% from top
    const bottomRestriction = planeHeight * 0.1; // 10% from bottom

    // Calculate the allowed panning range
    const allowedHeight = planeHeight - topRestriction - bottomRestriction;

    // The center of the allowed area is shifted down from origin
    const allowedCenterOffset = (bottomRestriction - topRestriction) / 2;

    // Calculate maximum pan distances from the allowed center
    const halfAllowedHeight = allowedHeight / 2;
    const maxPanYFromCenter = Math.max(
      0,
      halfAllowedHeight - halfVisibleHeight,
    );

    // Calculate actual min/max pan Y values
    const minPanY = allowedCenterOffset - maxPanYFromCenter;
    const maxPanY = allowedCenterOffset + maxPanYFromCenter;

    return { maxPanX, minPanY, maxPanY };
  }, [perspectiveCamera, size, planeWidth, planeHeight]);

  // Handle change event from MapControls to clamp position
  const handleChange = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const { maxPanX, minPanY, maxPanY } = getPanLimits();

    // Clamp target position
    const clampedX = THREE.MathUtils.clamp(
      controls.target.x,
      -maxPanX,
      maxPanX,
    );
    const clampedY = THREE.MathUtils.clamp(controls.target.y, minPanY, maxPanY);

    // Calculate the delta to apply to camera
    const deltaX = clampedX - controls.target.x;
    const deltaY = clampedY - controls.target.y;

    // Update target
    controls.target.x = clampedX;
    controls.target.y = clampedY;

    // Update camera position to match
    camera.position.x += deltaX;
    camera.position.y += deltaY;
  }, [camera, getPanLimits]);

  // Keep camera distance in sync with default zoom when size changes
  useEffect(() => {
    const distance = getDistanceForZoom(ZOOM_DEFAULT, size, DEFAULT_FOV);
    perspectiveCamera.position.z = distance;
    perspectiveCamera.updateProjectionMatrix();
    controlsRef.current?.update();
  }, [perspectiveCamera, size]);

  // Also clamp on zoom changes
  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const { maxPanX, minPanY, maxPanY } = getPanLimits();

    // Only clamp if outside bounds (don't interfere with normal panning)
    const targetX = controls.target.x;
    const targetY = controls.target.y;

    if (Math.abs(targetX) > maxPanX || targetY < minPanY || targetY > maxPanY) {
      const clampedX = THREE.MathUtils.clamp(targetX, -maxPanX, maxPanX);
      const clampedY = THREE.MathUtils.clamp(targetY, minPanY, maxPanY);

      const deltaX = clampedX - targetX;
      const deltaY = clampedY - targetY;

      controls.target.x = clampedX;
      controls.target.y = clampedY;
      camera.position.x += deltaX;
      camera.position.y += deltaY;
    }
  });

  return (
    <MapControls
      ref={controlsRef}
      enableRotate={false}
      enablePan={true}
      screenSpacePanning={true}
      minDistance={minDistance}
      maxDistance={maxDistance}
      onChange={handleChange}
    />
  );
}
