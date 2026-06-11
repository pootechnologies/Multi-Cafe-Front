import { useController } from "react-hook-form";

const FileInput = ({ id, label, control }) => {
  const {
    field: { onChange, value },
  } = useController({
    name: id,
    control,
  });

  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        {label}
      </label>
      <input
        type="file"
        id={id}
        accept="image/png, image/jpeg, image/jpg"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-4 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        onChange={(e) => onChange(e.target.files[0])}
      />
    </div>
  );
};

export default FileInput;
