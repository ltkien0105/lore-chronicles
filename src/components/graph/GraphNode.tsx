/**
 * Champion node sprite component for relationship graph
 * Renders champion avatar as billboard sprite with hover/click interactions
 * Supports dimming, highlighting, and focus states
 */

import { memo, useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { GraphNode as GraphNodeData } from "@/server/relationships";
import { GRAPH_CONFIG } from "@/lib/graph-constants";

interface GraphNodeProps {
  node: GraphNodeData;
  position: [number, number, number];
  isSelected: boolean;
  isDimmed: boolean;
  isHovered: boolean;
  onHover: (nodeId: number | null) => void;
  onPointerDown: (nodeId: number, event: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (nodeId: number, event: ThreeEvent<PointerEvent>) => void;
}

const DRAG_THRESHOLD_PX = GRAPH_CONFIG.dragThresholdPx;

function GraphNodeInner({
  node,
  position,
  isSelected,
  isDimmed,
  isHovered,
  onHover,
  onPointerDown,
  onPointerUp,
}: GraphNodeProps) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load avatar texture with fallback to initials
  useEffect(() => {
    // Always start with initials texture immediately to avoid blank nodes
    const initialsTexture = createInitialsTexture(node.name);
    setTexture(initialsTexture);

    // Then try to load the actual avatar
    if (node.avatarUrl) {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");

      loader.load(
        node.avatarUrl,
        (loadedTexture) => {
          loadedTexture.minFilter = THREE.LinearFilter;
          loadedTexture.magFilter = THREE.LinearFilter;
          // Only update if we successfully loaded
          setTexture((prev) => {
            if (prev) prev.dispose();
            return loadedTexture;
          });
        },
        undefined,
        (error) => {
          // Keep using initials texture on error (already set)
          console.debug(`Failed to load avatar for ${node.name}:`, error);
        }
      );
    }

    return () => {
      // Cleanup handled by React state updates
    };
  }, [node.avatarUrl, node.name]);

  // Calculate opacity based on state
  const opacity = useMemo(() => {
    if (isDimmed) return GRAPH_CONFIG.dimmedOpacity;
    return GRAPH_CONFIG.highlightedOpacity;
  }, [isDimmed]);

  // Calculate scale based on state
  const scale = useMemo(() => {
    const baseSize = GRAPH_CONFIG.nodeSize;
    if (isHovered || isSelected) {
      return baseSize * GRAPH_CONFIG.nodeHoverScale;
    }
    return baseSize;
  }, [isHovered, isSelected]);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(node.id);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(null);
    document.body.style.cursor = "auto";
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onPointerDown(node.id, e);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onPointerUp(node.id, e);
  };

  // Animate scale smoothly
  useFrame(() => {
    if (spriteRef.current) {
      spriteRef.current.scale.lerp(
        new THREE.Vector3(scale, scale, 1),
        0.2
      );
    }
  });

  if (!texture) return null;

  return (
    <group position={position}>
      <sprite
        ref={spriteRef}
        scale={[scale, scale, 1]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <spriteMaterial
          map={texture as any}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </sprite>

      {/* Show label on hover */}
      {isHovered && (
        <Html center distanceFactor={10} zIndexRange={[100, 0]}>
          <div className="pointer-events-none rounded-lg border border-primary/20 bg-stone-900/95 px-3 py-2 shadow-lg">
            <p className="whitespace-nowrap font-heading text-sm font-semibold text-primary">
              {node.name}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Create a canvas texture with champion initials
 */
function createInitialsTexture(name: string): THREE.Texture {
  const canvas = document.createElement("canvas");
  const size = 256; // Higher resolution for better quality
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const center = size / 2;
  const radius = size / 2 - 8; // Leave room for border

  if (ctx) {
    // Draw gold border/glow
    ctx.fillStyle = "#C89B3C";
    ctx.beginPath();
    ctx.arc(center, center, radius + 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw background circle
    ctx.fillStyle = "#1c1917"; // stone-900
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw initials
    const initials = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    ctx.fillStyle = "#C89B3C";
    ctx.font = `bold ${size * 0.4}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, center, center);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export const GraphNode = memo(GraphNodeInner);
