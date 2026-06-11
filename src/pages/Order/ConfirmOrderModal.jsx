import { Button } from "@/components/ui/button";
import { t } from "i18next";

const ConfirmOrderModal = ({ onConfirm, onCancel }) => (
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
      onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
    >
      <h2 className="mb-4 font-bold text-2xl border-b p-1">
        {t("are_you_sure")}
      </h2>
      <p>{t("sure_order")}</p>
      <div className="mt-4 flex justify-end space-x-2">
        <Button
          onClick={onConfirm}
          className="bg-[#55B990] hover:bg-[#54ce9b] text-white px-4 py-2 rounded-md"
        >
          {t("confirm")}
        </Button>
        <Button
          onClick={onCancel}
          className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  </div>
);

export default ConfirmOrderModal;
