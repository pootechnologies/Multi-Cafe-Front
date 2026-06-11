import { useFormContext } from "react-hook-form";
import Select from "react-select";

const FormField = ({
  id,
  label,
  options,
  selectedOption,
  setSelectedOption,
  errors,
  register,
  setValue,
  isSelect = false,
  type = "text",
  placeholder = "",
  className = "",
}) => {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        {label}
      </label>
      {isSelect ? (
        <select
          id={id}
          className={`bg-gray-50 border ${
            errors[id] ? "border-red-500" : "border-gray-300"
          } text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          {...register(id)}
        >
          <option value="">Select {label}</option>
          {options.map((option, index) => (
            <option key={index} value={option.value || option.id}>
              {option.label || option.name}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className={`bg-gray-50 border ${
            errors[id] ? "border-red-500" : "border-gray-300"
          } text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          {...register(id)}
        />
      )}
      {errors[id] && (
        <p className="text-red-500 text-xs">{errors[id].message}</p>
      )}
    </div>
  );
};

export default FormField;
