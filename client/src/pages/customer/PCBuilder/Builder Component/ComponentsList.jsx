import React from "react";
import { Check, X } from "lucide-react";

const ComponentsList = ({
  steps,
  selected,
  totalPrice,
  currentStep,
  setCurrentStep,
}) => {
  return (
    <div className="absolute left-6 top-6 w-72 bg-white/90 backdrop-blur-2xl border border-white/60 rounded-2xl overflow-hidden flex flex-col shadow-[0_20px_40px_rgba(0,0,0,0.1)] z-30 max-h-[calc(100%-3rem)] ring-1 ring-white/50">
     
      <div className="p-4 border-b border-gray-100/50 bg-linear-to-br from-white/80 to-white/40">
        <h3 className="text-gray-900 font-bold text-lg">Current Build</h3>
        <p className="text-xs text-gray-500">Your selection summary</p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {steps.map((step, idx) => {
          const part = selected[step.id];
          const isCurrent = currentStep === idx;
          const isCompleted = !!part;

          return (
            <div
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={`group flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 border border-transparent ${
                isCurrent ? "bg-blue-50 border-blue-200" : "hover:bg-white/50"
              }`}
            >
           
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mr-3 transition-colors ${
                  isCompleted
                    ? "bg-green-100 text-green-600"
                    : isCurrent
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {isCompleted ? <Check size={14} /> : <step.icon size={14} />}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isCurrent ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                  {part && (
                    <span className="text-xs text-green-600 font-mono">
                      ₹{(part.price / 100).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="text-sm truncate">
                  {part ? (
                    <span className="text-gray-900 font-medium">
                      {part.name}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Not selected</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

  
      <div className="p-4 border-t border-gray-100/50 bg-white/60 backdrop-blur-sm">
        <div className="flex justify-between items-end">
          <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">
            Total
          </span>
          <span className="text-xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 drop-shadow-sm">
            ₹{(totalPrice / 100).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComponentsList;
