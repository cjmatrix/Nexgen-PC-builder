import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { TOAST_DURATION } from "../constants";

const CustomToast = ({
  message,
  closeToast,
  duration = TOAST_DURATION,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 w-full pr-2 relative overflow-hidden group hover:border-blue-300 transition-all pb-1 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <style>
        {`
          @keyframes shrink-progress {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>

      {/* Custom SVG PC Animation */}
      <div className="w-12 h-12 shrink-0 bg-blue-50/50 rounded-xl flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-all ">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-8 h-8 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* PC Case Outline */}
          <path
            d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V4C20 2.89543 19.1046 2 18 2H6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Side Window Panel */}
          <rect
            x="7"
            y="5"
            width="10"
            height="10"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          {/* Spinning Fan */}
          <g
            className="animate-[spin_3s_linear_infinite]"
            style={{ transformOrigin: "12px 10px" }}
          >
            <circle
              cx="12"
              cy="10"
              r="3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="2 4"
            />
            <path d="M12 10L12 7" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M12 10L14.5981 11.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M12 10L9.40192 11.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </g>
          {/* Power Button */}
          <circle
            cx="12"
            cy="18.5"
            r="1.5"
            fill="currentColor"
            className="animate-pulse text-green-500"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <h4 className="text-sm font-semibold text-gray-900 tracking-tight mb-0.5">
          System Update
        </h4>
        <p className="text-sm font-medium text-gray-600 leading-snug">
          {message}
        </p>
      </div>


      <button
        onClick={(e) => {
          e.stopPropagation();
          closeToast();
        }}
        className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 bg-transparent hover:bg-gray-100 rounded-full p-1 transition-colors"
      >
        <X size={14} />
      </button>

      {/* Progress Bar */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full group-hover:[animation-play-state:paused!important]"
        style={{
          animation: `shrink-progress ${duration}ms linear forwards`,
        }}
      />
    </div>
  );
};

export default CustomToast;
