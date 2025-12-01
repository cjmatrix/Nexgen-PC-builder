import React, { useState } from "react";

import { blockUser } from "../store/slices/userSlice";
import { useDispatch } from "react-redux";
import { FaBan, FaCheck, FaTrash } from "react-icons/fa";
import { updateUser } from "../store/slices/userSlice";
import { Edit,Trash2 ,UserLock,LockOpen,Lock} from "lucide-react";

function UsersList({ user }) {
  const dispatch = useDispatch();
  const [role, setRole] = useState("");

  const handleBlock = (id, status) => {
    if (
      window.confirm(
        `Are you sure you want to ${
          status === "active" ? "suspend" : "activate"
        } this user?`
      )
    ) {
      dispatch(blockUser(id));
    }
  };

  console.log(user.role);
  const handleRoleChange = (id, role) => {
    console.log(role);
    const updateObj = { role };

    dispatch(updateUser({ id, updateObj }));
  };

  return (
    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button className="text-gray-900 hover:text-blue-600 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-500 hover:text-red-700 transition-colors" onClick={()=>handleBlock(user._id,user.status)}>
                        {user.status==='active'?< Lock className="h-4 w-4" />: <LockOpen className="h-4 w-4"></LockOpen>}
                      </button>
                    </div>
                  </td>
                </tr>
  )
}

export default UsersList;
