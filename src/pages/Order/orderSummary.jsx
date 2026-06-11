import React from "react";
import { CreditCard } from "lucide-react";

const OrderSummary = ({
  items,
  calculateSubtotal,
  calculateVAT,
  calculateTotalAmount,
  calculateSubTotalWithoutReceipt,
  receipt,
  formatter,
  t,
}) => {
  return (
    <div className="space-y-4">
      <div className="h-[50vh] overflow-y-auto space-y-4 pr-2">
        {items
          .filter(
            (item) =>
              item.selectedProduct &&
              (item.quantity > 0 || item.package)
          )
          .map((item, index) => {
            const product = item.selectedVariant || item.selectedProduct;
            const quantity = item.package
              ? item.package * (product.piece || 1)
              : item.quantity;
            const unitPrice = item.unit_price || product.selling_price;
            const totalPrice = quantity * unitPrice;
            return (
              <div
                key={index}
                className="items-center w-full p-2 transition-all bg-white border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <p className="text-base font-semibold text-gray-900">
                    {product.name}
                    {item.selectedVariant && (
                      <span className="ml-1 text-xs text-gray-500">
                        ({item.selectedVariant.specification})
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    Qty: {quantity} × {formatter.format(unitPrice)}
                  </p>
                </div>
                <p className="text-lg font-bold text-right text-green-600">
                  {formatter.format(totalPrice)}
                </p>
              </div>
            );
          })}
      </div>
      <div className="pt-4 space-y-3 border-t">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">
            Number of Items
          </span>
          <span className="font-semibold text-gray-800">
            {
              items.filter(
                (item) =>
                  item.selectedProduct &&
                  (item.quantity > 0 || item.package)
              ).length
            }
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">Subtotal</span>
          <span className="font-semibold text-gray-800">
            {formatter.format(
              receipt === "No Receipt"
                ? calculateSubTotalWithoutReceipt()
                : calculateSubtotal()
            )}
          </span>
        </div>
        {receipt !== "No Receipt" && (
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">VAT</span>
            <span className="font-semibold text-gray-800">
              {formatter.format(calculateVAT())}
            </span>
          </div>
        )}
        <div className="flex justify-between pt-3 text-lg font-bold text-blue-600 border-t">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            <span>Total Amount</span>
          </div>
          <span>
            {formatter.format(
              receipt === "No Receipt"
                ? calculateSubTotalWithoutReceipt()
                : calculateTotalAmount()
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
