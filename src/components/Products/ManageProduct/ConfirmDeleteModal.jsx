import { Button } from "@/components/ui/button";
import { t } from "i18next";
import { Trash2, AlertTriangle } from "lucide-react";

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onCancel}>
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-300 mt-20 md:mt-0" onClick={e => e.stopPropagation()}>
      <div className="p-8 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 shadow-sm">
            <Trash2 className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{t("are_you_sure")}</h2>
        </div>
      </div>
      <div className="p-8">
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/30 mb-2">
           <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
           <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">{t("sure_discription")}</p>
        </div>
      </div>
      <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
        <Button onClick={onCancel} className="rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 px-8 h-12 font-bold transition-all">
          {t("cancel")}
        </Button>
        <Button onClick={onConfirm} className="rounded-2xl bg-rose-600 hover:bg-rose-700 text-white px-8 h-12 font-bold shadow-lg shadow-rose-500/20 transition-all">
          {t("delete")}
        </Button>
      </div>
    </div>
  </div>
);

export default ConfirmDeleteModal;
