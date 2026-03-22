/**
 * Main 3D graph scene with force-directed layout
 * Manages node positions, interactions, and rendering
 */

import { useRef, useEffect, useState, useMemo } from "react";
import ForceGraph3D from "three-forcegraph";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";
import { GraphNode } from "./GraphNode";
import { GraphEdge } from "./GraphEdge";
import { GraphControls } from "./GraphControls";
import { useGraphInteractions } from "./useGraphInteractions";
import { useCameraAnimation } from "./useCameraAnimation";
import type { GraphData } from "@/server/relationships";
import { GRAPH_CONFIG } from "@/lib/graph-constants";

interface GraphSceneProps {
  data: GraphData;
  focusSlug?: string;
  onNodeClick?: (slug: string) => void;
}

interface NodePosition {
  id: number;
  x: number;
  y: number;
  z: number;
}

export function GraphScene({ data, focusSlug, onNodeClick }: GraphSceneProps) {
  const controlsRef = useRef<OrbitControlsType | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<number, [number, number, number]>>(new Map());
  const [layoutStabilized, setLayoutStabilized] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number; nodeId: number } | null>(null);
  const hasInitialFocus = useRef(false);

  const allNodeIds = useMemo(() => data.nodes.map((n) => n.id), [data.nodes]);

  const {
    selectedNodeId,
    hoveredNodeId,
    hoveredEdgeId,
    highlightedEdges,
    dimmedNodes,
    setSelectedNodeId,
    setHoveredNodeId,
    setHoveredEdgeId,
    clearSelection,
  } = useGraphInteractions(data.edges, allNodeIds);

  const { focusOnNode } = useCameraAnimation(controlsRef as React.RefObject<OrbitControlsType>);

  // Initialize force-directed layout
  useEffect(() => {
    const fg = new ForceGraph3D()
      .graphData({
        nodes: data.nodes.map((n) => ({ id: n.id, name: n.name })),
        links: data.edges.map((e) => ({ source: e.source, target: e.target })),
      })
      .numDimensions(3)
      .d3Force("charge")?.strength(GRAPH_CONFIG.forceStrength);

    fg.d3Force("link")?.distance(GRAPH_CONFIG.linkDistance);
    fg.d3Force("center")?.strength(GRAPH_CONFIG.centerStrength);

    // Run simulation for a fixed number of ticks
    let ticks = 0;
    const maxTicks = 200;

    const tickInterval = setInterval(() => {
      fg.tickFrame();
      ticks++;

      // Update positions
      const positions = new Map<number, [number, number, number]>();
      data.nodes.forEach((node) => {
        const graphNode = fg.graphData().nodes.find((n: any) => n.id === node.id);
        if (graphNode && typeof graphNode.x === "number" && typeof graphNode.y === "number" && typeof graphNode.z === "number") {
          positions.set(node.id, [graphNode.x, graphNode.y, graphNode.z]);
        }
      });
      setNodePositions(positions);

      if (ticks >= maxTicks) {
        clearInterval(tickInterval);
        setLayoutStabilized(true);
      }
    }, 16); // ~60fps

    return () => clearInterval(tickInterval);
  }, [data]);

  // Handle initial focus from URL parameter
  useEffect(() => {
    if (hasInitialFocus.current || !focusSlug || !layoutStabilized) return;

    const node = data.nodes.find((n) => n.slug === focusSlug);
    if (node) {
      const nodePos = nodePositions.get(node.id);
      if (nodePos) {
        hasInitialFocus.current = true;
        setSelectedNodeId(node.id);

        // Get neighbor positions
        const neighborIds = data.edges
          .filter((e) => e.source === node.id || e.target === node.id)
          .map((e) => (e.source === node.id ? e.target : e.source));

        const neighborPositions = neighborIds
          .map((id) => nodePositions.get(id))
          .filter((pos): pos is [number, number, number] => pos !== undefined);

        focusOnNode(nodePos, neighborPositions);
      }
    }
  }, [focusSlug, layoutStabilized, data.nodes, data.edges, nodePositions, setSelectedNodeId, focusOnNode]);

  // Handle node pointer down
  const handleNodePointerDown = (nodeId: number, event: any) => {
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      nodeId,
    };
  };

  // Handle node pointer up (click detection)
  const handleNodePointerUp = (nodeId: number, event: any) => {
    if (pointerStartRef.current && pointerStartRef.current.nodeId === nodeId) {
      const deltaX = Math.abs(event.clientX - pointerStartRef.current.x);
      const deltaY = Math.abs(event.clientY - pointerStartRef.current.y);
      const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Only trigger click if pointer hasn't moved much (not a drag)
      if (delta < GRAPH_CONFIG.dragThresholdPx) {
        // Check for double-click
        const now = Date.now();
        const lastClick = (event.target as any).__lastClickTime || 0;
        (event.target as any).__lastClickTime = now;

        if (now - lastClick < 300) {
          // Double-click: navigate to champion page
          const node = data.nodes.find((n) => n.id === nodeId);
          if (node && onNodeClick) {
            onNodeClick(node.slug);
          }
        } else {
          // Single click: select and focus
          setSelectedNodeId(nodeId);

          const nodePos = nodePositions.get(nodeId);
          if (nodePos) {
            // Get neighbor positions
            const neighborIds = data.edges
              .filter((e) => e.source === nodeId || e.target === nodeId)
              .map((e) => (e.source === nodeId ? e.target : e.source));

            const neighborPositions = neighborIds
              .map((id) => nodePositions.get(id))
              .filter((pos): pos is [number, number, number] => pos !== undefined);

            focusOnNode(nodePos, neighborPositions);
          }
        }
      }
    }

    pointerStartRef.current = null;
  };

  // Get neighbor positions for rendering edges
  const getNeighborPositions = (nodeId: number): [number, number, number][] => {
    const neighborIds = data.edges
      .filter((e) => e.source === nodeId || e.target === nodeId)
      .map((e) => (e.source === nodeId ? e.target : e.source));

    return neighborIds
      .map((id) => nodePositions.get(id))
      .filter((pos): pos is [number, number, number] => pos !== undefined);
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <GraphControls ref={controlsRef} onBackgroundClick={clearSelection} />

      {/* Render nodes */}
      {data.nodes.map((node) => {
        const position = nodePositions.get(node.id);
        if (!position) return null;

        return (
          <GraphNode
            key={node.id}
            node={node}
            position={position}
            isSelected={selectedNodeId === node.id}
            isDimmed={dimmedNodes.has(node.id)}
            isHovered={hoveredNodeId === node.id}
            onHover={setHoveredNodeId}
            onPointerDown={handleNodePointerDown}
            onPointerUp={handleNodePointerUp}
          />
        );
      })}

      {/* Render edges */}
      {data.edges.map((edge) => {
        const sourcePos = nodePositions.get(edge.source);
        const targetPos = nodePositions.get(edge.target);
        if (!sourcePos || !targetPos) return null;

        return (
          <GraphEdge
            key={edge.id}
            edge={edge}
            sourcePosition={sourcePos}
            targetPosition={targetPos}
            isHighlighted={highlightedEdges.has(edge.id)}
            isDimmed={dimmedNodes.has(edge.source) || dimmedNodes.has(edge.target)}
            isHovered={hoveredEdgeId === edge.id}
            onHover={setHoveredEdgeId}
          />
        );
      })}
    </>
  );
}
