import React from 'react'
import { useDispatch } from 'react-redux'

function Pagination({totalCount,setPage}) {


    const dispatch=useDispatch();
    
    const buttonList=[]
    
    for(let i=1;i<=totalCount;i++){

        buttonList.push(i)
    }
    
  return (
    <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-end gap-2">
          <button className="text-gray-500 hover:text-gray-700 text-sm font-medium px-2">
            Previous
          </button>

          <div className="flex gap-1">
            {
                buttonList.map(page=>(
                     <button key={page} className="w-8 h-8 flex items-center justify-center rounded text-sm text-gray-600 hover:bg-gray-100"
                        onClick={()=>dispatch(setPage(page))}
                     >
                        {page}
                    </button>
                ))
            }
           
          </div>

          <button className="text-gray-500 hover:text-gray-700 text-sm font-medium px-2">
            Next
          </button>
        </div>
  )
}

export default Pagination