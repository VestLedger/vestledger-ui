'use client';

import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { NetworkNode } from './network-graph';

interface NodePosition {
  x: number;
  y: number;
  depth: number;
}

interface NetworkNodeProps {
  node: NetworkNode;
  position: NodePosition;
  isCentral: boolean;
  isSelected: boolean;
  color: string;
  Icon: LucideIcon;
  onClick?: (node: NetworkNode) => void;
}

export const NetworkNodeVisual = memo(function NetworkNodeVisual({
  node,
  position,
  isCentral,
  isSelected,
  color,
  Icon,
  onClick,
}: NetworkNodeProps) {
  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      className="group cursor-pointer transition-transform hover:scale-110"
      onClick={() => onClick?.(node)}
    >
      {/* Outer ring for selected/hovered */}
      <circle
        r={isCentral ? 32 : 22}
        fill="none"
        stroke={color}
        strokeWidth="3"
        className={isSelected ? 'opacity-50' : 'opacity-0 group-hover:opacity-50'}
      />

      {/* Node circle */}
      <circle
        r={isCentral ? 25 : 16}
        fill={color}
        className={isSelected ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'}
      />

      {/* Icon */}
      <foreignObject
        x={isCentral ? -12 : -8}
        y={isCentral ? -12 : -8}
        width={isCentral ? 24 : 16}
        height={isCentral ? 24 : 16}
      >
        <div className="flex items-center justify-center w-full h-full text-white">
          <Icon className={isCentral ? 'w-5 h-5' : 'w-3 h-3'} />
        </div>
      </foreignObject>

      {/* Label */}
      <text
        y={isCentral ? 40 : 28}
        textAnchor="middle"
        className="text-xs font-medium fill-[var(--app-text)]"
        style={{ pointerEvents: 'none' }}
      >
        {node.name.split(' ')[0]}
      </text>

      {/* Strength indicator */}
      {node.strength !== undefined && !isCentral && (
        <text
          y={38}
          textAnchor="middle"
          className="text-[10px] fill-[var(--app-text-muted)]"
          style={{ pointerEvents: 'none' }}
        >
          {node.strength}
        </text>
      )}
    </g>
  );
});
