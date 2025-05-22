import dagre from '@dagrejs/dagre';
import { Warning } from '@mui/icons-material';
import {
  Box,
  IconButton,
  LinearProgress,
  Link as MuiLink,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Background,
  ConnectionLineType,
  Controls,
  MiniMap,
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
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useGetSystemsTree, type SystemTree } from '../api/systems';
import { getPageHeightCalc } from '../utils';
import SystemsNodeHeader from './systemsNodeHeader.component';

type LayoutDirectionType = 'TB' | 'LR';
type MaxDepthType = -1 | 1 | 2 | 3;
const DEFAULT_LAYOUT_DIRECTION: LayoutDirectionType = 'TB';
const DEFAULT_MAX_DEPTH: MaxDepthType = 1;
const LAYOUT_DIRECTION_STATE = 'layoutDirection';
const MAX_DEPTH_STATE = 'maxDepth';
const MAX_SUBSYSTEMS = 100;
const SUBSYSTEMS_CUT_OFF = 75;

interface SystemFlowProps {
  rawEdges: Edge[];
  rawNodes: Node[];
  layoutDirection: LayoutDirectionType;
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
    nodesep: isHorizontal ? calculateRanksep(nodes) : 50,
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
          ? nodeWithPosition.y - nodeWithPosition.height / 2
          : hasMoreThanOneChild
            ? nodeWithPosition.y
            : nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const SystemsFlow = (props: SystemFlowProps) => {
  const { rawEdges, rawNodes, layoutDirection } = props;

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
  }, [fitView, nodes]);
  return (
    <Box
      sx={{ width: '100%', height: getPageHeightCalc('96px + 40px + 30px') }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        colorMode={theme.palette.mode}
        connectionLineType={ConnectionLineType.SmoothStep}
        nodeTypes={{ systems: SystemsNodeHeader }}
        fitView
      >
        <MiniMap />
        <Background />
        <Controls />
      </ReactFlow>
    </Box>
  );
};

const SystemsTree = () => {
  const { system_id: systemId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const layoutDirection = React.useMemo(
    () =>
      (searchParams.get(LAYOUT_DIRECTION_STATE) as LayoutDirectionType) ||
      DEFAULT_LAYOUT_DIRECTION,
    [searchParams]
  );

  const maxDepth = React.useMemo(
    () =>
      (Number(searchParams.get(MAX_DEPTH_STATE)) ||
        DEFAULT_MAX_DEPTH) as MaxDepthType,
    [searchParams]
  );

  const {
    data: systemsTree,
    isLoading,
    error,
  } = useGetSystemsTree(
    systemId,
    maxDepth === -1 ? undefined : maxDepth,
    SUBSYSTEMS_CUT_OFF,
    MAX_SUBSYSTEMS
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
            title: (
              <MuiLink
                component={Link}
                to={
                  system.id === 'root'
                    ? `/systems/tree`
                    : `/systems/${system.id}/tree`
                }
              >
                {system.name}
              </MuiLink>
            ),
            label:
              system.id === 'root' ? undefined : (
                <Box>
                  {/* Items Heading */}
                  <Typography variant="h6" sx={{ marginBottom: 1 }}>
                    Items:
                  </Typography>
                  {/* List of Catalogue Items */}
                  {system.catalogueItems.length > 0 ? (
                    system.catalogueItems.map((catalogueItem) => (
                      <Typography
                        key={`${catalogueItem.id}-${system.id}`}
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
            system: system,
            direction: layoutDirection,
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

  const handleToggleLayout = React.useCallback(
    (
      _event: React.MouseEvent<HTMLElement>,
      newDirection: LayoutDirectionType
    ) => {
      if (newDirection !== null) {
        if (newDirection === DEFAULT_LAYOUT_DIRECTION) {
          searchParams.delete(LAYOUT_DIRECTION_STATE);
        } else {
          searchParams.set(LAYOUT_DIRECTION_STATE, newDirection);
        }
        setSearchParams(searchParams, { replace: false });
      }
    },
    [searchParams, setSearchParams]
  );

  const handleToggleMaxDepth = React.useCallback(
    (_event: React.MouseEvent<HTMLElement>, newDepth: MaxDepthType) => {
      if (newDepth !== null) {
        if (newDepth === DEFAULT_MAX_DEPTH) {
          searchParams.delete(MAX_DEPTH_STATE);
        } else {
          searchParams.set(MAX_DEPTH_STATE, newDepth.toString());
        }
        setSearchParams(searchParams, { replace: false });
      }
    },
    [searchParams, setSearchParams]
  );
  const isLimitedReached =
    error?.message?.includes('exceeded the maximum allowed limit') ?? false;

  const { nodes: rawNodes, edges: rawEdges } = transformToFlowData(
    systemsTree ?? [],
    systemId
  );
  return (
    <ReactFlowProvider>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          px: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography color="text.secondary" variant="h6" mr={1}>
            Depth:
          </Typography>

          <ToggleButtonGroup
            value={maxDepth}
            exclusive
            onChange={handleToggleMaxDepth}
            size="small"
          >
            <ToggleButton value={1}>1</ToggleButton>
            <ToggleButton value={2}>2</ToggleButton>
            <ToggleButton value={3}>3</ToggleButton>
            <ToggleButton value={-1}>unlimited</ToggleButton>
          </ToggleButtonGroup>

          <Tooltip
            sx={{ ml: 1 }}
            aria-label={`Systems tree warning message`}
            title={
              <Typography variant="body2" color="warning" sx={{ mt: 1 }}>
                The larger the depth, the longer the query may take. If the
                number of subsystems exceeds {MAX_SUBSYSTEMS}, the tree will not
                load.
              </Typography>
            }
            placement="right"
            enterTouchDelay={0}
          >
            <IconButton size="small">
              <Warning />
            </IconButton>
          </Tooltip>
        </Box>

        <ToggleButtonGroup
          value={layoutDirection}
          exclusive
          onChange={handleToggleLayout}
          size="small"
        >
          <ToggleButton value="TB">Vertical</ToggleButton>
          <ToggleButton value="LR">Horizontal</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {isLoading || !systemsTree ? (
        <Box pt={1} height={getPageHeightCalc('96px + 45px')}>
          {!isLimitedReached && <LinearProgress />}
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
            {!isLimitedReached ? (
              <>
                <Typography variant="h6">
                  Taking time to gather data... This may take a couple of
                  minutes.
                </Typography>
                <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
                  Note: If this system is high up the tree with many subsystems
                  and items, this process might take significantly longer.
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h6" color="error.main" sx={{ mt: 2 }}>
                  The maximum number of subsystems has been reached.
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  To view more data, consider decreasing the depth of the tree,
                  navigating down to a subtree with fewer subsystems, or try
                  looking at the normal view for more limited results.
                </Typography>
              </>
            )}
          </Box>
        </Box>
      ) : (
        <SystemsFlow
          // Need to unmount when the maxDepth has been changed to fitView correctly
          key={maxDepth}
          rawEdges={rawEdges}
          rawNodes={rawNodes}
          layoutDirection={layoutDirection}
        />
      )}
    </ReactFlowProvider>
  );
};

export default SystemsTree;
