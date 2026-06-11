import { API_BASE_PROFILE, API_ENDPOINTS } from "@/utils/apiConfig";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { t } from "i18next";
import { Spinner } from "@/components/ui/spinner";

const Profile = () => {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    role: "",
    age: "",
    gender: "",
    address: "",
    mobile: "",
    empNo: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("userInfo");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_PROFILE}${API_ENDPOINTS.PROFILE}`
        );
        const userData = response.data.data;
        const profileData = {
          fullName: userData.name || "",
          email: userData.email || "",
          role: userData.role || "",
          age: userData.age || 0,
          gender: userData.gender || "",
          address: userData.address || "",
          mobile: userData.mobile || "",
          empNo: userData.emp_no || "",
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        };
        setProfile(profileData);
        setOriginalProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProfile((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleRoleChange = (e) => {
    setProfile((prevState) => ({
      ...prevState,
      role: e.target.value,
    }));
  };

  const handleGenderChange = (e) => {
    setProfile((prevState) => ({
      ...prevState,
      gender: e.target.value,
    }));
  };

  const handleUpdateClick = () => {
    setIsEditing(true);
  };

  const handleUpdatePasswordClick = () => {
    setIsEditingPassword(true);
  };

  const handleSaveInformationClick = async () => {
    setIsLoading(true);
    try {
      const changedData = Object.keys(profile).reduce((acc, key) => {
        if (
          profile[key] !== originalProfile[key] &&
          key !== "oldPassword" &&
          key !== "newPassword" &&
          key !== "confirmPassword"
        ) {
          acc[key === "fullName" ? "name" : key] = profile[key];
        }
        return acc;
      }, {});
      const response = await axiosInstance.patch(
        `${API_BASE_PROFILE}${API_ENDPOINTS.PROFILE}`,
        changedData
      );
      setOriginalProfile(profile);
      setIsEditing(false);
      toast.success("Profile information saved successfully!");
    } catch (error) {
      console.error("Error updating profile data:", error);
      toast.error("Failed to save profile information.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePasswordClick = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        `${API_BASE_PROFILE}${API_ENDPOINTS.CHANGEPASSWORD}`,
        {
          current_password: profile.oldPassword,
          new_password: profile.newPassword,
          confirm_password: profile.confirmPassword,
        }
      );
      setProfile((prevState) => ({
        ...prevState,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setIsEditingPassword(false);
      toast.success("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.error || "Failed to change password.");
    } finally {
      setIsLoading(false);
    }
  };

  const femaleAvatarUrl =
    "https://static.vecteezy.com/system/resources/previews/019/896/012/large_2x/female-user-avatar-icon-in-flat-design-style-person-signs-illustration-png.png";
  const maleAvatarUrl =
    "https://static.vecteezy.com/system/resources/previews/019/896/008/large_2x/male-user-avatar-icon-in-flat-design-style-person-signs-illustration-png.png";

  return (
    <div className="bg-white w-full flex flex-col gap-5 p-4 md:flex-row text-[#161931]">
      <main className="w-full min-h-screen">
        <div className="w-full sm:rounded-lg">
          <h2 className="lg:text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-5 sm:text-sm border-b">
            {t("profile")}
          </h2>
          <div className="grid max-w-3xl mt-2">
            <div className="flex flex-col items-center space-y-5 lg:flex-row lg:space-y-0 p-5">
              <img
                className="object-cover w-40 h-40 p-1 rounded-full ring-2 ring-indigo-300 dark:ring-indigo-500"
                src={
                  profile.gender === "Female" ? femaleAvatarUrl : maleAvatarUrl
                }
                alt="Bordered avatar"
              />
              <div className="flex flex-col space-y-5 sm:ml-8"></div>
            </div>
            <div className="flex space-x-4 mb-4">
              <button
                className={`pb-2 border-b-2 ${
                  activeTab === "userInfo"
                    ? "border-indigo-500 text-indigo-500"
                    : "border-transparent text-gray-500"
                } font-medium`}
                onClick={() => setActiveTab("userInfo")}
              >
                {t("user_information")}
              </button>
              <button
                className={`pb-2 border-b-2 ${
                  activeTab === "changePassword"
                    ? "border-indigo-500 text-indigo-500"
                    : "border-transparent text-gray-500"
                } font-medium`}
                onClick={() => setActiveTab("changePassword")}
              >
                {t("change_password")}
              </button>
            </div>
            {activeTab === "userInfo" && (
              <div className="items-center mt-8 sm:mt-14 text-[#202142]">
                <div className="w-full mb-2 sm:mb-6">
                  <label
                    htmlFor="fullName"
                    className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white"
                  >
                    {t("full_name")}
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    placeholder={t("full_name")}
                    className={`bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 ${
                      isEditing ? "bg-white" : ""
                    }`}
                    value={profile.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="mb-2 sm:mb-6">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white"
                  >
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    className={`bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 ${
                      isEditing ? "bg-white" : ""
                    }`}
                    placeholder={t("email")}
                    value={profile.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="mb-2 sm:mb-6">
                  <label className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white">
                    {t("role")}
                  </label>
                  <div className="flex items-center space-x-4">
                    <div>
                      <label>{profile.role}</label>
                    </div>
                  </div>
                </div>
                <div className="mb-2 sm:mb-6">
                  <label
                    htmlFor="age"
                    className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white"
                  >
                    {t("age")}
                  </label>
                  <input
                    type="number"
                    placeholder={t("age")}
                    id="age"
                    className={`bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 ${
                      isEditing ? "bg-white" : ""
                    }`}
                    value={profile.age}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="mb-2 sm:mb-6">
                  <label className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white">
                    {t("gender")}
                  </label>
                  <div className="flex items-center space-x-4">
                    <div>
                      <input
                        type="radio"
                        id="male"
                        name="gender"
                        value="Male"
                        checked={profile.gender === "Male"}
                        onChange={handleGenderChange}
                        className="mr-2"
                        disabled={!isEditing}
                      />
                      <label htmlFor="male">{t("male")}</label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="female"
                        name="gender"
                        value="Female"
                        checked={profile.gender === "Female"}
                        onChange={handleGenderChange}
                        className="mr-2"
                        disabled={!isEditing}
                      />
                      <label htmlFor="female">{t("female")}</label>
                    </div>
                  </div>
                </div>
                <div className="mb-2 sm:mb-6">
                  <label
                    htmlFor="address"
                    className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white"
                  >
                    {t("address")}
                  </label>
                  <input
                    type="text"
                    id="address"
                    className={`bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 ${
                      isEditing ? "bg-white" : ""
                    }`}
                    placeholder={t("address")}
                    value={profile.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="mb-2 sm:mb-6">
                  <label
                    htmlFor="mobile"
                    className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white"
                  >
                    {t("phone")}
                  </label>
                  <input
                    type="text"
                    id="mobile"
                    className={`bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 ${
                      isEditing ? "bg-white" : ""
                    }`}
                    placeholder={t("Phone_number")}
                    value={profile.mobile}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="mb-2 sm:mb-6">
                  <label
                    htmlFor="empNo"
                    className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white"
                  >
                    {t("employee_number")}
                  </label>
                  <input
                    type="text"
                    id="empNo"
                    className={`bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 ${
                      isEditing ? "bg-white" : ""
                    }`}
                    placeholder={t("employee_number")}
                    value={profile.empNo}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={handleSaveInformationClick}
                      className="text-white bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800"
                    >
                      {t("save_information")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUpdateClick}
                      className="text-white bg-[#55B990] hover:bg-[#54ce9b] focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800"
                    >
                      {t("update")}
                    </button>
                  )}
                </div>
              </div>
            )}
            {activeTab === "changePassword" && (
              <div className="items-center mt-8 sm:mt-14 text-[#202142]">
                <div className="mb-2 sm:mb-6 relative">
                  <label
                    htmlFor="oldPassword"
                    className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white"
                  >
                    {t("old_password")}
                  </label>
                  <input
                    type={showOldPassword ? "text" : "password"}
                    id="oldPassword"
                    className={`bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 pr-10 ${
                      isEditingPassword ? "bg-white" : ""
                    }`}
                    value={profile.oldPassword}
                    onChange={handleInputChange}
                    disabled={!isEditingPassword}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-500 mt-4"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="mb-2 sm:mb-6 relative">
                  <label
                    htmlFor="newPassword"
                    className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white"
                  >
                    {t("new_password")}
                  </label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    className={`bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 pr-10 ${
                      isEditingPassword ? "bg-white" : ""
                    }`}
                    value={profile.newPassword}
                    onChange={handleInputChange}
                    disabled={!isEditingPassword}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-500 mt-4"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="mb-2 sm:mb-6 relative">
                  <label
                    htmlFor="confirmPassword"
                    className="block mb-2 text-sm font-medium text-indigo-900 dark:text-white"
                  >
                    {t("confirm_password")}
                  </label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    className={`bg-indigo-50 border border-indigo-300 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 pr-10 ${
                      isEditingPassword ? "bg-white" : ""
                    }`}
                    value={profile.confirmPassword}
                    onChange={handleInputChange}
                    disabled={!isEditingPassword}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-500 mt-4"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end space-x-4">
                  {isEditingPassword ? (
                    <button
                      type="button"
                      onClick={handleSavePasswordClick}
                      className="text-white bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800"
                    >
                      {t("save_password")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUpdatePasswordClick}
                      className="text-white bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800"
                    >
                      {t("update")}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default Profile;
