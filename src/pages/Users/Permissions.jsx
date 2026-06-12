import { useEffect, useState } from "react";
import { Shield, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const Permissions = () => {
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    fetch("/permissions.json")
      .then((res) => res.json())
      .then((data) => setAvailablePermissions(data))
      .catch(() => {
        setAvailablePermissions([]);
        toast.error("Failed to load permissions.");
      });

    const handleScroll = () => setIsVisible(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    const [app, ...rest] = permission.split(".");
    const action = rest.join(".");
    if (!acc[app]) acc[app] = [];
    acc[app].push({ action, fullPermission: permission });
    return acc;
  }, {});

  const togglePerm = (fullPermission, checked) => {
    setSelectedPermissions((prev) =>
      checked ? [...prev, fullPermission] : prev.filter((p) => p !== fullPermission)
    );
  };

  const toggleApp = (perms, checked) => {
    const keys = perms.map((p) => p.fullPermission);
    setSelectedPermissions((prev) =>
      checked
        ? [...new Set([...prev, ...keys])]
        : prev.filter((p) => !keys.includes(p))
    );
  };

  const handleSave = () => {
    toast.success(`${selectedPermissions.length} permission(s) saved!`);
  };

  return (
    <div className="px-5 mt-10 md:mt-0 min-h-[calc(100vh-4rem)] bg-slate-50/30 dark:bg-background md:p-8 lg:p-12 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="w-full mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Shield className="h-5 w-5" />
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 tracking-tight">
                Permissions
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl leading-relaxed">
              View and manage all available system permissions. Select the permissions you want to assign.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedPermissions.length}</span> / {availablePermissions.length} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedPermissions([...availablePermissions])}
              className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition-colors"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => setSelectedPermissions([])}
              className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition-colors"
            >
              Clear All
            </button>
            <Button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 rounded-xl h-10 px-6 font-semibold"
            >
              Save Permissions
            </Button>
          </div>
        </div>

        {/* Groups Section */}
        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[20px] border border-slate-200/60 dark:border-slate-800 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            Groups
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 shrink-0" htmlFor="group-name">
              Name
            </label>
            <input
              id="group-name"
              type="text"
              value={groupName}
              onChange={(e) => {
                const val = e.target.value;
                setGroupName(val.length > 0 ? val.charAt(0).toUpperCase() + val.slice(1) : "");
              }}
              placeholder="Enter group name"
              className="w-full sm:w-60 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
            />
          </div>
        </div>

        {/* Permissions Grid */}
        {availablePermissions.length === 0 ? (
          <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-16 text-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 opacity-80" />
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">No permissions available</p>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Could not load permissions from the server.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([app, perms]) => {
              const selectedCount = perms.filter((p) =>
                selectedPermissions.includes(p.fullPermission)
              ).length;
              const allSelected = selectedCount === perms.length;

              return (
                <div
                  key={app}
                  className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[20px] border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm"
                >
                  {/* App Group Header */}
                  <div className="flex items-center justify-between px-5 py-3 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-700">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => toggleApp(perms, e.target.checked)}
                        className="h-4 w-4 accent-emerald-500"
                      />
                      <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">
                        {app}
                      </h4>
                    </label>
                    <span className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full">
                      {selectedCount} / {perms.length}
                    </span>
                  </div>

                  {/* Permissions */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-4">
                    {perms.map(({ action, fullPermission }) => {
                      const isChecked = selectedPermissions.includes(fullPermission);
                      return (
                        <label
                          key={fullPermission}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all text-xs select-none
                            ${isChecked
                              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 shadow-sm"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => togglePerm(fullPermission, e.target.checked)}
                            className="h-3.5 w-3.5 accent-emerald-500 shrink-0"
                          />
                          <span className="capitalize text-slate-700 dark:text-slate-300 leading-tight">
                            {action.replace(/_/g, " ")}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scroll to top */}
      {isVisible && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 left-6 h-12 w-12 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border border-white/20 dark:border-black/20"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default Permissions;
