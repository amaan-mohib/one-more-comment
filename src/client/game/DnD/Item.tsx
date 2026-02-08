import { forwardRef } from 'react';

// interface ItemProps {
//   id: string;
//   itemStyle?: React.CSSProperties;
// }

const Item = forwardRef(({ id, ...props }: any, ref) => {
  return (
    <div
      {...props}
      ref={ref as any}
      className="px-3 py-1 bg-primary text-white border-3 border-primary font-bold text-sm select-none"
      style={props.itemStyle || {}}
    >
      {props.children}
    </div>
  );
});

export default Item;
