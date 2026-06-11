import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { t } from "i18next";

const CompanyProfile = () => {
  const [formData, setFormData] = useState({
    en_name: "",
    am_name: "",
    owner_en_name: "",
    owner_am_name: "",
    email: "",
    phone1: "",
    phone2: "",
    tin_number: "",
    vat_number: "",
    country: "",
    city: "",
    region: "",
    zone: "",
    sub_city: "",
  });
  const [fetchedData, setFetchedData] = useState(null);
  const [buttonText, setButtonText] = useState("Add");
  const [logoSrc, setLogoSrc] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.COMPANY);
        const data = response.data[0];
        setFetchedData(data);
        setLogoSrc(data.logo);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };
    fetchCompanyData();
  }, []);

  useEffect(() => {
    if (fetchedData) {
      setFormData((prevData) => ({
        ...prevData,
        en_name: fetchedData.en_name || "",
        am_name: fetchedData.am_name || "",
        owner_en_name: fetchedData.owner_en_name || "",
        owner_am_name: fetchedData.owner_am_name || "",
        email: fetchedData.email || "",
        phone1: fetchedData.phone1 || "",
        phone2: fetchedData.phone2 || "",
        tin_number: fetchedData.tin_number || "",
        vat_number: fetchedData.vat_number || "",
        country: fetchedData.country || "",
        city: fetchedData.city || "",
        region: fetchedData.region || "",
        zone: fetchedData.zone || "",
        sub_city: fetchedData.sub_city || "",
      }));
      setButtonText(t("update_information"));
    } else {
      setButtonText("Add");
    }
  }, [fetchedData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo" && files) {
      setLogoFile(files[0]);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (logoFile) {
      data.append("logo", logoFile);
    }

    try {
      if (fetchedData) {
        const response = await axiosInstance.patch(
          `${API_ENDPOINTS.COMPANY}/${fetchedData.id}`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Company information updated successfully!");
      } else {
        const response = await axiosInstance.post(
          API_ENDPOINTS.COMPANY,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Company information added successfully!");
        const fetchUpdatedData = async () => {
          try {
            const updatedResponse = await axiosInstance.get(API_ENDPOINTS.COMPANY);
            const updatedData = updatedResponse.data[0];
            setFetchedData(updatedData);
            setLogoSrc(updatedData.logo);
          } catch (error) {
            console.error("Error fetching updated company data:", error);
          }
        };
        fetchUpdatedData();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save company profile.");
    }
  };

  return (
    <div className="p-4 min-h-screen">
      <h1 className="lg:text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-5 sm:text-sm border-b">
        {t("company_profile")}
      </h1>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-2" onSubmit={handleSubmit}>
        {/* English Name */}
        <div>
          <label
            htmlFor="en_name"
            className="block text-sm font-medium text-gray-700"
          >
            English Name
          </label>
          <input
            type="text"
            id="en_name"
            name="en_name"
            value={formData.en_name || ""}
            onChange={handleChange}
            placeholder="Company"
            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* Amharic Name */}
        <div>
          <label
            htmlFor="am_name"
            className="block text-sm font-medium text-gray-700"
          >
            Amharic Name
          </label>
          <input
            type="text"
            id="am_name"
            name="am_name"
            value={formData.am_name}
            onChange={handleChange}
            placeholder=""
            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* Owner English Name */}
        <div>
          <label
            htmlFor="owner_en_name"
            className="block text-sm font-medium text-gray-700"
          >
            Owner English Name
          </label>
          <input
            type="text"
            id="owner_en_name"
            name="owner_en_name"
            value={formData.owner_en_name}
            onChange={handleChange}
            placeholder="Owner English Name"
            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* Owner Amharic Name */}
        <div>
          <label
            htmlFor="owner_am_name"
            className="block text-sm font-medium text-gray-700"
          >
            Owner Amharic Name
          </label>
          <input
            type="text"
            id="owner_am_name"
            name="owner_am_name"
            value={formData.owner_am_name}
            onChange={handleChange}
            placeholder="Owner Amharic Name"
            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            {t("email")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@example.com"
            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* Phone 1 */}
        <div>
          <label
            htmlFor="phone1"
            className="block text-sm font-medium text-gray-700"
          >
            {t("phone")} 1
          </label>
          <input
            type="text"
            id="phone1"
            name="phone1"
            value={formData.phone1}
            onChange={handleChange}
            placeholder="Primary Phone"
            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* Phone 2 */}
        <div>
          <label
            htmlFor="phone2"
            className="block text-sm font-medium text-gray-700"
          >
            {t("phone")} 2
          </label>
          <input
            type="text"
            id="phone2"
            name="phone2"
            value={formData.phone2}
            onChange={handleChange}
            placeholder="Secondary Phone"
            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* TIN Number */}
        <div>
          <label
            htmlFor="tin_number"
            className="block text-sm font-medium text-gray-700"
          >
            {t("tin_number")}
          </label>
          <input
            type="text"
            id="tin_number"
            name="tin_number"
            value={formData.tin_number}
            onChange={handleChange}
            placeholder="TIN Number"
            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* VAT Number */}
        <div>
          <label
            htmlFor="vat_number"
            className="block text-sm font-medium text-gray-700"
          >
            {t("vat_number")}
          </label>
          <input
            type="text"
            id="vat_number"
            name="vat_number"
            value={formData.vat_number}
            onChange={handleChange}
            placeholder="VAT Number"
            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* Country */}
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700"
          >
            {t("country")}
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* City */}
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700"
          >
            {t("city")}
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* Region */}
        <div>
          <label
            htmlFor="region"
            className="block text-sm font-medium text-gray-700"
          >
            {t("region")}
          </label>
          <input
            type="text"
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            placeholder="Region"
            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* Zone */}
        <div>
          <label
            htmlFor="zone"
            className="block text-sm font-medium text-gray-700"
          >
            {t("zone")}
          </label>
          <input
            type="text"
            id="zone"
            name="zone"
            value={formData.zone}
            onChange={handleChange}
            placeholder="Zone"
            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* Sub City */}
        <div>
          <label
            htmlFor="sub_city"
            className="block text-sm font-medium text-gray-700"
          >
            {t("sub_city")}
          </label>
          <input
            type="text"
            id="sub_city"
            name="sub_city"
            value={formData.sub_city}
            onChange={handleChange}
            placeholder="Sub City"
            className="mt-1 p-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* Logo */}
        <div className="md:col-span-2 w-auto md:w-[200px]">
          <label
            htmlFor="logo"
            className="block text-sm font-medium text-gray-700"
          >
            {t("logo")}
          </label>
          <input
            type="file"
            id="logo"
            name="logo"
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        {/* Submit Button */}
        <div className="md:col-span-2 w-auto md:w-[200px]">
          <Button
            type="submit"
            className="py-2 px-4 bg-[#55B990] hover:bg-[#54ce9b] text-white font-medium rounded-md shadow w-full"
          >
            {buttonText}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
