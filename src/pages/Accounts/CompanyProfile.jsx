import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { t } from "i18next";
import { Tags, Building, User, Mail, Phone, MapPin, Hash, Upload, X } from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.COMPANY);
        const data = response.data[0];
        setFetchedData(data);
        // Check if logo is a full URL or relative path
        if (data.logo) {
          if (data.logo.startsWith('http')) {
            setLogoSrc(data.logo);
          } else {
            // If it's a relative path, construct full URL
            const schemaName = localStorage.getItem("schema_name");
            if (schemaName && schemaName !== "public") {
              setLogoSrc(`https://${schemaName}.inventory.pootechnologies.tech/${data.logo}`);
            } else {
              setLogoSrc(data.logo);
            }
          }
        }
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
    setIsSubmitting(true);
    
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
            // Check if logo is a full URL or relative path
            if (updatedData.logo) {
              if (updatedData.logo.startsWith('http')) {
                setLogoSrc(updatedData.logo);
              } else {
                // If it's a relative path, construct full URL
                const schemaName = localStorage.getItem("schema_name");
                if (schemaName && schemaName !== "public") {
                  setLogoSrc(`https://${schemaName}.inventory.pootechnologies.tech/${updatedData.logo}`);
                } else {
                  setLogoSrc(updatedData.logo);
                }
              }
            }
          } catch (error) {
            console.error("Error fetching updated company data:", error);
          }
        };
        fetchUpdatedData();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save company profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent px-6 py-6 border-b border-emerald-500/10">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-emerald-600">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-lg">
              <Building className="h-6 w-6" />
            </div>
            {t("company_profile")}
          </h2>
        </div>

        <form className="p-6 md:p-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                English Name
              </label>
              <div className="group relative transition-all">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="en_name"
                  name="en_name"
                  value={formData.en_name || ""}
                  onChange={handleChange}
                  placeholder="Company"
                  disabled={isSubmitting}
                  className="w-full h-11 pl-12 pr-5 rounded-xl border border-gray-200 bg-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            {/* Amharic Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Amharic Name
              </label>
              <div className="group relative transition-all">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="am_name"
                  name="am_name"
                  value={formData.am_name}
                  onChange={handleChange}
                  placeholder=""
                  disabled={isSubmitting}
                  className="w-full h-11 pl-12 pr-5 rounded-xl border border-gray-200 bg-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            {/* Owner English Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Owner English Name
              </label>
              <div className="group relative transition-all">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="owner_en_name"
                  name="owner_en_name"
                  value={formData.owner_en_name}
                  onChange={handleChange}
                  placeholder="Owner English Name"
                  disabled={isSubmitting}
                  className="w-full h-11 pl-12 pr-5 rounded-xl border border-gray-200 bg-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            {/* Owner Amharic Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Owner Amharic Name
              </label>
              <div className="group relative transition-all">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="owner_am_name"
                  name="owner_am_name"
                  value={formData.owner_am_name}
                  onChange={handleChange}
                  placeholder="Owner Amharic Name"
                  disabled={isSubmitting}
                  className="w-full h-11 pl-12 pr-5 rounded-xl border border-gray-200 bg-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("email")}
              </label>
              <div className="group relative transition-all">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@example.com"
                  disabled={isSubmitting}
                  className="w-full h-11 pl-12 pr-5 rounded-xl border border-gray-200 bg-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            {/* Phone 1 */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("phone")} 1
              </label>
              <div className="group relative transition-all">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="phone1"
                  name="phone1"
                  value={formData.phone1}
                  onChange={handleChange}
                  placeholder="Primary Phone"
                  disabled={isSubmitting}
                  className="w-full h-11 pl-12 pr-5 rounded-xl border border-gray-200 bg-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            {/* Phone 2 */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("phone")} 2
              </label>
              <div className="group relative transition-all">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="phone2"
                  name="phone2"
                  value={formData.phone2}
                  onChange={handleChange}
                  placeholder="Secondary Phone"
                  disabled={isSubmitting}
                  className="w-full h-11 pl-12 pr-5 rounded-xl border border-gray-200 bg-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            {/* TIN Number */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("tin_number")}
              </label>
              <div className="group relative transition-all">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="tin_number"
                  name="tin_number"
                  value={formData.tin_number}
                  onChange={handleChange}
                  placeholder="TIN Number"
                  disabled={isSubmitting}
                  className="w-full h-11 pl-12 pr-5 rounded-xl border border-gray-200 bg-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            {/* VAT Number */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("vat_number")}
              </label>
              <div className="group relative transition-all">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="vat_number"
                  name="vat_number"
                  value={formData.vat_number}
                  onChange={handleChange}
                  placeholder="VAT Number"
                  disabled={isSubmitting}
                  className="w-full h-11 pl-12 pr-5 rounded-xl border border-gray-200 bg-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            {/* Country */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("country")}
              </label>
              <div className="group relative transition-all">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  disabled={isSubmitting}
                  className="w-full h-11 pl-12 pr-5 rounded-xl border border-gray-200 bg-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            {/* City */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("city")}
              </label>
              <div className="group relative transition-all">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  disabled={isSubmitting}
                  className="w-full h-11 pl-12 pr-5 rounded-xl border border-gray-200 bg-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
            {/* Region */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                {t("region")}
              </label>
              <div className="group relative transition-all">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
            <input
              type="text"
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              placeholder="Region"
              disabled={isSubmitting}
              className="w-full h-11 pl-12 pr-5 rounded-xl border border-gray-200 bg-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
        </div>
        {/* Zone */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
            {t("zone")}
          </label>
          <div className="group relative transition-all">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
            <input
              type="text"
              id="zone"
              name="zone"
              value={formData.zone}
              onChange={handleChange}
              placeholder="Zone"
              disabled={isSubmitting}
              className="w-full h-11 pl-12 pr-5 rounded-xl border border-gray-200 bg-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
        </div>
        {/* Sub City */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
            {t("sub_city")}
          </label>
          <div className="group relative transition-all">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
            <input
              type="text"
              id="sub_city"
              name="sub_city"
              value={formData.sub_city}
              onChange={handleChange}
              placeholder="Sub City"
              disabled={isSubmitting}
              className="w-full h-11 pl-12 pr-5 rounded-xl border border-gray-200 bg-white outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-gray-900 font-medium disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
        </div>
        {/* Logo */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
            {t("logo")}
          </label>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="file"
                id="logo"
                name="logo"
                onChange={handleChange}
                accept="image/*"
                disabled={isSubmitting}
                className="hidden"
              />
              <label
                htmlFor="logo"
                className={`flex items-center justify-center gap-3 w-full h-14 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-emerald-500/50 transition-all cursor-pointer ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  {logoFile ? logoFile.name : (logoSrc ? 'Change Logo' : 'Upload Logo')}
                </span>
              </label>
            </div>
            {/* Logo Preview */}
            {(logoSrc || logoFile) && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="relative w-24 h-24">
                  <img
                    src={logoFile ? URL.createObjectURL(logoFile) : logoSrc}
                    alt="Company Logo"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoSrc(null);
                      setLogoFile(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Current Logo</p>
                  <p className="text-xs text-gray-500">{logoFile ? logoFile.name : logoSrc}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end pt-6 border-t border-muted">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 min-w-[120px]"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t("submitting...")}
            </div>
          ) : (
            buttonText
          )}
        </Button>
      </div>
      </form>
    </div>
    </div>
  );
};

export default CompanyProfile;