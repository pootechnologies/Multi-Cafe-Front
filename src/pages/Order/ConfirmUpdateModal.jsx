import { Button } from "@/components/ui/button";

const ConfirmUpdateModal = ({ onConfirm, onCancel }) => (
  <div
    style={{
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
    onClick={onCancel}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        width: "400px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="mb-4 font-bold text-2xl border-b p-1">Are you sure?</h2>
      <p>Are you want to update?</p>
      <div className="mt-4 flex justify-end space-x-2">
        <Button
          onClick={onConfirm}
          className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-md"
        >
          Yes
        </Button>
        <Button
          onClick={onCancel}
          className="bg-black text-white px-4 py-2 rounded-md mr-2"
        >
          No
        </Button>
      </div>
    </div>
  </div>
);

export default ConfirmUpdateModal;
