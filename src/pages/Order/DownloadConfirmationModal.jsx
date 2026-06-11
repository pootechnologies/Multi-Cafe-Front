import { t } from "i18next";

const DownloadConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-md">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-300">
          {t("download_pdf")}
        </h2>
        <p>{t("do_you_want_to_download")}</p>
        <div className="flex justify-end mt-4 space-x-5">
          <button
            onClick={onConfirm}
            className="bg-[#55B990] hover:bg-[#54ce9b] text-white px-4 py-2 rounded-md"
          >
            {t("yes")}
          </button>
          <button
            onClick={onClose}
            className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
          >
            {t("no")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadConfirmationModal;
