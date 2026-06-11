import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Modal,
  Box,
  FormControl,
  Select,
  TextField,
  InputLabel,
  MenuItem,
  Typography,
} from "@mui/material";
import { Button } from "@/components/ui/button";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import axiosInstance from "@/utils/axiosInstance";
import { t } from "i18next";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 3,
};

const updatePaymentStatus = async ({ id, data }) => {
  const response = await axiosInstance.patch(
    `${API_ENDPOINTS.ORDERS}/${id}`,
    data
  );
  return response.data;
};

const OrderPaymentStatusModal = ({
  open,
  onClose,
  selectedRowPayment,
  paymentStatus,
  setPaymentStatus,
  paidAmount,
  setPaidAmount,
}) => {
  const queryClient = useQueryClient();
  const unPaidAmount = selectedRowPayment.unpaid_amount;
  const isDisabled = unPaidAmount == 0.0;
  const [newPaymentAmount, setNewPaymentAmount] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  const mutation = useMutation({
    mutationFn: updatePaymentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order payment updated status successfully!");
      setIsUpdating(false);
      onClose();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.error
      );
      setIsUpdating(false);
    },
  });

  const handleSubmit = () => {
    setIsUpdating(true);
    const data = {
      payment_status: paymentStatus,
      paid_amount: newPaymentAmount,
    };
    mutation.mutate({ id: selectedRowPayment.id, data });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ ...modalStyle, width: 400 }}>
        <Typography variant="h6" component="h2">
          Update Payment Status
        </Typography>
        <span className="mb-4 mt-2  flex justify-end space-x-2 bg-gray-50">
          <span className="font-semibold text-gray-400">Customer Name:</span>{" "}
          <span className="text-black">
            {" "}
            {selectedRowPayment.customer_name}
          </span>
        </span>
        <FormControl fullWidth margin="normal">
          <InputLabel id="payment-status-label">Payment Status</InputLabel>
          <Select
            labelId="payment-status-label"
            value={paymentStatus}
            label="Payment Status"
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Unpaid">Unpaid</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="normal"
          label={t("current_paid_amount")}
          type="text"
          fullWidth
          value={paidAmount}
          disabled
          InputProps={{
            readOnly: true,
          }}
        />
        {paymentStatus !== "Paid" && (
          <TextField
            margin="normal"
            label={t("new_amount")}
            placeholder={t("new_amount")}
            type="number"
            fullWidth
            value={newPaymentAmount}
            onChange={(e) => setNewPaymentAmount(e.target.value)}
          />
        )}
        <div className="flex justify-end space-x-4 mt-4">
          <Button
            className="rounded-md border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100"
            onClick={onClose}
            disabled={isUpdating}
          >
            {t("cancel")}
          </Button>
          <Button
            className="bg-[#55B990] hover:bg-[#54ce9b] text-white px-4 py-2 rounded-md"
            onClick={handleSubmit}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : t("update_status")}
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default OrderPaymentStatusModal;
