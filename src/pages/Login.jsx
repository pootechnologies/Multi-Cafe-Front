import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
import EmailVerificationModal from "@/components/EmailVerificationModal";
import Select from "react-select";
import { Lightbulb, Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight, Building2, User, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";
import {
  API_BASE_URL_LOGIN,
  API_ENDPOINTS,
} from "@/utils/apiConfig";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Registration States
  const [isRegistering, setIsRegistering] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [businessCategory, setBusinessCategory] = useState(null);
  const [businessCategories, setBusinessCategories] = useState([]);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess(false);
    setForgotLoading(true);

    try {
      await axios.post(
        `${API_BASE_URL_LOGIN}tenants/password/reset/`,
        { email: forgotEmail },
        { headers: { "Content-Type": "application/json" } }
      );
      setForgotSuccess(true);
      toast.success("Password reset link sent to your email!");
    } catch (error) {
      console.error("Error sending password reset:", error);
      setForgotError(error.response?.data?.detail || "Failed to send password reset link");
    } finally {
      setForgotLoading(false);
    }
  };

  // Fetch business categories on component mount
  useEffect(() => {
    const fetchBusinessCategories = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL_LOGIN}${API_ENDPOINTS.TENANT_BUSINESS_CATEGORIES}`
        );
        const categories = response.data.results.map((cat) => ({
          value: cat.id,
          label: cat.name,
        }));
        setBusinessCategories(categories);
      } catch (error) {
        console.error("Error fetching business categories:", error);
      }
    };
    fetchBusinessCategories();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_info");
      localStorage.removeItem("schema_name");
      localStorage.removeItem("isFirstLogin");
      localStorage.removeItem("tenant_groups");
      localStorage.removeItem("tenant_permissions");

      const loginResponse = await axiosInstance.post(
        `${API_BASE_URL_LOGIN}${API_ENDPOINTS.LOGIN_TENANT}`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const token = loginResponse?.data?.access;
      const refresh = loginResponse?.data?.refresh;
      const user = loginResponse?.data?.user;
      const tenants = loginResponse?.data?.tenants;
      const tenantGroups = loginResponse?.data?.tenant_groups;
      const tenantPermissions = loginResponse?.data?.tenant_permissions;

      if (!token) throw new Error("No access token received");

      localStorage.setItem("access_token", token);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user_info", JSON.stringify(user));
      localStorage.setItem("tenant_groups", JSON.stringify(tenantGroups || []));
      localStorage.setItem("tenant_permissions", JSON.stringify(tenantPermissions || []));

      if (tenants && tenants.length > 0) {
        localStorage.setItem("schema_name", tenants[0].schema_name);
      }
      navigate("/");
      window.location.reload();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Invalid credentials. Please check your email and password.";
      
      if (errorMessage === "Please verify your email before signing in") {
        setShowVerificationModal(true);
        setError("");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess(false);
    setRegisterLoading(true);

    try {
      const payload = {
        campany_name: companyName,
        business_category: businessCategory ? businessCategory.value : null,
        on_trial: true,
        owner: {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          email: registerEmail,
          password: registerPassword,
        },
      };

      await axios.post(
        `${API_BASE_URL_LOGIN}${API_ENDPOINTS.TENANT_PROVISION}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setRegisterSuccess(true);
      toast.success("Account created successfully!");
      
      // Auto transition to Sign In after success
      setTimeout(() => {
        setEmail(registerEmail);
        setPassword(registerPassword);
        setIsRegistering(false);
        setRegisterSuccess(false);
        setCompanyName("");
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
        setRegisterEmail("");
        setRegisterPassword("");
        setBusinessCategory(null);
        }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Failed to register. Please try again.";
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === "object") {
          errorMessage = Object.entries(error.response.data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
            .join(" | ");
        }
      }
      setRegisterError(errorMessage);
      toast.error("Registration failed!");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFF] dark:bg-slate-950">

      {/* Right side: Form Container */}
      <div className="w-full mx-auto lg:w-1/2 flex flex-col justify-between items-center p-6 sm:p-12 relative min-h-screen">
        {/* Invisible spacer to balance the footer and keep the form perfectly centered */}
        <div className="h-4 sm:h-8 shrink-0"></div>

        <div className="w-full max-w-[440px] my-auto space-y-10 py-6 animate-in fade-in slide-in-from-right-4 duration-700">

          {/* Mobile Logo (Visible on Mobile) */}
          <div className="lg:hidden flex flex-col items-center gap-4 mb-8">
            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Lightbulb className="text-white h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              PO'O <span className="text-blue-600">Technologies</span>
            </h2>
          </div>

          {!isRegistering ? (
            // Login Form View
            <div key="login-form" className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
              {!isForgotPassword ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                      <Sparkles className="h-4 w-4" />
                      <span>Platform Authentication</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Back.</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Please enter your details to access your account.</p>
                  </div>

                  {error && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl animate-in slide-in-from-top-2">
                      <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                        {error}
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                      <div className="group relative transition-all">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full h-14 pl-12 pr-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white font-medium"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
                      <div className="group relative transition-all">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full h-14 pl-12 pr-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white font-medium"
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setForgotEmail(email);
                            setError("");
                          }}
                          className="text-sm text-blue-600 font-bold hover:underline underline-offset-4"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg transition-all hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.98] shadow-xl shadow-slate-900/10 dark:shadow-none"
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <Spinner className="h-5 w-5 border-white dark:border-slate-900" />
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>Sign In</span>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      )}
                    </Button>
                  </form>

                  <div className="text-center animate-in fade-in duration-300">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      Don't have an account?{" "}
                      <button
                        onClick={() => {
                          setIsRegistering(true);
                          setError("");
                          setRegisterError("");
                        }}
                        className="text-blue-600 font-bold hover:underline underline-offset-4"
                      >
                        Get started
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                // Forgot Password Form View
                <div key="forgot-password-form" className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                      <Sparkles className="h-4 w-4" />
                      <span>Password Reset</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Forgot Password?</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Enter your email to receive a password reset link.</p>
                  </div>

                  {forgotError && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl animate-in slide-in-from-top-2">
                      <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                        {forgotError}
                      </p>
                    </div>
                  )}

                  {forgotSuccess ? (
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl animate-in slide-in-from-top-2 text-center">
                      <Mail className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                      <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Check your email</p>
                      <p className="text-emerald-600/70 dark:text-emerald-400/70 text-sm">
                        We've sent a password reset link to <span className="font-semibold">{forgotEmail}</span>
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                        <div className="group relative transition-all">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                          <input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="w-full h-14 pl-12 pr-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white font-medium"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={forgotLoading}
                        className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg transition-all hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.98] shadow-xl shadow-slate-900/10 dark:shadow-none"
                      >
                        {forgotLoading ? (
                          <div className="flex items-center gap-3">
                            <Spinner className="h-5 w-5 border-white dark:border-slate-900" />
                            <span>Sending...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span>Send Reset Link</span>
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        )}
                      </Button>
                    </form>
                  )}

                  <div className="text-center animate-in fade-in duration-300">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      Remember your password?{" "}
                      <button
                        onClick={() => {
                          setIsForgotPassword(false);
                          setForgotError("");
                          setForgotSuccess(false);
                        }}
                        className="text-blue-600 font-bold hover:underline underline-offset-4"
                      >
                        Back to Sign In
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Register Form View
            <div key="register-form" className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                  <Sparkles className="h-4 w-4" />
                  <span>Platform Registration</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Create Account.</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Register your new company account to begin.</p>
              </div>

              {registerError && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl animate-in slide-in-from-top-2">
                  <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                    {registerError}
                  </p>
                </div>
              )}

              {registerSuccess && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl animate-in slide-in-from-top-2">
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    Account provisioned successfully! Redirecting to sign in...
                  </p>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Company Name</label>
                  <div className="group relative transition-all">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full h-14 pl-12 pr-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white font-medium"
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Business Category</label>
                  <Select
                    value={businessCategory}
                    onChange={setBusinessCategory}
                    options={businessCategories}
                    placeholder="Select business category"
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '56px',
                        borderRadius: '16px',
                        border: '1px solid rgb(226 232 240)',
                        '&:hover': { borderColor: 'rgb(59 130 246)' },
                        backgroundColor: 'rgb(255 255 255)',
                        boxShadow: 'none',
                      }),
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">First Name</label>
                    <div className="group relative transition-all">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full h-14 pl-12 pr-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white font-medium"
                        placeholder="First name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Last Name</label>
                    <div className="group relative transition-all">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full h-14 pl-12 pr-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white font-medium"
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
                  <div className="group relative transition-all">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full h-14 pl-12 pr-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white font-medium"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                  <div className="group relative transition-all">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full h-14 pl-12 pr-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white font-medium"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
                  <div className="group relative transition-all">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full h-14 pl-12 pr-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white font-medium"
                      placeholder="Create a password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={registerLoading || registerSuccess}
                  className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg transition-all hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.98] shadow-xl shadow-slate-900/10 dark:shadow-none"
                >
                  {registerLoading ? (
                    <div className="flex items-center gap-3">
                      <Spinner className="h-5 w-5 border-white dark:border-slate-900" />
                      <span>Provisioning...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Create Account</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center animate-in fade-in duration-300">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setIsRegistering(false);
                      setError("");
                      setRegisterError("");
                    }}
                    className="text-blue-600 font-bold hover:underline underline-offset-4"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Info */}
        <div className="w-full max-w-[440px] px-6 pt-6 text-center shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; 2026 PO'O TECHNOLOGIES. All rights reserved.
          </p>
        </div>
      </div>

      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={email}
      />
    </div>
  );
};

export default LoginPage;