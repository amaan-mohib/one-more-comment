import React, { PropsWithChildren } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Item from './Item';

interface SortableItemProps {
  id: string;
  className?: string;
  itemStyle?: React.CSSProperties;
}

const SortableItem: React.FC<SortableItemProps & PropsWithChildren> = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.id,
  });

  const style = {
    ...props.itemStyle,
    transform: CSS.Transform.toString({
      scaleX: 1,
      scaleY: 1,
      x: transform?.x || 0,
      y: transform?.y || 0,
    }),
    transition,
  };

  return (
    <Item ref={setNodeRef} id={props.id} itemStyle={style} {...attributes} {...listeners}>
      {props.children}
    </Item>
  );
};

export default SortableItem;
