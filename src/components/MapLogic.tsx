import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useCallback } from "react";
import { MapControls as MapControlsImpl } from "three-stdlib";
import { MapControls } from "@react-three/drei";

export default function MapLogic({
  planeWidth,
  planeHeight,
}: {
  planeWidth: number;
  planeHeight: number;
}) {
  const { camera, size } = useThree();
  const controlsRef = useRef<MapControlsImpl>(null);

  const minZoom = useMemo(() => {
    const zoomX = size.width / planeWidth;
    const zoomY = size.height / planeHeight;
    return Math.max(zoomX, zoomY);
  }, [size, planeWidth, planeHeight]);

  // Calculate pan limits based on current zoom
  const getPanLimits = useCallback(() => {
    const orthoCamera = camera as THREE.OrthographicCamera;
    const zoom = orthoCamera.zoom;

    // Calculate visible area in world units
    const halfVisibleWidth = size.width / zoom / 2;
    const halfVisibleHeight = size.height / zoom / 2;

    const halfPlaneWidth = planeWidth / 2;
    const halfPlaneHeight = planeHeight / 2;

    // Calculate max pan distance (how far camera center can move from origin)
    const maxPanX = Math.max(0, halfPlaneWidth - halfVisibleWidth);
    const maxPanY = Math.max(0, halfPlaneHeight - halfVisibleHeight);

    return { maxPanX, maxPanY };
  }, [camera, size, planeWidth, planeHeight]);

  // Handle change event from MapControls to clamp position
  const handleChange = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const { maxPanX, maxPanY } = getPanLimits();

    // Clamp target position
    const clampedX = THREE.MathUtils.clamp(controls.target.x, -maxPanX, maxPanX);
    const clampedY = THREE.MathUtils.clamp(controls.target.y, -maxPanY, maxPanY);

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

  // Also clamp on zoom changes
  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const { maxPanX, maxPanY } = getPanLimits();

    // Only clamp if outside bounds (don't interfere with normal panning)
    const targetX = controls.target.x;
    const targetY = controls.target.y;

    if (Math.abs(targetX) > maxPanX || Math.abs(targetY) > maxPanY) {
      const clampedX = THREE.MathUtils.clamp(targetX, -maxPanX, maxPanX);
      const clampedY = THREE.MathUtils.clamp(targetY, -maxPanY, maxPanY);

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
      minZoom={minZoom}
      onChange={handleChange}
    />
  );
}
