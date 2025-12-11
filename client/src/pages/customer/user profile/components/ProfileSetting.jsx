import React from 'react';
import { useForm } from 'react-hook-form';

// Mock data for saved addresses, as seen in the image.
const mockAddresses = [
  {
    id: 1,
    name: 'Alex Johnson',
    street: '123 Tech Lane, Apt 4B',
    cityStateZip: 'Silicon Valley, CA 94043',
    country: 'United States',
  },
  {
    id: 2,
    name: 'Alex Johnson',
    street: '88 Work Drive',
    cityStateZip: 'San Francisco, CA 94105',
    country: 'United States',
  },
];

const ProfileSetting= () => {
  // Initialize the useForm hook for managing the Personal Information form.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '', // Initial value can be set here if editing existing data
      email: '',
    },
  });

  // Function to handle the submission of the Personal Information form.
  const onSubmitPersonalInfo = (data) => {
    console.log('Personal Information Submitted:', data);
    // In a real application, you would send this data to your backend API.
    alert('Personal information changes saved!');
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

        <div className="space-y-8">
          {/* --- Personal Information Section --- */}
          <section className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            <form onSubmit={handleSubmit(onSubmitPersonalInfo)}>
              <div className="space-y-6">
                {/* Full Name Field */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    // Register the field with useForm and add validation rules.
                    {...register('fullName', { required: 'Full Name is required' })}
                    className={`w-full p-3 border ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-shadow`}
                  />
                  {errors.fullName && (
                    <p className="mt-2 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email Address Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    // Register with email pattern validation.
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className={`w-full p-3 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-shadow`}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Save Changes Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1e293b] text-white font-medium rounded-lg hover:bg-[#334155] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e293b]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* --- Login & Security Section --- */}
          <section className="bg-white p-8 rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Login & Security</h2>
              <div>
                <p className="text-base font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-500">Last changed on Sep 1, 2025</p>
              </div>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors focus:outline-none underline-offset-2 hover:underline">
              Change Password
            </button>
          </section>

          {/* --- Saved Addresses Section --- */}
          <section className="bg-white p-8 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
              <button className="px-4 py-2 bg-[#1e293b] text-white text-sm font-medium rounded-lg hover:bg-[#334155] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e293b]">
                Add New Address
              </button>
            </div>

            {/* List of Saved Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockAddresses.map((address) => (
                <div key={address.id} className="border border-gray-200 rounded-xl p-6 flex justify-between bg-gray-50/50">
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-bold text-gray-900 text-base">{address.name}</p>
                    <p>{address.street}</p>
                    <p>{address.cityStateZip}</p>
                    <p>{address.country}</p>
                  </div>
                  <div className="flex flex-col space-y-2 text-sm font-medium text-gray-400">
                    <button className="hover:text-gray-700 transition-colors text-left focus:outline-none">edit</button>
                    <button className="hover:text-red-600 transition-colors text-left focus:outline-none">delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetting;