import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import React, { useState } from 'react';
import SortableItem from './SortableItem';
import Item from './Item';

interface SortableProps {
  items: string[];
  setItems: (newItems: string[]) => void;
  itemStyle?: React.CSSProperties;
}

const Sortable: React.FC<SortableProps> = (props) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => {
        setActiveId(active.id as string);
      }}
      onDragEnd={(event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
          const oldIndex = props.items.indexOf(active.id as string);
          const newIndex = props.items.indexOf(over?.id as string);

          props.setItems(arrayMove(props.items, oldIndex, newIndex));
        }
        setActiveId(null);
      }}
    >
      <SortableContext items={props.items} strategy={rectSortingStrategy}>
        {props.items.map((token, index) => (
          <SortableItem id={token} key={index} itemStyle={props.itemStyle || {}}>
            {token}
          </SortableItem>
        ))}
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <Item id={activeId} itemStyle={props.itemStyle || {}}>
            {activeId}
          </Item>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default Sortable;
