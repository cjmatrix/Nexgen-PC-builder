import React from 'react'
import { useDispatch } from 'react-redux'

function Pagination({pagination,page,setPage}) {

  const dispatch=useDispatch();
   
    
  return (
   <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 font-medium">
            Page {pagination?.page} of {pagination?.totalPages}
          </span>
          <button
            disabled={page === pagination?.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
  )
}

export default Pagination