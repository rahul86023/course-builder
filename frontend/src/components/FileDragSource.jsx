import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes';

const FileDragSource = ({ type, file, children }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes[type.toUpperCase()],
    item: { file, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}>
      {children}
    </div>
  );
};

export default FileDragSource;
