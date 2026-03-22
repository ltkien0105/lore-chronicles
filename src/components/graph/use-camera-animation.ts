/**
 * Hook for smooth camera animations in 3D graph
 * Handles focus on node with bounding box calculation
 */

import { useCallback, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { GRAPH_CONFIG } from "@/lib/graph-constants";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

export function useCameraAnimation(
  controlsRef: React.RefObject<OrbitControlsType>
) {
  const { camera } = useThree();
  const animationRef = useRef<number | null>(null);

  const focusOnNode = useCallback(
    (nodePosition: [number, number, number], neighborPositions: [number, number, number][]) => {
      if (!controlsRef.current) return;

      // Cancel any ongoing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Calculate bounding box for node and neighbors
      const bbox = new THREE.Box3();
      bbox.expandByPoint(new THREE.Vector3(...nodePosition));
      neighborPositions.forEach((pos) => {
        bbox.expandByPoint(new THREE.Vector3(...pos));
      });

      // Add padding
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * GRAPH_CONFIG.focusPaddingMultiplier;

      // Calculate target camera position (zoom out enough to see all)
      const targetPos = center.clone().add(new THREE.Vector3(0, 0, Math.max(distance, 50)));

      // Animate camera and controls
      const startPos = camera.position.clone();
      const startTarget = controlsRef.current.target.clone();
      const duration = GRAPH_CONFIG.focusAnimationDuration;
      const startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-in-out)
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Interpolate camera position
        camera.position.lerpVectors(startPos, targetPos, eased);

        // Interpolate controls target
        if (controlsRef.current) {
          controlsRef.current.target.lerpVectors(startTarget, center, eased);
          controlsRef.current.update();
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          animationRef.current = null;
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    [camera, controlsRef]
  );

  return { focusOnNode };
}
