import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle, Send, CheckCircle, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL_LOGIN } from "@/utils/apiConfig";

const EmailVerificationModal = ({ isOpen, onClose, email }) => {
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleResendEmail = async () => {
    setIsSending(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL_LOGIN}tenants/email/resend/`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );
      setEmailSent(true);
      setCountdown(60);
      setSuccessMessage(response.data.message || "Verification email sent successfully!");
      toast.success("Verification email sent successfully!");
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast.error(error.response?.data?.detail || "Failed to send verification email");
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenEmail = () => {
    window.open("https://gmail.com", "_blank");
  };

  const handleClose = () => {
    setEmailSent(false);
    setCountdown(0);
    setSuccessMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <Mail className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="text-2xl font-bold">Email Verification Required</DialogTitle>
            <DialogDescription className="text-base">
              Please verify your email address before signing in to access your account.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="py-4">
          {!emailSent && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Your email is not verified</p>
                  <p className="text-muted-foreground mt-1">
                    We sent a verification link to <span className="font-semibold">{email}</span>. 
                    Please check your inbox and click the link to verify your account.
                  </p>
                </div>
              </div>
            </div>
          )}

          {emailSent && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">Email sent successfully!</p>
                  <p className="text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          {emailSent && (
            <Button
              onClick={handleOpenEmail}
              className="w-full sm:w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-11"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Open Email to Verify</span>
              </div>
            </Button>
          )}
          <Button
            onClick={handleResendEmail}
            disabled={isSending || countdown > 0}
            className="w-full sm:w-full bg-amber-600 hover:bg-amber-700 text-white font-medium h-11"
          >
            {isSending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending...</span>
              </div>
            ) : countdown > 0 ? (
              <div className="flex items-center gap-2">
                <span>Resend in {countdown}s</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                <span>Resend Verification Email</span>
              </div>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-full h-11"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailVerificationModal;
