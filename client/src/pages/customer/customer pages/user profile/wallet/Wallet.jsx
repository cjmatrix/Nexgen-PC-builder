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
import api from "../../../../../api/axios";
import Pagination from "../../../../../components/Pagination";

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
    <div className="animate-fade-up bg-gray-50/50 min-h-screen p-4 md:p-8 font-sans pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
            My Wallet
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            Manage your balance and transactions
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-linear-to-r from-gray-900 to-gray-800 rounded-2xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
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
              {false && (
                <button className="bg-white text-gray-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Add Funds
                </button>
              )}
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
            <div className="space-y-4">
              {data.transactions.map((txn) => (
                <div
                  key={txn._id}
                  className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <TransactionIcon type={txn.type} />
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">
                        {txn.description}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(txn.date).toLocaleDateString()}
                        </span>
                        {txn.orderId && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold">
                            Order #{txn.orderId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                    <span className="sm:hidden text-sm font-medium text-gray-500">
                      Amount
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        txn.type === "CREDIT"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {txn.type === "CREDIT" ? "+" : "-"}₹
                      {(txn.amount / 100).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
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
