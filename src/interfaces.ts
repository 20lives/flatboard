/**
 * TypeScript interfaces and types for the keyboard configuration system
 */

// Basic types
export type Point2D = { x: number; y: number };
export type KeyPlacement = { pos: Point2D; rot: number };

// Row layout configuration
export interface RowLayoutItem {
  start: number; // Starting grid position for this row
  length: number; // Number of keys in this row
  offset?: number; // Column stagger offset (optional, defaults to 0)
  thumbAnchor?: number; // Optional thumb anchor key index for this row
}

// Matrix layout configuration
export interface MatrixConfig {
  rowLayout: RowLayoutItem[];
  spacing: number;
}

// Layout configuration
export interface LayoutConfig {
  matrix: MatrixConfig;
  edgeMargin: number;
  baseDegrees: number;
}

// Switch configuration
export interface SwitchConfig {
  type: 'choc' | 'mx';
  cutout: {
    inner: number;
    outer: number;
    height: number;
    startHeight: number;
  };
  plate: {
    thickness: number;
    totalThickness: number;
  };
}

// Thumb cluster configuration
export interface ThumbConfig {
  cluster: {
    keys: number;
    spacing?: number;
    rotation?: number;
  };
  offset: Point2D;
  perKey?: {
    rotations: number[];
    offsets: Point2D[];
  };
}

// Silicon pad socket configuration
export interface SiliconPadSocket {
  shape: 'round' | 'square';
  size: {
    radius?: number; // For round sockets
    width?: number; // For square sockets
    height?: number; // For square sockets
  };
  depth: number; // Socket depth into bottom plate
  position: {
    anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    offset: Point2D; // Offset from anchor position
  };
  reinforcement?: {
    thickness?: number; // Additional reinforcement rim thickness beyond socket size (default: 2mm for round, 1.5mm for square)
    height?: number; // Additional reinforcement height beyond socket depth (default: 1mm)
  };
}

// Enclosure configuration
export interface EnclosureConfig {
  plate: {
    topThickness: number; // Top switch mounting plate thickness
    bottomThickness: number; // Bottom case floor thickness
  };
  walls: {
    thickness: number; // Perimeter wall thickness
    height: number; // Wall height extending down from top plate
  };
  bottomPadsSockets?: SiliconPadSocket[]; // Optional silicon pad sockets for bottom plate
}

// Connector configuration
export interface ConnectorConfig {
  type: string; // Will be typed more specifically in connectors.ts
  enabled: boolean;
  face: 'top' | 'bottom' | 'left' | 'right';
  position: number;
  clearance: number;
}

// Output configuration
export interface OutputConfig {
  openscad: {
    resolution: number;
  };
}

// Complete keyboard configuration interface
export interface KeyboardConfig {
  layout: LayoutConfig;
  switch: SwitchConfig;
  thumb?: ThumbConfig;
  enclosure: EnclosureConfig;
  connectors?: ConnectorConfig[];
  output: OutputConfig;
}

// Switch specification interface for switch definitions
export interface SwitchSpec {
  description: string;
  switch: {
    cutout: {
      inner: number;
      outer: number;
      height: number;
      startHeight: number;
    };
    plate: {
      thickness: number;
      totalThickness: number;
    };
  };
  layout: {
    matrix: {
      spacing: number;
    };
  };
}

// Connector specification interface for connector definitions
export interface ConnectorSpec {
  description: string;
  geometry: {
    type: 'pill' | 'circle' | 'square';
    radius?: number;
    circleRadius?: number;
    centerDistance?: number;
    width?: number;
    height?: number;
    depth?: number;
  };
}

// Parameter profile type for partial configuration overrides
export interface ParameterProfile {
  layout?: {
    matrix?: {
      rowLayout?: RowLayoutItem[];
    };
    edgeMargin?: number;
    baseDegrees?: number;
  };
  switch?: {
    type?: 'choc' | 'mx';
  };
  thumb?: {
    cluster?: {
      keys?: number;
      spacing?: number;
      rotation?: number;
    };
    offset?: Point2D;
    perKey?: {
      rotations?: number[];
      offsets?: Point2D[];
    };
  };
  enclosure?: {
    plate?: {
      topThickness?: number;
      bottomThickness?: number;
    };
    walls?: {
      thickness?: number;
      height?: number;
    };
    bottomPadsSockets?: SiliconPadSocket[];
  };
  connectors?: ConnectorConfig[];
  output?: {
    openscad?: {
      resolution?: number;
    };
  };
}
