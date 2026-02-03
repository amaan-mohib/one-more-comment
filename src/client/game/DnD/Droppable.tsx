import React, { PropsWithChildren } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableProps {}

const Droppable: React.FC<DroppableProps & PropsWithChildren> = (props) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'droppable',
  });
  const style = {
    color: isOver ? 'green' : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
};

export default Droppable;
