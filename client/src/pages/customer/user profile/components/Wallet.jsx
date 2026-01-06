import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet as WalletIcon,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  AlertCircle,
} from "lucide-react";
import api from "../../../../api/axios";
import Pagination from "../../../../components/Pagination";

const Wallet = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["myWallet", page],
    queryFn: async () => {
      const response = await api.get("/wallet", {
        params: {
          page: page,
          limit: 10,
        },
      });
      return response.data.data;
    },
  });

  const TransactionIcon = ({ type }) => {
    if (type === "CREDIT") {
      return (
        <div className="p-2 bg-green-100 rounded-full text-green-600">
          <ArrowDownLeft className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="p-2 bg-red-100 rounded-full text-red-600">
        <ArrowUpRight className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wallet</h1>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <WalletIcon className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">
              Available Balance
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">
                ₹{((data?.balance || 0) / 100).toLocaleString()}
              </span>
              <span className="text-gray-400">INR</span>
            </div>
            <div className="mt-8 flex gap-4">
              <button className="bg-white text-gray-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Add Funds
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              Transaction History
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-gray-500">
              Loading transactions...
            </div>
          ) : isError ? (
            <div className="p-12 text-center text-red-500 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8" />
              <p>Failed to load wallet data.</p>
            </div>
          ) : data?.transactions?.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
              <Clock className="w-12 h-12 text-gray-300" />
              <p>No transactions found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Transaction Details</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.transactions.map((txn) => (
                    <tr
                      key={txn._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <TransactionIcon type={txn.type} />
                          <div>
                            <p className="font-medium text-gray-900">
                              {txn.description}
                            </p>
                            <p className="text-xs text-gray-500">{txn.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(txn.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {txn.orderId ? (
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {txn.orderId}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-bold ${
                          txn.type === "CREDIT"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {txn.type === "CREDIT" ? "+" : "-"}₹
                        {(txn.amount / 100).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!isLoading && data?.pagination && (
          <Pagination
            pagination={data.pagination}
            page={page}
            setPage={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default Wallet;
