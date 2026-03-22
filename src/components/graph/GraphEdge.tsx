/**
 * Graph edge component - renders curved line between two nodes
 * Color-coded by relationship type with hover tooltips
 * Supports dimming and highlighting states
 */

import { memo, useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import type { GraphEdge as GraphEdgeType } from "@/server/relationships";
import { RELATIONSHIP_COLORS, GRAPH_CONFIG } from "@/lib/graph-constants";

interface GraphEdgeProps {
  edge: GraphEdgeType;
  sourcePosition: [number, number, number];
  targetPosition: [number, number, number];
  isHighlighted: boolean;
  isDimmed: boolean;
  isHovered: boolean;
  onHover: (edgeId: number | null) => void;
}

function GraphEdgeInner({
  edge,
  sourcePosition,
  targetPosition,
  isHighlighted,
  isDimmed,
  isHovered,
  onHover,
}: GraphEdgeProps) {
  // Create curved path between nodes
  const curve = useMemo(() => {
    const start = new THREE.Vector3(...sourcePosition);
    const end = new THREE.Vector3(...targetPosition);

    // Calculate midpoint and add upward offset for curve
    const mid = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5);

    // Curve height based on distance
    const distance = start.distanceTo(end);
    mid.y += distance * 0.1; // 10% of distance

    return new THREE.CatmullRomCurve3([start, mid, end]);
  }, [sourcePosition, targetPosition]);

  // Generate line geometry from curve
  const points = useMemo(() => curve.getPoints(20), [curve]);

  // Calculate color based on relationship type
  const color = useMemo(() => {
    const typeKey = edge.type as keyof typeof RELATIONSHIP_COLORS;
    return RELATIONSHIP_COLORS[typeKey] || RELATIONSHIP_COLORS.shared_history;
  }, [edge.type]);

  // Calculate opacity based on state
  const opacity = useMemo(() => {
    if (isDimmed) return GRAPH_CONFIG.dimmedOpacity;
    if (isHighlighted) return GRAPH_CONFIG.edgeHoverOpacity;
    return GRAPH_CONFIG.edgeOpacity;
  }, [isDimmed, isHighlighted]);

  // Calculate line width based on strength
  const lineWidth = useMemo(() => {
    return GRAPH_CONFIG.edgeWidth * edge.strength;
  }, [edge.strength]);

  // Midpoint for tooltip positioning
  const midPoint = useMemo(() => {
    const start = new THREE.Vector3(...sourcePosition);
    const end = new THREE.Vector3(...targetPosition);
    return start.clone().add(end).multiplyScalar(0.5);
  }, [sourcePosition, targetPosition]);

  return (
    <group>
      <line
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(edge.id);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(null);
        }}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          linewidth={lineWidth}
        />
      </line>

      {/* Show tooltip on hover */}
      {isHovered && edge.description && (
        <Html position={[midPoint.x, midPoint.y, midPoint.z]} center distanceFactor={10} zIndexRange={[100, 0]}>
          <div className="pointer-events-none max-w-xs rounded-lg border border-primary/20 bg-stone-900/95 px-3 py-2 shadow-lg">
            <p className="text-xs font-semibold text-primary capitalize">
              {edge.type.replace(/_/g, " ")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {edge.description}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

export const GraphEdge = memo(GraphEdgeInner);
