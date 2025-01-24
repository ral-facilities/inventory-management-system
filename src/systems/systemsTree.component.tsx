import {
  Box,
  LinearProgress,
  Link as MuiLink,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  Background,
  ConnectionLineType,
  Controls,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetSystemsTree, type SystemTree } from '../api/systems';
import { getPageHeightCalc } from '../utils';
import SystemsNodeHeader from './systemsNodeHeader.component';

const nodeWidth = 250;
const nodeHeight = 250;

// Function to apply the Dagre layout
const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = 'TB'
) => {
  const isHorizontal = direction === 'LR';
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: node.width, height: node.height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // This is done to prevent overlapping nodes when a system only has one subsystem
    const sourceIds = edges.map((val) => val.source);
    const idCount = sourceIds.reduce(
      (acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const hasMoreThanOneChild = Object.values(idCount).some(
      (count) => count > 1
    );

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: isHorizontal
          ? nodeWithPosition.y
          : hasMoreThanOneChild
            ? nodeWithPosition.y
            : nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

interface SystemFlowProps {
  parentId?: string | null;
}

const SystemsTree: React.FC<SystemFlowProps> = () => {
  const { system_id: systemId } = useParams();
  const { data: systemsTree, isLoading } = useGetSystemsTree(systemId);

  const [layoutDirection, setLayoutDirection] = React.useState<'TB' | 'LR'>(
    'TB'
  );
  const [nodeDimensionsReady, setNodeDimensionsReady] = React.useState(false);

  const nodeDimensions = React.useRef<
    Record<string, { width: number; height: number }>
  >({});
  const totalNodes = React.useRef(0); // To keep track of the total nodes.

  const setNodeDimensions = React.useCallback(
    (nodeId: string, width: number, height: number) => {
      nodeDimensions.current[nodeId] = { width, height };
      if (Object.keys(nodeDimensions.current).length === totalNodes.current) {
        setNodeDimensionsReady(true); // Mark dimensions as ready when all are set.
      }
    },
    []
  );

  const xSpacing = 800;
  const ySpacing = 500;

  const [nodes, setNodes, _onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, _onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (systemsTree) {
      let systemIndex = 0;
      const transformToFlowData = (
        systems: SystemTree[],
        parentId?: string
      ): { nodes: Node[]; edges: Edge[] } => {
        let nodes: Node[] = [];
        let edges: Edge[] = [];

        systems.forEach((system, index) => {
          nodes.push({
            id: system.id ?? '',
            type: 'systems',
            data: {
              title:
                systemIndex === 0 ? (
                  system.name
                ) : (
                  <MuiLink component={Link} to={`/systems/${system.id}/tree`}>
                    {system.name}
                  </MuiLink>
                ),
              label: (
                <Box>
                  {/* Items Heading */}
                  <Typography variant="h6" sx={{ marginBottom: 1 }}>
                    Items:
                  </Typography>
                  {/* List of Catalogue Items */}
                  {system.catalogueItems.length > 0 ? (
                    system.catalogueItems.map((catalogueItem) => (
                      <Typography
                        key={catalogueItem.id}
                        variant="body2"
                        sx={{ marginBottom: 0.5 }}
                      >
                        {catalogueItem.name}: {catalogueItem.itemsQuantity}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ marginBottom: 0.5 }}>
                      No Items
                    </Typography>
                  )}
                </Box>
              ),
              direction: layoutDirection,
              setNodeDimensions,
              nodeId: system.id ?? '',
            },
            position: { x: index * xSpacing, y: index * ySpacing },
          });
          // only have the edges for nodes that connect to other nodes
          if (parentId && system.id !== parentId) {
            edges.push({
              id: `e-${parentId}-${system.id}`,
              source: parentId,
              target: system.id ?? '',
              type: 'smoothstep',
            });
          }

          // Handle subsystems recursively
          if (system.subsystems && system.subsystems.length > 0) {
            systemIndex++;
            const { nodes: childNodes, edges: childEdges } =
              transformToFlowData(system.subsystems, system.id);

            nodes = [...nodes, ...childNodes];
            edges = [...edges, ...childEdges];
          }
        });
        // Ensure unique nodes
        const uniqueNodes = Array.from(
          new Map(nodes.map((node) => [node.id, node])).values()
        );
        totalNodes.current = uniqueNodes.length;
        return { nodes: uniqueNodes, edges: edges };
      };

      const generateTreeWithRoot = (
        systems: SystemTree[]
      ): { nodes: Node[]; edges: Edge[] } => {
        const { nodes, edges } = transformToFlowData(
          systems,
          systemId || 'root'
        );
        return {
          nodes: [...nodes],
          edges,
        };
      };

      const { nodes: rawNodes, edges: rawEdges } =
        generateTreeWithRoot(systemsTree);

      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(
          rawNodes.map((node) => ({
            ...node,
            width: nodeDimensions.current[node.id]?.width || nodeWidth,
            height: nodeDimensions.current[node.id]?.height || nodeHeight,
          })),
          rawEdges,
          layoutDirection
        );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [
    systemsTree,
    layoutDirection,
    systemId,
    setNodes,
    setEdges,
    nodeDimensions,
    nodeDimensionsReady,
    setNodeDimensions,
  ]);

  const handleToggleLayout = (
    _event: React.MouseEvent<HTMLElement>,
    newDirection: 'TB' | 'LR'
  ) => {
    if (newDirection !== null) {
      setLayoutDirection(newDirection);
    }
  };

  if (isLoading) {
    return (
      <Box height={getPageHeightCalc('96px + 45px')}>
        <LinearProgress />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6">
            Taking time to gather data... This may take a couple of minutes.
          </Typography>
          <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
            Note: If this system is high up the tree with many subsystems and
            items, this process might take significantly longer.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: getPageHeightCalc('96px + 40px') }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        connectionLineType={ConnectionLineType.SmoothStep}
        nodeTypes={{ systems: SystemsNodeHeader }}
        fitView
      >
        <Panel position="top-right">
          <ToggleButtonGroup
            value={layoutDirection}
            exclusive
            onChange={handleToggleLayout}
            size="small"
          >
            <ToggleButton value="TB">Vertical</ToggleButton>
            <ToggleButton value="LR">Horizontal</ToggleButton>
          </ToggleButtonGroup>
        </Panel>
        <MiniMap />
        <Background />
        <Controls />
      </ReactFlow>
    </Box>
  );
};

export default SystemsTree;
