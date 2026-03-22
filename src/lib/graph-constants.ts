import { RELATIONSHIP_TYPES } from "@/db/schema";

/**
 * Color mapping for relationship types in graph visualization
 */
export const RELATIONSHIP_COLORS = {
  [RELATIONSHIP_TYPES.FAMILY]: "#3B82F6", // Blue
  [RELATIONSHIP_TYPES.ALLY]: "#22C55E", // Green
  [RELATIONSHIP_TYPES.ENEMY]: "#EF4444", // Red
  [RELATIONSHIP_TYPES.ROMANTIC]: "#EC4899", // Pink
  [RELATIONSHIP_TYPES.MENTOR]: "#EAB308", // Gold
  [RELATIONSHIP_TYPES.RIVAL]: "#F97316", // Orange
  [RELATIONSHIP_TYPES.SHARED_HISTORY]: "#6B7280", // Gray
} as const;

/**
 * Graph visualization configuration
 */
export const GRAPH_CONFIG = {
  // Node settings
  nodeSize: 1.5,
  nodeHoverScale: 1.3,
  nodeMinSize: 1.0,
  nodeMaxSize: 2.5,

  // Edge settings
  edgeWidth: 0.1,
  edgeOpacity: 0.6,
  edgeHoverOpacity: 1.0,

  // Force simulation settings
  forceStrength: -100,
  linkDistance: 30,
  centerStrength: 0.05,
  velocityDecay: 0.4,

  // Camera settings
  cameraPosition: [0, 0, 150] as [number, number, number],
  orbitDamping: 0.1,
  zoomMin: 30,
  zoomMax: 300,

  // Interaction settings
  dragThresholdPx: 5,
  focusAnimationDuration: 800, // ms
  focusPaddingMultiplier: 1.2,

  // Dim/highlight settings
  dimmedOpacity: 0.3,
  highlightedOpacity: 1.0,
} as const;
