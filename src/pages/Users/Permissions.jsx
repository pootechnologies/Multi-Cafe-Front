import { useEffect, useState } from "react";
import { Shield, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import CreatableSelect from "react-select/creatable";

const Permissions = () => {
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.TENANT_GROUPS);
      setGroups(response.data?.results || []);
    } catch (error) {
      console.error("Failed to load tenant groups:", error);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    fetch("/permissions.json")
      .then((res) => res.json())
      .then((data) => setAvailablePermissions(data))
      .catch(() => {
        setAvailablePermissions([]);
        toast.error("Failed to load permissions.");
      });

    fetchGroups();

    const handleScroll = () => setIsVisible(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    const parts = permission.split(".");
    const actionPart = parts[1] || parts[0];
    const [verb, ...resourceParts] = actionPart.split("_");
    const resource = resourceParts.length > 0 ? resourceParts.join(" ") : actionPart;
    
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push({ action: verb, fullPermission: permission });
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

  const selectOptions = groups.map((g) => ({
    label: g.name,
    value: g.name,
    id: g.id,
    permissions: g.permissions || [],
  }));

  const handleGroupChange = (selectedOption) => {
    if (selectedOption) {
      setGroupName(selectedOption.value);
      if (selectedOption.id) {
        setSelectedGroupId(selectedOption.id);
        setSelectedPermissions(selectedOption.permissions || []);
      } else {
        setSelectedGroupId(null);
        setSelectedPermissions([]);
      }
    } else {
      setGroupName("");
      setSelectedGroupId(null);
      setSelectedPermissions([]);
    }
  };

  const handleCreateGroup = (inputValue) => {
    const formattedVal = inputValue.length > 0 ? inputValue.charAt(0).toUpperCase() + inputValue.slice(1) : "";
    setGroupName(formattedVal);
    setSelectedGroupId(null);
    setSelectedPermissions([]);
  };

  const handleSave = async () => {
    if (!groupName.trim()) {
      toast.error("Name is required");
      return;
    }
    if (selectedPermissions.length === 0) {
      toast.error("Permission is required");
      return;
    }

    const payload = {
      name: groupName,
      permissions: selectedPermissions,
    };

    console.log(payload);

    try {
      if (selectedGroupId) {
        await axiosInstance.patch(`${API_ENDPOINTS.TENANT_GROUPS}${selectedGroupId}/`, payload);
        toast.success("Permission group updated successfully!");
      } else {
        await axiosInstance.post(API_ENDPOINTS.TENANT_GROUPS, payload);
        toast.success("Permission group created successfully!");
      }
      setGroupName("");
      setSelectedGroupId(null);
      setSelectedPermissions([]);
      fetchGroups();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save permission group.");
    }
  };

  return (
    <div className="px-5 mt-10 md:mt-0 min-h-[calc(100vh-4rem)] bg-slate-50/30 dark:bg-background md:p-8 lg:p-12 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="w-full mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Shield className="h-5 w-5" />
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 tracking-tight">
                Permissions
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-xl leading-relaxed">
              View and manage all available system permissions. Select the permissions you want to assign.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
              <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedPermissions.length}</span> / {availablePermissions.length} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPermissions([...availablePermissions])}
                  className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition-colors whitespace-nowrap"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPermissions([])}
                  className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition-colors whitespace-nowrap"
                >
                  Clear All
                </button>
              </div>
            </div>
            <Button
              onClick={handleSave}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 rounded-xl h-10 px-6 font-semibold"
            >
              Save Permissions
            </Button>
          </div>
        </div>

        {/* Groups Section */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/40 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 md:p-8 relative z-40">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            Groups
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 shrink-0" htmlFor="group-name">
              Name
            </label>
            <div className="w-full sm:w-80">
              <CreatableSelect
                id="group-name"
                isClearable
                isLoading={loadingGroups}
                options={selectOptions}
                value={groupName ? { label: groupName, value: groupName } : null}
                onChange={handleGroupChange}
                onCreateOption={handleCreateGroup}
                placeholder="Select or enter group name"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                unstyled
                classNames={{
                  control: ({ isFocused }) =>
                    `flex rounded-xl border px-4 py-2 text-sm transition-all bg-white dark:bg-slate-800 ${
                      isFocused
                        ? "border-emerald-500 ring-2 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500"
                    }`,
                  valueContainer: () => "gap-1 text-slate-900 dark:text-slate-100",
                  singleValue: () => "text-slate-900 dark:text-slate-100",
                  input: () => "text-slate-900 dark:text-slate-100",
                  placeholder: () => "text-slate-400 dark:text-slate-500",
                  menu: () =>
                    "mt-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden z-50",
                  menuList: () => "p-1",
                  option: ({ isFocused, isSelected }) =>
                    `px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-emerald-500 text-white"
                        : isFocused
                        ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                        : "text-slate-700 dark:text-slate-300"
                    }`,
                  noOptionsMessage: () => "p-2 text-sm text-slate-400 text-center",
                  loadingMessage: () => "p-2 text-sm text-slate-400 text-center",
                  dropdownIndicator: () => "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer",
                  clearIndicator: () => "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer",
                  indicatorSeparator: () => "bg-slate-200 dark:bg-slate-700 my-1 mx-2",
                }}
              />
            </div>
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
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(groupedPermissions).map(([resource, perms]) => {
              const selectedCount = perms.filter((p) =>
                selectedPermissions.includes(p.fullPermission)
              ).length;
              const allSelected = selectedCount === perms.length;

              return (
                <div
                  key={resource}
                  className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-2xl border border-white/50 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(16,185,129,0.06)] hover:border-emerald-200 dark:hover:border-emerald-800 flex flex-col"
                >
                  {/* Resource Group Header */}
                  <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/40 dark:to-slate-900/40 border-b border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-3 cursor-pointer group/header">
                      <div className={`flex items-center justify-center w-5 h-5 rounded-md border transition-colors ${allSelected ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover/header:border-emerald-400"}`}>
                         {allSelected && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => toggleApp(perms, e.target.checked)}
                        className="sr-only"
                      />
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest text-sm">
                        {resource}
                      </h4>
                    </label>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${selectedCount > 0 ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-400" : "bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"}`}>
                      {selectedCount} / {perms.length}
                    </span>
                  </div>

                  {/* Permissions */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-5 flex-grow">
                    {perms.map(({ action, fullPermission }) => {
                      const isChecked = selectedPermissions.includes(fullPermission);
                      return (
                        <label
                          key={fullPermission}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 select-none group/item
                            ${isChecked
                              ? "bg-emerald-50/80 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-600 shadow-sm"
                              : "bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-sm"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => togglePerm(fullPermission, e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`flex items-center justify-center w-5 h-5 shrink-0 rounded-md border transition-colors ${isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover/item:border-emerald-400"}`}>
                            {isChecked && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className={`capitalize font-medium text-sm leading-tight transition-colors ${isChecked ? "text-emerald-800 dark:text-emerald-200" : "text-slate-600 dark:text-slate-400 group-hover/item:text-slate-900 dark:group-hover/item:text-slate-200"}`}>
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