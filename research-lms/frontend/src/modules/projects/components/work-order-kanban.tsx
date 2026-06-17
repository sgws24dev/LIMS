import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { WorkOrderCard } from './work-order-card'
import type { WorkOrderDto, WorkOrderStatus } from '@/services/api/projects'

const COLUMNS: { key: WorkOrderStatus; label: string; color: string }[] = [
  { key: 'Open', label: 'Open', color: 'bg-blue-500' },
  { key: 'InProgress', label: 'In Progress', color: 'bg-amber-500' },
  { key: 'Completed', label: 'Completed', color: 'bg-green-500' },
  { key: 'Cancelled', label: 'Cancelled', color: 'bg-red-500' },
]

interface WorkOrderKanbanProps {
  workOrders: WorkOrderDto[]
  onStatusChange: (id: string, newStatus: WorkOrderStatus) => void
  onCardClick: (id: string) => void
  isUpdating?: boolean
}

export function WorkOrderKanban({ workOrders, onStatusChange, onCardClick, isUpdating }: WorkOrderKanbanProps) {
  const [localOrders, setLocalOrders] = useState(workOrders)

  const getColumnOrders = (status: WorkOrderStatus) => localOrders.filter((w) => w.status === status)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const { draggableId, source, destination } = result
    if (source.droppableId === destination.droppableId) return

    const newStatus = destination.droppableId as WorkOrderStatus

    setLocalOrders((prev) =>
      prev.map((w) => (w.id === draggableId ? { ...w, status: newStatus } : w))
    )
    onStatusChange(draggableId, newStatus)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = getColumnOrders(col.key)
          return (
            <div key={col.key} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{col.label}</h3>
                <span className="text-xs text-gray-400 ml-auto">{items.length}</span>
              </div>
              <Droppable droppableId={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] space-y-2 ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20 rounded-md' : ''}`}
                  >
                    {items.map((wo, index) => (
                      <Draggable key={wo.id} draggableId={wo.id} index={index} isDragDisabled={isUpdating}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style as React.CSSProperties}
                            className={snapshot.isDragging ? 'rotate-2 shadow-lg' : ''}
                          >
                            <WorkOrderCard workOrder={wo} onClick={() => onCardClick(wo.id)} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
