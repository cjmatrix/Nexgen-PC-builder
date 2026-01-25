import React, { useState } from "react";
import { Share2, Copy, Check, Gift } from "lucide-react";
import api from "../../../../../api/axios";

const Referral = () => {
  const [referralLink, setReferralLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const generateLink = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/referral/generate");
      setReferralLink(data.referralLink);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to generate referral link",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-up bg-gray-50/50 min-h-screen p-4 md:p-8 font-sans pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
            Referrals
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            Invite friends and earn rewards
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Refer & Earn</h2>
              <p className="text-gray-500 text-sm">
                Invite friends and earn rewards just for you!
              </p>
            </div>
          </div>

          <div className="bg-linear-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
              <Gift className="w-64 h-64" />
            </div>

            <div className="relative z-10 max-w-lg">
              <h3 className="text-2xl font-bold mb-4">Give ₹500, Get ₹500!</h3>
              <p className="mb-6 text-gray-400">
                Share your unique referral link with friends. When they sign up
                and make their first purchase (min ₹2000), you both get a flat
                ₹500 discount coupon!
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            {!referralLink ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-gray-900 font-medium mb-2">
                  Get Your Unique Link
                </h4>
                <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                  Generate your personal referral link to start sharing rewards
                  with your friends.
                </p>
                <button
                  onClick={generateLink}
                  disabled={loading}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate Referral Link"}
                </button>
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Referral Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-600 focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                      copied
                        ? "bg-green-500 text-white"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Share this link on social media, email, or chat!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referral;
