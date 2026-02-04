import React from "react";

const PartSkeleton = () => {
  return (
    <div className="p-4 rounded-xl border border-gray-100 bg-white w-full relative overflow-hidden animate-pulse">
      <div className="flex justify-between items-start relative z-10">
        <div className="w-2/3 space-y-3">
          {/* Title Skeleton */}
          <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>

          {/* Specs Skeleton */}
          <div className="flex gap-2">
            <div className="h-4 bg-gray-100 rounded-md w-20"></div>
            <div className="h-4 bg-gray-100 rounded-md w-16"></div>
          </div>
        </div>

        {/* Price Skeleton */}
        <div className="w-1/4 flex flex-col items-end gap-2">
          <div className="h-6 bg-gray-200 rounded-md w-20"></div>
          {/* Mobile Button Skeleton */}
          <div className="md:hidden h-6 bg-gray-100 rounded-md w-16"></div>
        </div>
      </div>
    </div>
  );
};

export default PartSkeleton;
