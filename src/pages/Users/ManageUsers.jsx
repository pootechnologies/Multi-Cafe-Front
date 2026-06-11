import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL, API_ENDPOINTS } from "../../utils/apiConfig";
import { useForm } from "react-hook-form";
import axiosInstance from "../../utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { t } from "i18next";
import { Plus, Eye, EyeOff, Pencil, Trash2, ChevronLeft, ChevronRight, Hash, User, ShieldAlert, Mail, Search, ChevronUp } from "lucide-react";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isVisible, setIsVisible] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.TENANT_USERS);
      const sortedUsers = response?.data?.results?.sort((a, b) => b.id - a.id) || [];
      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
    } catch (error) {
      console.error("There was an error fetching users:", error);
      toast.error("Failed to fetch users!");
    }
  };

  useEffect(() => {
    fetchUsers();
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setValue("email", selectedUser.email);
      setValue("is_superuser", selectedUser.is_superuser);
      setValue("is_staff", selectedUser.is_staff);
    }
  }, [selectedUser, setValue]);

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        user.email.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsConfirmDeleteOpen(true);
  };

  const closeConfirmDelete = () => {
    setIsConfirmDeleteOpen(false);
  };

  const deleteUser = () => {
    if (!userToDelete) return;
    axiosInstance
      .delete(`${API_ENDPOINTS.TENANT_USERS}${userToDelete.id}/`)
      .then(() => {
        setUsers(users.filter((user) => user.id !== userToDelete.id));
        setFilteredUsers(filteredUsers.filter((user) => user.id !== userToDelete.id));
        toast.success("User deleted successfully!");
        closeConfirmDelete();
      })
      .catch((error) => {
        console.error("There was an error deleting user:", error);
        toast.error(error.response?.data?.error || "Failed to delete user!");
        closeConfirmDelete();
      });
  };

  const handleUpdateClick = (user) => {
    setSelectedUser(user);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (data) => {
    if (!data.email.trim()) {
      toast.error("Email is required!");
      return;
    }
    try {
      await axiosInstance.patch(
        `${API_ENDPOINTS.TENANT_USERS}${selectedUser.id}/`,
        {
          email: data.email,
          is_superuser: data.is_superuser,
          is_staff: data.is_staff,
        }
      );
      fetchUsers();
      toast.success("User updated successfully!");
      setIsUpdateModalOpen(false);
    } catch (error) {
      console.error("There was an error updating user:", error);
      toast.error(error.response?.data?.error || "Failed to update user!");
    }
  };

  const handleCreateUser = (data) => {
    if (!data.email.trim()) {
      toast.error("Email is required!");
      return;
    }
    if (!data.password || data.password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }
    axiosInstance
      .post(API_ENDPOINTS.TENANT_USERS, {
        email: data.email,
        password: data.password,
        is_superuser: data.is_superuser || false,
        is_staff: data.is_staff || false,
      })
      .then((response) => {
        toast.success("User created successfully!");
        setIsCreateModalOpen(false);
        reset();
        fetchUsers();
      })
      .catch((error) => {
        console.error("There was an error creating user:", error);
        toast.error(error.response?.data?.error || "Failed to create user!");
      });
  };

  const DetailModal = ({ user, onClose }) => {
    if (!user) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col mt-6 md:mt-0 max-h-[calc(100vh-180px)] md:max-h-[85vh]" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Eye className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">User Details</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Email Address</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                {user.email}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Superuser</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${user.is_superuser ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {user.is_superuser ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Staff Status</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${user.is_staff ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                  {user.is_staff ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
            <Button onClick={onClose} className="rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white px-6">Close</Button>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden mt-20 md:mt-0" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Trash2 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Delete User</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400">Are you sure you want to delete this user? This action cannot be undone.</p>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
          <Button onClick={onCancel} className="rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 px-6">Cancel</Button>
          <Button onClick={onConfirm} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-6">Delete</Button>
        </div>
      </div>
    </div>
  );

  const UpdateModal = ({ onClose, onSubmit }) => {
    return (
      <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col mt-6 md:mt-0 max-h-[calc(100vh-180px)] md:max-h-[85vh]" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Pencil className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Update User</h2>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  {...register("email", { required: true })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                />
                {errors.email && <p className="mt-2 text-sm text-rose-500">Email is required</p>}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("is_superuser")}
                    className="h-5 w-5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/40"
                  />
                  <span className="text-sm font-medium text-slate-750 dark:text-slate-300">Is Superuser</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("is_staff")}
                    className="h-5 w-5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/40"
                  />
                  <span className="text-sm font-medium text-slate-750 dark:text-slate-300">Is Staff</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <Button type="button" onClick={onClose} className="rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 px-6">Cancel</Button>
              <Button type="submit" className="rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white px-6">Update</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const CreateUserModal = ({ onClose, onSubmit }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col mt-6 md:mt-0 max-h-[calc(100vh-180px)] md:max-h-[85vh]" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Plus className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Add User</h2>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  {...register("email", { required: true })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                  placeholder="Enter user email"
                />
                {errors.email && <p className="mt-2 text-sm text-rose-500">Email is required</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", { required: true, minLength: 6 })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-4 pr-12 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    placeholder="Create user password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none flex items-center justify-center h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-rose-500">Password must be at least 6 characters</p>}
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("is_superuser")}
                    className="h-5 w-5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/40"
                  />
                  <span className="text-sm font-medium text-slate-750 dark:text-slate-300">Is Superuser</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("is_staff")}
                    className="h-5 w-5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/40"
                  />
                  <span className="text-sm font-medium text-slate-750 dark:text-slate-300">Is Staff</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
              <Button type="button" onClick={onClose} className="rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 px-6">Cancel</Button>
              <Button type="submit" className="rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white px-6">Create User</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const pageCount = Math.ceil(filteredUsers?.length / itemsPerPage);
  const displayUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="px-5 mt-10 md:mt-0 min-h-[calc(100vh-4rem)] bg-slate-50/30 dark:bg-background md:p-8 lg:p-12 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="w-full mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 tracking-tight">
              Manage Users
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl leading-relaxed">
              View, search, and manage all registered company users and control their staff designations.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex items-center gap-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-xl px-3 h-12 shadow-sm w-full sm:w-fit">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="search"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1 sm:w-[180px] bg-transparent border-0 outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 h-8"
              />
            </div>
            <Button
              onClick={() => { reset(); setIsCreateModalOpen(true); }}
              className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 rounded-xl h-12 px-6 font-semibold"
            >
              <Plus className="h-5 w-5" />
              Add User
            </Button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-800 overflow-hidden relative">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full">
              <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100/80 dark:border-slate-800">
                <tr>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 pl-8 text-sm">ID</th>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm">EMAIL</th>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm">SUPERUSER</th>
                  <th className="text-left font-semibold text-slate-600 dark:text-slate-400 h-14 text-sm">STAFF</th>
                  <th className="text-right font-semibold text-slate-600 dark:text-slate-400 h-14 pr-8 text-sm">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {displayUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-96">
                      <div className="flex flex-col items-center justify-center text-center h-full space-y-4">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-2 shadow-sm border border-blue-100 dark:border-blue-900/50">
                          <User className="h-10 w-10 opacity-80" />
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">No users found</p>
                          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">Get started by adding a new user. Click the button above to create one.</p>
                        </div>
                        <Button
                          onClick={() => { reset(); setIsCreateModalOpen(true); }}
                          className="mt-4 rounded-xl font-medium border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First User
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group h-20">
                      <td className="py-4 pl-8">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                          <Hash className="h-3.5 w-3.5 mr-1 text-slate-400" />
                          {user.id}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-750 group-hover:border-blue-100 dark:group-hover:border-blue-900 group-hover:text-blue-600 transition-colors shadow-sm">
                            <Mail className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.is_superuser ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'}`}>
                          {user.is_superuser ? 'Superuser' : 'Regular'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.is_staff ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                          {user.is_staff ? 'Staff' : 'No Staff'}
                        </span>
                      </td>
                      <td className="py-4 pr-8 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleViewClick(user)} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 shadow-sm transition-all flex items-center justify-center" title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleUpdateClick(user)} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 dark:hover:border-amber-800 shadow-sm transition-all flex items-center justify-center" title="Update">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(user)} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800 shadow-sm transition-all flex items-center justify-center" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {displayUsers.length > 0 && (
            <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100/80 dark:border-slate-800 px-8 py-4 text-sm flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[24px]">
              <span className="text-slate-500 dark:text-slate-400">Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{displayUsers.length}</span> of <span className="font-semibold text-slate-700 dark:text-slate-200">{filteredUsers.length}</span> users</span>
              <div className="flex items-center gap-2">
                <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 rounded-lg shadow-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-3 text-sm">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-slate-600 dark:text-slate-400 font-medium px-2">Page {currentPage} of {pageCount || 1}</span>
                <Button onClick={() => setCurrentPage(p => (!pageCount || p >= pageCount ? p : p + 1))} disabled={!pageCount || currentPage >= pageCount} className="h-8 rounded-lg shadow-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-3 text-sm">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {displayUsers.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-900/50">
                <User className="h-8 w-8 opacity-80" />
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">No users found</p>
              <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6 text-sm">Add a new user to start managing team members.</p>
              <Button onClick={() => { reset(); setIsCreateModalOpen(true); }} className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                <Plus className="h-4 w-4 mr-2" />
                Add First User
              </Button>
            </div>
          ) : (
            displayUsers.map((user) => (
              <div key={user.id} className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg rounded-[20px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-5 relative group transition-shadow hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-0.5">Email</p>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-base leading-none">{user.email}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                    <Hash className="h-3 w-3 mr-1 text-slate-400" />
                    {user.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100/50 dark:border-slate-800/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Superuser</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.is_superuser ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {user.is_superuser ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-3 border border-slate-100/50 dark:border-slate-800/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Staff</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.is_staff ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                      {user.is_staff ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100/80 dark:border-slate-800">
                  <button onClick={() => handleViewClick(user)} className="flex-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-slate-50 dark:bg-slate-800/50 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                    <Eye className="h-4 w-4" /> View
                  </button>
                  <button onClick={() => handleUpdateClick(user)} className="flex-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 bg-slate-50 dark:bg-slate-800/50 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                    <Pencil className="h-4 w-4" /> Update
                  </button>
                  <button onClick={() => handleDeleteClick(user)} className="flex-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 bg-slate-50 dark:bg-slate-800/50 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors">
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
          {displayUsers.length > 0 && (
            <div className="flex flex-col items-center gap-3 pt-2 pb-4">
              <span className="text-xs text-slate-400 dark:text-slate-500">Showing {displayUsers.length} of {filteredUsers.length} users</span>
              <div className="flex items-center gap-2">
                <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 rounded-lg shadow-sm bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-2">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-slate-600 dark:text-slate-400 text-sm font-medium px-2">Page {currentPage} of {pageCount || 1}</span>
                <Button onClick={() => setCurrentPage(p => (!pageCount || p >= pageCount ? p : p + 1))} disabled={!pageCount || currentPage >= pageCount} className="h-8 rounded-lg shadow-sm bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-855 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-2">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && selectedUser && (
        <DetailModal user={selectedUser} onClose={closeModal} />
      )}
      {isConfirmDeleteOpen && (
        <ConfirmDeleteModal onConfirm={deleteUser} onCancel={closeConfirmDelete} />
      )}
      {isUpdateModalOpen && (
        <UpdateModal onClose={() => setIsUpdateModalOpen(false)} onSubmit={handleUpdateSubmit} />
      )}
      {isCreateModalOpen && (
        <CreateUserModal onClose={() => { setIsCreateModalOpen(false); reset(); }} onSubmit={handleCreateUser} />
      )}

      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 left-6 h-12 w-12 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border border-white/20 dark:border-black/20"
        >
          <ChevronUp className="h-6 w-6 group-hover:scale-125 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default ManageUsers;
