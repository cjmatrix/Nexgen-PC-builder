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
    <div className="absolute left-6 top-6 w-72 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-2xl z-30 max-h-[calc(100%-3rem)]">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h3 className="text-white font-bold text-lg">Current Build</h3>
        <p className="text-xs text-gray-400">Your selection summary</p>
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
                isCurrent
                  ? "bg-blue-600/20 border-blue-500/30"
                  : "hover:bg-white/5"
              }`}
            >
              {/* Icon Status */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mr-3 transition-colors ${
                  isCompleted
                    ? "bg-green-500/20 text-green-500"
                    : isCurrent
                    ? "bg-blue-500/20 text-blue-500"
                    : "bg-gray-800 text-gray-500"
                }`}
              >
                {isCompleted ? <Check size={14} /> : <step.icon size={14} />}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      isCurrent ? "text-blue-400" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                  {part && (
                    <span className="text-xs text-green-400 font-mono">
                      ₹{(part.price / 100).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="text-sm truncate">
                  {part ? (
                    <span className="text-white">{part.name}</span>
                  ) : (
                    <span className="text-gray-600 italic">Not selected</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Total */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex justify-between items-end">
          <span className="text-gray-400 text-sm">Total Price</span>
          <span className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
            ₹{(totalPrice / 100).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComponentsList;
