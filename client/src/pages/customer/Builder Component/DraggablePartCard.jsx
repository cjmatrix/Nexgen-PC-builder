import React, { useEffect } from "react";
import { useDrag } from "react-dnd";

function DraggablePartCard({
  handleSelect,
  selected,
  currentCategory,
  opt,
  setDraggedItem,
}) {
  const part = opt;
  const category = opt.category;

  const [{ isDragging, draggedItem }, drag] = useDrag(() => ({
    type: "COMPONENT", // The "Key" that matches the Drop Zone
    item: { part, category }, // The data we send when dropped
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
      draggedItem: monitor.getItem(),
    }),
  }));

  useEffect(() => {
    setDraggedItem(draggedItem);
  }, [draggedItem]);

  return (
    <div
      ref={drag}
      key={opt._id}
      className={`group p-4 rounded-xl border cursor-pointer w-full text-left transition-all duration-300 transform hover:-translate-y-1 ${
        selected[currentCategory]?._id === opt._id
          ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10"
          : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3
            className={`font-semibold tracking-tight ${
              selected[currentCategory]?._id === opt._id
                ? "text-blue-700"
                : "text-gray-900 group-hover:text-blue-600 transition-colors"
            }`}
          >
            {opt.name}
          </h3>
          <div className="text-xs text-gray-500 mt-1">
            {opt.specs &&
              Object.keys(opt.specs)
                .slice(0, 2)
                .map((k) => (
                  <span
                    key={k}
                    className="mr-2 inline-block bg-gray-50 px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider text-gray-500 border border-gray-100/50"
                  >
                    {k.replace(/([A-Z])/g, " $1").trim()}: {opt.specs[k]}
                  </span>
                ))}
          </div>
        </div>
        <div className="text-right">
          
            <div className="font-bold text-gray-900 tabular-nums tracking-tight">
              ₹{(opt.price / 100).toLocaleString()}
            </div>
          
        </div>
      </div>
    </div>
  );
}

export default DraggablePartCard;
