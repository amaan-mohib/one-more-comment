import React, { PropsWithChildren } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableProps {
  darkMode?: boolean;
}

const Droppable: React.FC<DroppableProps & PropsWithChildren> = (props) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'droppable',
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-20 bg-card border-4 border-dashed ${isOver ? 'border-secondary' : 'border-primary'} flex items-center justify-center rounded-none flex-wrap gap-2 p-3`}
      style={{
        boxShadow: props.darkMode
          ? '4px 4px 0px rgba(255, 255, 255, 0.2)'
          : '4px 4px 0px rgba(167, 139, 250, 0.3)',
      }}
    >
      {props.children}
    </div>
  );
};

export default Droppable;
