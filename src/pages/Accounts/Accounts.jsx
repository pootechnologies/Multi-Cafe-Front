import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_BASE_PROFILE, API_ENDPOINTS } from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { DataGrid } from "@mui/x-data-grid";
import { t } from "i18next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const Accounts = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    re_password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_PROFILE}${API_ENDPOINTS.USER}`
      );
      setUsers(response?.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const viewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
  };

  const editUser = (user) => {
    setSelectedUser({ ...user, password: "" });
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const updateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    const originalUser = users.find((user) => user.id === selectedUser.id);
    const updatedUserData = {};
    for (const key in selectedUser) {
      if (selectedUser[key] !== originalUser[key] && key !== "password") {
        updatedUserData[key] = selectedUser[key];
      }
    }
    if (selectedUser.password) {
      updatedUserData.password = selectedUser.password;
    }
    try {
      const response = await axiosInstance.patch(
        `${API_BASE_PROFILE}${API_ENDPOINTS.USER}${selectedUser.id}`,
        updatedUserData
      );
      fetchUsers();
      closeUpdateModal();
      toast.success("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user!");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteUser = (userId) => {
    setUserToDelete(userId);
    setIsConfirmDeleteModalOpen(true);
  };

  const deleteUser = async () => {
    try {
      await axiosInstance.delete(
        `${API_BASE_PROFILE}${API_ENDPOINTS.USER}${userToDelete}`
      );
      fetchUsers();
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user!");
    } finally {
      setIsConfirmDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const closeConfirmDeleteModal = () => {
    setIsConfirmDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const addUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (newUser.password !== newUser.re_password) {
      toast.error("Passwords do not match!");
      setLoading(false);
      return;
    }
    try {
      const response = await axiosInstance.post(
        `${API_BASE_PROFILE}${API_ENDPOINTS.USER}`,
        newUser
      );
      setNewUser({
        name: "",
        email: "",
        password: "",
        re_password: "",
        role: "",
      });
      fetchUsers();
      closeAddModal();
      toast.success("User added successfully!");
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const columns = [
    { field: "name", headerName: t("name"), width: 200 },
    { field: "email", headerName: t("email"), width: 250 },
    { field: "role", headerName: t("role"), width: 150 },
    {
      field: "actions",
      headerName: t("actions"),
      width: 150,
      renderCell: (params) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => viewUser(params.row)}>
              <Eye className="mr-2 h-4 w-4 text-blue-500" />
              {t("view")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editUser(params.row)}>
              <Pencil className="mr-2 h-4 w-4 text-yellow-500" />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => confirmDeleteUser(params.row.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const rows = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "N/A",
    actions: user,
  }));

  return (
    <div className="container p-4">
      <h3 className="lg:text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-5 sm:text-sm border-b">
        {t("manage_accounts")}
      </h3>
      <div className="flex justify-end mr-2">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="p-2 rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100 mb-4"

        >
          {t("add_new_user")}
        </Button>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-6 rounded-md w-[80%] md:w-[27rem]">
            <h3 className="text-xl mb-4 border-b p-1">{t("add_new_user")}</h3>
            <form onSubmit={addUser}>
              <div className="mb-4">
                <label className="block mb-2" htmlFor="name">
                  {t("name")}
                </label>
                <input
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="w-full border px-3 py-2"
                  id="name"
                  type="text"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2" htmlFor="email">
                  {t("email")}
                </label>
                <input
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full border px-3 py-2"
                  id="email"
                  type="email"
                />
              </div>
              <div className="mb-4 relative">
                <label className="block mb-2" htmlFor="password">
                  {t("password")}
                </label>
                <input
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full border px-3 py-2"
                  id="password"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-4"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <div className="mb-4 relative">
                <label className="block mb-2" htmlFor="re_password">
                  {t("confirm_password")}
                </label>
                <input
                  value={newUser.re_password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, re_password: e.target.value })
                  }
                  className="w-full border px-3 py-2"
                  id="re_password"
                  type={showConfirmPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-4"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <div className="mb-4">
                <label className="block mb-2">{t("role")}</label>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center mr-4">
                    <input
                      type="radio"
                      name="role"
                      value="Salesman"
                      checked={newUser.role === "Salesman"}
                      className="mr-2"
                      onChange={(e) =>
                        setNewUser({ ...newUser, role: e.target.value })
                      }
                    />
                    {t("salesman")}
                  </label>
                  <label className="flex items-center mr-4">
                    <input
                      type="radio"
                      name="role"
                      value="Manager"
                      checked={newUser.role === "Manager"}
                      className="mr-2"
                      onChange={(e) =>
                        setNewUser({ ...newUser, role: e.target.value })
                      }
                    />
                    {t("manager")}
                  </label>
                  <label className="flex items-center mr-4">
                    <input
                      type="radio"
                      name="role"
                      value="Sales Manager"
                      checked={newUser.role === "Sales Manager"}
                      className="mr-2"
                      onChange={(e) =>
                        setNewUser({ ...newUser, role: e.target.value })
                      }
                    />
                    {t("sales_manager")}
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-5">
                <Button
                  type="submit"
                  className="text-white bg-[#55B990] hover:bg-[#54ce9b] px-4 py-2 rounded-md"
                >
                  {t("add_user")}
                </Button>
                <Button
                  onClick={closeAddModal}
                  className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
                >
                  {t("close")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Desktop View - DataGrid */}
      <div className="hidden md:block" style={{ height: "auto", width: "100%" }}>
        <DataGrid
          sx={{
            "& .MuiDataGrid-footerContainer": { display: "none" },
            "& .MuiDataGrid-scrollbar--horizontal": {
              display: "scroll",
              zIndex: 1,
            },
          }}
          rows={rows}
          columns={columns}
          disableSelectionOnClick
        />
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <div key={user.id} className={`bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-all ${Object.values(expandedCards).some(v => v) && !expandedCards[user.id] ? 'opacity-40 blur-sm' : ''}`}>
            <div className="flex justify-between items-start mb-3 pb-3 border-b">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => viewUser(user)}>
                    <Eye className="mr-2 h-4 w-4 text-blue-500" />
                    {t("view")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editUser(user)}>
                    <Pencil className="mr-2 h-4 w-4 text-yellow-500" />
                    {t("edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => confirmDeleteUser(user.id)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between py-2 px-3 bg-gray-50 rounded -mx-1">
                <span className="text-gray-700 font-medium">{t("role")}</span>
                <span className="font-bold text-gray-900">{user.role || "N/A"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isVisible && (
        <button
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "60px",
            left: "20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            cursor: "pointer",
            zIndex: 20,
          }}
        >
          ↑
        </button>
      )}

      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-6 rounded-md w-[90%] sm:w-96 space-y-2">
            <h2 className="text-xl mb-4 border-b ">{t("user_details")}</h2>
            <p>
              <strong>{t("name")}:</strong> {selectedUser.name}
            </p>
            <p>
              <strong>{t("email")}:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>{t("role")}:</strong> {selectedUser.role || "N/A"}
            </p>
            <div className="flex justify-end">
              <Button
                onClick={closeViewModal}
                className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isUpdateModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded-md w-96">
            <h3 className="text-xl mb-4 border-b">{t("update_user")}</h3>
            <form onSubmit={updateUser}>
              <div className="mb-4">
                <label className="block mb-2" htmlFor="name">
                  {t("name")}
                </label>
                <input
                  value={selectedUser.name}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, name: e.target.value })
                  }
                  className="w-full border px-3 py-2"
                  id="name"
                  type="text"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2" htmlFor="email">
                  {t("email")}
                </label>
                <input
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                  className="w-full border px-3 py-2"
                  id="email"
                  type="email"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">{t("role")}</label>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="Salesman"
                      checked={selectedUser.role === "Salesman"}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          role: e.target.value,
                        })
                      }
                    />
                    <span className="ml-2">{t("salesman")}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="Manager"
                      checked={selectedUser.role === "Manager"}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          role: e.target.value,
                        })
                      }
                    />
                    <span className="ml-2">{t("manager")}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="Sales Manager"
                      checked={selectedUser.role === "Sales Manager"}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          role: e.target.value,
                        })
                      }
                    />
                    <span className="ml-2">{t("sales_manager")}</span>
                  </label>
                </div>
              </div>
              <div className="mb-4 relative">
                <label className="block mb-2" htmlFor="password">
                  {t("new_password")}
                </label>
                <input
                  value={selectedUser.password}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      password: e.target.value,
                    })
                  }
                  className="w-full border px-3 py-2"
                  id="password"
                  placeholder="********"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-4"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="submit"
                  className="bg-[#55B990] hover:bg-[#54ce9b] text-white px-4 py-2 rounded-md"
                >
                  {t("update")}
                </Button>
                <Button
                  onClick={closeUpdateModal}
                  className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
                >
                  {t("close")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isConfirmDeleteModalOpen && (
        <ConfirmDeleteModal
          onConfirm={deleteUser}
          onCancel={closeConfirmDeleteModal}
        />
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-[1000]">
          <Spinner className="size-6" />
        </div>
      )}
    </div>
  );
};

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
  <div
    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[1000]"
    onClick={onCancel}
  >
    <div
      className="bg-white p-5 rounded-lg w-full max-w-md"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="mb-4 font-bold text-2xl border-b p-1">
        {t("are_you_sure")}
      </h2>
      <p>{t("sure_discription_account")}</p>
      <div className="mt-4 flex justify-end space-x-2">
        <Button
          onClick={onConfirm}
          className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
        >
          {t("delete")}
        </Button>
        <Button
          onClick={onCancel}
          className="bg-[#913030] hover:bg-[#b35a5a] text-white px-4 py-2 rounded-md"
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  </div>
);

export default Accounts;
