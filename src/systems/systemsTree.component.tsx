import {
  Box,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  Background,
  ConnectionLineType,
  Controls,
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
import { useParams } from 'react-router-dom';
import {
  useGetSystem,
  useGetSystemsTree,
  type SystemTree,
} from '../api/systems';
import { getPageHeightCalc } from '../utils';

const nodeWidth = 172;
const nodeHeight = 36;

// Function to apply the Dagre layout
const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = 'TB'
) => {
  const isHorizontal = direction === 'LR';
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
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
  const { data: rootSystem } = useGetSystem(systemId);

  const [layoutDirection, setLayoutDirection] = React.useState<'TB' | 'LR'>(
    'TB'
  );

  const xSpacing = 300;
  const ySpacing = 200;

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (systemsTree) {
      const transformToFlowData = (
        systems: SystemTree[],
        parentId?: string
      ): { nodes: Node[]; edges: Edge[] } => {
        let nodes: Node[] = [];
        let edges: Edge[] = [];

        systems.forEach((system, index) => {
          nodes.push({
            id: system.id,
            data: { label: system.name },
            position: { x: index * xSpacing, y: index * ySpacing },
          });

          if (parentId) {
            edges.push({
              id: `e-${parentId}-${system.id}`,
              source: parentId,
              target: system.id,
              type: 'smoothstep',
            });
          }

          if (system.subsystems && system.subsystems.length > 0) {
            const { nodes: childNodes, edges: childEdges } =
              transformToFlowData(system.subsystems, system.id);
            nodes = [...nodes, ...childNodes];
            edges = [...edges, ...childEdges];
          }
        });

        return { nodes, edges };
      };

      const generateTreeWithRoot = (
        systems: SystemTree[]
      ): { nodes: Node[]; edges: Edge[] } => {
        const rootNode = {
          id: systemId || 'root',
          data: { label: rootSystem?.name || 'Root' },
          position: { x: (xSpacing * systems.length) / 2, y: 0 },
        };

        const { nodes, edges } = transformToFlowData(
          systems,
          systemId || 'root'
        );
        return {
          nodes: [rootNode, ...nodes],
          edges,
        };
      };

      const { nodes: rawNodes, edges: rawEdges } =
        generateTreeWithRoot(systemsTree);

      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(rawNodes, rawEdges, layoutDirection);

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [
    systemsTree,
    layoutDirection,
    systemId,
    setNodes,
    setEdges,
    rootSystem?.name,
  ]);

  console.log(nodes);

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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionLineType={ConnectionLineType.SmoothStep}
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
        <Background />
        <Controls />
      </ReactFlow>
    </Box>
  );
};

export default SystemsTree;
