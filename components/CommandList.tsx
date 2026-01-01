import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

export default forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[200px] p-1 z-50">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            key={index}
            className={`flex items-center w-full px-2 py-2 text-sm rounded-md transition-colors text-left ${
              index === selectedIndex ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => selectItem(index)}
          >
            <span className="mr-3 opacity-70 flex items-center justify-center w-5 h-5">{item.icon}</span>
            <span className="font-medium">{item.title}</span>
          </button>
        ))
      ) : (
        <div className="px-2 py-2 text-sm text-gray-400">No results</div>
      )}
    </div>
  );
});