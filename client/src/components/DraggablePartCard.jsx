import React, { useEffect } from "react";
import { useDrag } from "react-dnd";



function DraggablePartCard({handleSelect,selected,currentCategory,opt,setDraggedItem}) {

    const part = opt;
    const category=opt.category

  const [{ isDragging,draggedItem }, drag] = useDrag(() => ({
    type: "COMPONENT", // The "Key" that matches the Drop Zone
    item: { part, category }, // The data we send when dropped
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
      draggedItem: monitor.getItem()
    }),
  }));

  useEffect(()=>{
    setDraggedItem(draggedItem)
    
  },[draggedItem])



  return (
    <div 
    ref={drag}
      key={opt._id}
     
      className={`group p-4 rounded-xl border cursor-pointer w-full text-left transition-all duration-200 hover:scale-[1.02] ${
        selected[currentCategory]?._id === opt._id
          ? "bg-blue-600/10 border-blue-500 ring-1 ring-blue-500"
          : "bg-gray-800/50 border-gray-700 hover:border-gray-500 hover:bg-gray-800"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3
            className={`font-semibold ${
              selected[currentCategory]?._id === opt._id
                ? "text-blue-400"
                : "text-gray-200"
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
                    className="mr-2 inline-block bg-gray-700/50 px-1.5 py-0.5 rounded capitalize"
                  >
                    {k.replace(/([A-Z])/g, " $1").trim()}: {opt.specs[k]}
                  </span>
                ))}
          </div>
        </div>
        <div className="font-bold text-blue-300">
          ₹{(opt.price / 100).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default DraggablePartCard;
