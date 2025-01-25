import dagre from '@dagrejs/dagre';
import {
  Box,
  LinearProgress,
  Link as MuiLink,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Background,
  ConnectionLineType,
  Controls,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStore,
  type Edge,
  type InternalNode,
  type Node,
  type ReactFlowState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { NodeLookup } from '@xyflow/system';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetSystemsTree, type SystemTree } from '../api/systems';
import { getPageHeightCalc } from '../utils';
import SystemsNodeHeader from './systemsNodeHeader.component';

interface SystemFlowProps {
  rawEdges: Edge[];
  rawNodes: Node[];
  layoutDirection: 'TB' | 'LR';
  handleToggleLayout: (
    _event: React.MouseEvent<HTMLElement>,
    newDirection: 'TB' | 'LR'
  ) => void;
}

const nodeWidth = 300;
const nodeHeight = 250;

const calculateRanksep = (nodes: Node[]): number => {
  const maxHeight = Math.max(...nodes.map((node) => node.height || nodeHeight));
  return maxHeight; // Add extra space to avoid overlap
};

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = 'TB',
  nodeInternals: NodeLookup<InternalNode<Node>>
) => {
  const isHorizontal = direction === 'LR';

  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 50,
    ranksep: isHorizontal ? 150 : calculateRanksep(nodes),
  });

  nodes.forEach((node) => {
    const nodeInternal = nodeInternals.get(node.id);
    dagreGraph.setNode(node.id, {
      width: nodeWidth,
      height: nodeInternal?.measured.height || nodeHeight,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // This prevents overlapping nodes when a system has only one subsystem
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
          ? hasMoreThanOneChild
            ? nodeWithPosition.y
            : nodeWithPosition.y - nodeWithPosition.height / 2
          : hasMoreThanOneChild
            ? nodeWithPosition.y
            : nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const SystemsFlow = (props: SystemFlowProps) => {
  const { rawEdges, rawNodes, layoutDirection, handleToggleLayout } = props;

  const [nodes, setNodes, _onNodesChange] = useNodesState<Node>(rawNodes);
  const [edges, setEdges, _onEdgesChange] = useEdgesState<Edge>(rawEdges);
  const { fitView } = useReactFlow();
  const theme = useTheme();

  const nodeInternals = useStore((state: ReactFlowState) => state.nodeLookup);

  const flattenedNodes = Array.from(nodeInternals.values());

  const [firstNodeHeight, setFirstNodeHeight] = React.useState<
    number | undefined
  >(flattenedNodes[0]?.measured?.height);

  // Triggers a refresh for the Layout when the nodes have been measured
  React.useEffect(() => {
    if (flattenedNodes[0]?.measured?.height) {
      setFirstNodeHeight(flattenedNodes[0]?.measured?.height);
    }
  }, [flattenedNodes]);

  // Sets the new node edges positions using dagre layouting
  React.useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      rawNodes,
      rawEdges,
      layoutDirection,
      nodeInternals
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [
    layoutDirection,
    nodeInternals,
    rawEdges,
    rawNodes,
    setEdges,
    setNodes,
    firstNodeHeight,
  ]);

  React.useEffect(() => {
    window.requestAnimationFrame(() => fitView());
  }, [fitView, layoutDirection, nodes]);
  return (
    <Box sx={{ width: '100%', height: getPageHeightCalc('96px + 40px') }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        colorMode={theme.palette.mode}
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

const SystemsTree = () => {
  const { system_id: systemId } = useParams();
  const { data: systemsTree, isLoading } = useGetSystemsTree(systemId);

  const [layoutDirection, setLayoutDirection] = React.useState<'TB' | 'LR'>(
    'TB'
  );

  let systemIndex = 0;
  const transformToFlowData = React.useCallback(
    (
      systems: SystemTree[],
      parentId?: string
    ): { nodes: Node[]; edges: Edge[] } => {
      let nodes: Node[] = [];
      let edges: Edge[] = [];

      systems.forEach((system) => {
        nodes.push({
          id: system.id ?? '',
          type: 'systems',
          style: { width: '300px' },
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
            id: system.id ?? '',
          },
          // position will be set by dagre
          position: { x: 0, y: 0 },
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
          const { nodes: childNodes, edges: childEdges } = transformToFlowData(
            system.subsystems,
            system.id
          );

          nodes = [...nodes, ...childNodes];
          edges = [...edges, ...childEdges];
        }
      });
      // Ensure unique nodes
      const uniqueNodes = Array.from(
        new Map(nodes.map((node) => [node.id, node])).values()
      );
      return { nodes: uniqueNodes, edges: edges };
    },
    [layoutDirection, systemIndex]
  );

  const handleToggleLayout = (
    _event: React.MouseEvent<HTMLElement>,
    newDirection: 'TB' | 'LR'
  ) => {
    if (newDirection !== null) {
      setLayoutDirection(newDirection);
    }
  };

  if (isLoading || !systemsTree) {
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

  const { nodes: rawNodes, edges: rawEdges } = transformToFlowData(
    systemsTree,
    systemId
  );
  return (
    <ReactFlowProvider>
      <SystemsFlow
        rawEdges={rawEdges}
        rawNodes={rawNodes}
        handleToggleLayout={handleToggleLayout}
        layoutDirection={layoutDirection}
      />
    </ReactFlowProvider>
  );
};

export default SystemsTree;
