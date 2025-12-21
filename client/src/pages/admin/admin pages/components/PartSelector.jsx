const PartSelector = ({
  category,
  label,
  icon: Icon,
  options,
  selected,
  disabled,
  onSelect,
}) => (
  <div
    className={`p-6 bg-white rounded-xl shadow-sm border border-gray-100 ${
      disabled ? "opacity-50 pointer-events-none" : ""
    }`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
    </div>

    <div className="grid grid-cols-1 gap-4">
      {selected ? (
        <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div>
            <p className="font-bold text-gray-900">{selected.name}</p>
            <p className="text-sm text-gray-600">
              ₹{(selected.price / 100).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(category, null)}
            className="text-sm text-red-600 hover:underline font-medium"
          >
            Change
          </button>
        </div>
      ) : (
        <select
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          onChange={(e) => {
            const part = options.find((o) => o._id === e.target.value);
            onSelect(category, part);
          }}
          defaultValue=""
        >
          <option value="" disabled>
            Select {label}...
          </option>
          {options?.map((opt) => (
            <option key={opt._id} value={opt._id}>
              {opt.name} - ₹{(opt.price / 100).toLocaleString()}
            </option>
          ))}
        </select>
      )}
    </div>
  </div>
);

export default PartSelector