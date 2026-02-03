import { useDraggable } from '@dnd-kit/core';
import React, { PropsWithChildren } from 'react';

interface DraggableProps {
  id: string;
  className?: string;
  style?: React.CSSProperties;
}

const Draggable: React.FC<DraggableProps & PropsWithChildren> = (props) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.id,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        ...props.style,
      }
    : props.style;
  return (
    <button
      ref={setNodeRef}
      className={props.className}
      style={style}
      {...listeners}
      {...attributes}
    >
      {props.children}
    </button>
  );
};

export default Draggable;
