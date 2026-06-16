import { useCallback, useMemo } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeProps,
  MarkerType,
  Position,
  Handle,
} from 'reactflow'
import 'reactflow/dist/style.css'
import dagre from 'dagre'

const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction = 'TB'
) {
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 60 })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const pos = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: pos.x - 90,
        y: pos.y - 30,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

interface StateNodeData {
  label: string
  type: string
  isCurrent?: boolean
}

function StateNode({ data }: NodeProps<StateNodeData>) {
  const borderColor =
    data.type === 'Initial'
      ? 'border-green-500'
      : data.type === 'Final'
        ? 'border-blue-500'
        : data.type === 'Terminal'
          ? 'border-red-500'
          : 'border-gray-300'

  return (
    <div
      className={`px-4 py-2 rounded-lg border-2 ${borderColor} bg-white shadow-sm ${
        data.isCurrent ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="text-sm font-medium text-gray-900">{data.label}</div>
      <div className="text-xs text-gray-500 mt-0.5">{data.type}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const nodeTypes = { stateNode: StateNode }

interface StateMachineDiagramProps {
  states: { name: string; label: string; type: string }[]
  transitions: { fromState: string; toState: string; trigger: string; label?: string }[]
  currentState?: string
  className?: string
  height?: number
  readonly?: boolean
}

export default function StateMachineDiagram({
  states,
  transitions,
  currentState,
  className = '',
  height = 400,
}: StateMachineDiagramProps) {
  const initialNodes: Node[] = useMemo(
    () =>
      states.map((s) => ({
        id: s.name,
        type: 'stateNode',
        data: {
          label: s.label,
          type: s.type,
          isCurrent: s.name === currentState,
        },
        position: { x: 0, y: 0 },
      })),
    [states, currentState]
  )

  const initialEdges: Edge[] = useMemo(
    () =>
      transitions.map((t, i) => ({
        id: `e-${i}`,
        source: t.fromState,
        target: t.toState,
        label: t.label || t.trigger,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#6366f1', strokeWidth: 2 },
        labelStyle: { fill: '#6366f1', fontWeight: 500, fontSize: 11 },
      })),
    [transitions]
  )

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    [initialNodes, initialEdges]
  )

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes)
  const [edges, , onEdgesChange] = useEdgesState(layoutedEdges)

  return (
    <div className={`border rounded-lg ${className}`} style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <Background gap={16} size={1} />
        <MiniMap
          nodeStrokeColor="#6366f1"
          nodeColor={(n) => {
            const d = n.data as StateNodeData
            return d.type === 'Initial'
              ? '#22c55e'
              : d.type === 'Final'
                ? '#3b82f6'
                : d.type === 'Terminal'
                  ? '#ef4444'
                  : '#e5e7eb'
          }}
          maskColor="rgba(0,0,0,0.1)"
        />
      </ReactFlow>
    </div>
  )
}

export { StateNode }
