import React from "react";
import { Plus, ChevronRight } from "lucide-react";

const AddressSelection = ({
  addresses,
  selectedAddress,
  setSelectedAddress,
  setIsAddressModalOpen,
  onContinue,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Select Shipping Address
        </h2>
        <button
          onClick={() => setIsAddressModalOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <Plus className="h-4 w-4" /> Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses?.map((addr) => {
          return (
            <div
              key={addr._id}
              onClick={() => setSelectedAddress(addr)}
              className={`cursor-pointer border rounded-xl p-4 transition-all ${
                selectedAddress?._id === addr._id
                  ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-900">{addr.fullName}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                  {addr.type}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p>{addr.street}</p>
                <p>
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p>{addr.country}</p>
                <p className="mt-2 text-gray-500">{addr.phone}</p>
              </div>
            </div>
          );
        })}

        {(!addresses || addresses.length === 0) && (
          <div className="col-span-full py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-2">No addresses saved.</p>
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="text-blue-600 font-medium hover:underline"
            >
              Add your first address
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={onContinue}
          disabled={!selectedAddress}
          className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Continue to Summary <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AddressSelection;
