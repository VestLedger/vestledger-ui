'use client';

import { useMemo } from 'react';
import { Card, Badge, Button } from '@/ui';
import { Network, Users, Building2, TrendingUp, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIKey } from '@/store/ui';

export interface NetworkNode {
  id: string;
  name: string;
  type: 'contact' | 'company' | 'investor' | 'advisor';
  strength?: number; // 0-100 relationship strength
  avatar?: string;
}

export interface NetworkConnection {
  from: string;
  to: string;
  type: 'introduced_by' | 'works_at' | 'invested_in' | 'advises' | 'knows';
  strength?: number; // 0-100 connection strength
  label?: string;
}

interface NetworkGraphProps {
  centralNode: NetworkNode;
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  onNodeClick?: (node: NetworkNode) => void;
  maxDepth?: number;
}

export function NetworkGraph({
  centralNode,
  nodes,
  connections,
  onNodeClick,
  maxDepth = 2
}: NetworkGraphProps) {
  const { value: ui, patch: patchUI } = useUIKey<{
    selectedNodeId: string | null;
    depth: number;
  }>(`network-graph:${centralNode.id}`, {
    selectedNodeId: null,
    depth: 1,
  });
  const { selectedNodeId, depth } = ui;

  // Calculate node positions in a radial layout
  const layout = useMemo(() => {
    const centerX = 300;
    const centerY = 250;
    const radius = 150;

    const positions: Record<string, { x: number; y: number; depth: number }> = {};

    // Central node at center
    positions[centralNode.id] = { x: centerX, y: centerY, depth: 0 };

    // Build adjacency map
    const adjacency = new Map<string, Set<string>>();
    connections.forEach(conn => {
      if (!adjacency.has(conn.from)) adjacency.set(conn.from, new Set());
      if (!adjacency.has(conn.to)) adjacency.set(conn.to, new Set());
      adjacency.get(conn.from)?.add(conn.to);
      adjacency.get(conn.to)?.add(conn.from);
    });

    // BFS to assign depths
    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = [{ id: centralNode.id, depth: 0 }];
    visited.add(centralNode.id);

    const depthGroups: Record<number, string[]> = { 0: [centralNode.id] };

    while (queue.length > 0) {
      const { id, depth: currentDepth } = queue.shift()!;
      if (currentDepth >= depth) continue;

      const neighbors = adjacency.get(id);
      if (!neighbors) continue;

      neighbors.forEach(neighborId => {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({ id: neighborId, depth: currentDepth + 1 });

          if (!depthGroups[currentDepth + 1]) {
            depthGroups[currentDepth + 1] = [];
          }
          depthGroups[currentDepth + 1].push(neighborId);
        }
      });
    }

    // Position nodes in concentric circles
    Object.entries(depthGroups).forEach(([depthStr, nodeIds]) => {
      const depthNum = parseInt(depthStr);
      if (depthNum === 0) return; // Already positioned

      const angleStep = (2 * Math.PI) / nodeIds.length;
      const depthRadius = radius * depthNum;

      nodeIds.forEach((nodeId, index) => {
        const angle = angleStep * index - Math.PI / 2; // Start from top
        positions[nodeId] = {
          x: centerX + depthRadius * Math.cos(angle),
          y: centerY + depthRadius * Math.sin(angle),
          depth: depthNum,
        };
      });
    });

    return positions;
  }, [centralNode.id, connections, depth]);

  const getNodeColor = (node: NetworkNode) => {
    switch (node.type) {
      case 'contact':
        return 'var(--app-primary)';
      case 'company':
        return 'var(--app-secondary)';
      case 'investor':
        return 'var(--app-success)';
      case 'advisor':
        return 'var(--app-warning)';
      default:
        return 'var(--app-text-muted)';
    }
  };

  const getNodeIcon = (type: NetworkNode['type']) => {
    switch (type) {
      case 'contact':
        return Users;
      case 'company':
        return Building2;
      case 'investor':
        return TrendingUp;
      case 'advisor':
        return Zap;
    }
  };

  const getConnectionColor = (strength?: number) => {
    if (!strength) return 'var(--app-border)';
    if (strength >= 70) return 'var(--app-success)';
    if (strength >= 40) return 'var(--app-warning)';
    return 'var(--app-text-muted)';
  };

  const getConnectionWidth = (strength?: number) => {
    if (!strength) return 1;
    if (strength >= 70) return 3;
    if (strength >= 40) return 2;
    return 1;
  };

  const visibleNodes = nodes.filter(node => layout[node.id]);
  const visibleConnections = connections.filter(conn =>
    layout[conn.from] && layout[conn.to]
  );

  const handleNodeClick = (node: NetworkNode) => {
    patchUI({ selectedNodeId: node.id });
    onNodeClick?.(node);
  };

  const introductionPaths = useMemo(() => {
    // Find warm introduction paths
    const paths: Array<{ target: NetworkNode; via: NetworkNode[]; strength: number }> = [];

    // Simple BFS to find paths
    visibleNodes.forEach(targetNode => {
      if (targetNode.id === centralNode.id) return;

      const queue: Array<{ nodeId: string; path: string[]; strength: number }> = [
        { nodeId: centralNode.id, path: [], strength: 100 }
      ];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const { nodeId, path, strength } = queue.shift()!;
        if (path.length >= 3) continue; // Max 2 intermediaries

        if (nodeId === targetNode.id && path.length > 0) {
          paths.push({
            target: targetNode,
            via: path.map(id => nodes.find(n => n.id === id)!).filter(Boolean),
            strength: strength,
          });
          break;
        }

        if (visited.has(nodeId)) continue;
        visited.add(nodeId);

        const nodeConnections = connections.filter(c => c.from === nodeId || c.to === nodeId);
        nodeConnections.forEach(conn => {
          const nextId = conn.from === nodeId ? conn.to : conn.from;
          const connStrength = conn.strength || 50;
          queue.push({
            nodeId: nextId,
            path: [...path, nodeId],
            strength: Math.min(strength, connStrength),
          });
        });
      }
    });

    return paths.sort((a, b) => b.strength - a.strength).slice(0, 5);
  }, [centralNode.id, nodes, connections, visibleNodes]);

  return (
    <div className="space-y-4">
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-[var(--app-primary)]" />
            <h3 className="text-lg font-semibold">Network Map</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="flat"
              isIconOnly
              isDisabled={depth <= 1}
              onPress={() => patchUI({ depth: Math.max(1, depth - 1) })}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)]">
              Depth: {depth}
            </Badge>
            <Button
              size="sm"
              variant="flat"
              isIconOnly
              isDisabled={depth >= maxDepth}
              onPress={() => patchUI({ depth: Math.min(maxDepth, depth + 1) })}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* SVG Graph */}
        <div className="relative bg-[var(--app-surface-hover)] rounded-lg overflow-hidden" style={{ height: '500px' }}>
          <svg width="100%" height="100%" viewBox="0 0 600 500">
            {/* Connections */}
            <g className="connections">
              {visibleConnections.map((conn, idx) => {
                const from = layout[conn.from];
                const to = layout[conn.to];
                if (!from || !to) return null;

                return (
                  <g key={`conn-${idx}`}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={getConnectionColor(conn.strength)}
                      strokeWidth={getConnectionWidth(conn.strength)}
                      strokeOpacity={0.6}
                      strokeDasharray={conn.type === 'introduced_by' ? '5,5' : undefined}
                    />
                  </g>
                );
              })}
            </g>

            {/* Nodes */}
            <g className="nodes">
              {visibleNodes.map(node => {
                const pos = layout[node.id];
                if (!pos) return null;

                const isCentral = node.id === centralNode.id;
                const isSelected = selectedNodeId === node.id;
                const Icon = getNodeIcon(node.type);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="group cursor-pointer transition-transform hover:scale-110"
                    onClick={() => handleNodeClick(node)}
                  >
                    {/* Outer ring for selected/hovered */}
                    <circle
                      r={isCentral ? 32 : 22}
                      fill="none"
                      stroke={getNodeColor(node)}
                      strokeWidth="3"
                      className={isSelected ? 'opacity-50' : 'opacity-0 group-hover:opacity-50'}
                    />

                    {/* Node circle */}
                    <circle
                      r={isCentral ? 25 : 16}
                      fill={getNodeColor(node)}
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
              })}
            </g>
          </svg>

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-[var(--app-surface)] rounded-lg p-3 shadow-lg border border-[var(--app-border)]">
            <p className="text-xs font-medium mb-2">Node Types</p>
            <div className="space-y-1">
              {[
                { type: 'contact' as const, label: 'Contact' },
                { type: 'company' as const, label: 'Company' },
                { type: 'investor' as const, label: 'Investor' },
                { type: 'advisor' as const, label: 'Advisor' },
              ].map(({ type, label }) => {
                const Icon = getNodeIcon(type);
                return (
                  <div key={type} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: getNodeColor({ type } as NetworkNode) }}
                    >
                      <Icon className="w-2 h-2 text-white" />
                    </div>
                    <span className="text-[10px]">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-lg bg-[var(--app-surface-hover)] text-center">
            <p className="text-2xl font-bold text-[var(--app-primary)]">{visibleNodes.length}</p>
            <p className="text-xs text-[var(--app-text-muted)]">Connections</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-surface-hover)] text-center">
            <p className="text-2xl font-bold text-[var(--app-success)]">{visibleConnections.length}</p>
            <p className="text-xs text-[var(--app-text-muted)]">Relationships</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--app-surface-hover)] text-center">
            <p className="text-2xl font-bold text-[var(--app-warning)]">{introductionPaths.length}</p>
            <p className="text-xs text-[var(--app-text-muted)]">Intro Paths</p>
          </div>
        </div>
      </Card>

      {/* Warm Introduction Paths */}
      {introductionPaths.length > 0 && (
        <Card padding="md">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--app-warning)]" />
            Warm Introduction Paths
          </h4>
          <div className="space-y-2">
            {introductionPaths.map((path, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[var(--app-surface-hover)] hover:bg-[var(--app-primary-bg)] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{path.target.name}</span>
                  <Badge
                    size="sm"
                    variant="flat"
                    className={
                      path.strength >= 70
                        ? 'bg-[var(--app-success-bg)] text-[var(--app-success)]'
                        : path.strength >= 40
                        ? 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]'
                        : 'bg-[var(--app-text-muted)]/10 text-[var(--app-text-muted)]'
                    }
                  >
                    {path.strength}% strength
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-[var(--app-text-muted)]">
                  <span>Via:</span>
                  {path.via.map((node, i) => (
                    <span key={node.id}>
                      {i > 0 && <span className="mx-1">→</span>}
                      <span className="font-medium text-[var(--app-primary)]">{node.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
