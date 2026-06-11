import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination } from "@mui/material";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "@/utils/apiConfig";
import { getBaseURL, getImageBaseURL } from "@/utils/urlHelper";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { formatTimestamp } from "@/utils/timeFormater";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Font,
  Image,
  pdf,
} from "@react-pdf/renderer";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { TextField } from "@mui/material";
import { convertToWordsWithCurrency } from "@/utils/useNumberToWords";
import { t } from "i18next";
import ethioFont from "../../assets/ethioFont.ttf";
import RobotoRegular from "../../assets/roboto-regular-webfont.ttf";
import RobotoBold from "../../assets/roboto-bold-webfont.ttf";
import RobotoItalic from "../../assets/roboto-italic-webfont.ttf";
import AddOrderModal from "./AddOrderModal";
import OrderLogsModal from "./OrderLogsModal";
import OrderPaymentStatusModal from "./OrderPaymentStatusModal";
import OrderDetailModal from "./OrderDetailModal";
import DownloadConfirmationModal from "./DownloadConfirmationModal";
import ReceiptPosPDF from "./ReceiptPosPDF";
import Select from "react-select";
import {
  MoreVertical,
  FileText,
  ReceiptText,
  Eye,
  ActivitySquare,
  BadgeCheck,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Hash,
  User,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShoppingCart,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";

// Register fonts for PDF
Font.register({
  family: "Roboto",
  fonts: [
    { src: RobotoRegular, fontWeight: "normal" },
    { src: RobotoBold, fontWeight: "bold" },
    { src: RobotoItalic, fontWeight: "normal", fontStyle: "italic" },
  ],
});

Font.register({
  family: "ethio",
  src: ethioFont,
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    backgroundColor: "#fff",
    flexDirection: "column",
    position: "relative",
  },
  header: {
    paddingBottom: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  header1: {
    marginTop: 5,
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: "5",
    fontSize: 10,
    color: "#000",
    marginBottom: 3,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#000",
    maxWidth: "340px",
    marginLeft: 6,
  },
  companyInfo: {
    fontSize: 10,
    color: "#000",
    marginBottom: 3,
  },
  companyInfoPhone: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 3,
    marginLeft: 6,
  },
  documentTitleTax: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "ethio",
    marginTop: 10,
  },
  customerInfo: {
    marginTop: 10,
    marginBottom: 20,
  },
  customerName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 3,
  },
  date: {
    fontSize: 10,
    color: "#000",
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  tableContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  table: {
    display: "table",
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    marginTop: 3,
    marginVertical: 5,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableCol1: {
    width: "8%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol2: {
    width: "50%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableColNew: {
    width: "15%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol3: {
    width: "15%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol4: {
    width: "20%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol5: {
    width: "20%",
    padding: 2,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCol6: {
    width: "20%",
    padding: 2,
  },
  headerCellContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCellNumber: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 2,
    fontFamily: "ethio",
  },
  headerCellLabel: {
    fontSize: 8,
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 8,
    color: "#000",
    borderStyle: "solid",
    fontFamily: "ethio",
  },
  tableCellRight: {
    fontSize: 8,
    color: "#000",
    borderStyle: "solid",
    textAlign: "right",
  },
  summarySection: {
    paddingRight: 14,
    breakBefore: "auto",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 3,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 8,
    // fontWeight: "bold",
    color: "#000",
    fontFamily: "ethio",
  },
  summaryValue: {
    fontSize: 8,
    color: "#000",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    paddingTop: 5,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
    fontFamily: "ethio",
  },
  totalValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000",
  },
  vatValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000",
  },
  vatLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  amountInWords: {
    fontSize: 10,
    marginTop: 10,
    fontStyle: "italic",
    color: "#000",
  },
  validitySection: {
    marginTop: 20,
    fontSize: 10,
    color: "#000",
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#9ca3af",
    width: 150,
    marginTop: 5,
  },
  signatureText: {
    fontSize: 10,
    textAlign: "center",
    color: "#000",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#000",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  watermark: {
    position: "absolute",
    top: "800%",
    left: "-10%",
    transform: "translate(-50%, -50%) rotate(-45deg)",
    opacity: 0.3,
    fontSize: 50,
    color: "#9ca3af",
    fontWeight: "bold",
    zIndex: -1,
    whiteSpace: "nowrap",
    width: "400",
  },
  receipt: {
    width: "80mm",
    fontSize: 8,
    fontFamily: "Roboto",
    border: "1px solid black",
    padding: 10,
  },
  headerText: {
    fontSize: 8,
  },
  headerBold: {
    fontSize: 8,
    fontWeight: "bold",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 6,
  },
  itemHeader: {
    fontWeight: "bold",
    marginTop: 2,
    fontSize: 10,
  },
  dashedBorder: {
    borderTop: "1px dashed #000",
    margin: "4px 0",
  },
  footerText: {
    fontSize: 6,
    fontWeight: "bold",
  },
  customFooter: {
    position: "absolute",
    bottom: 250,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#000000ff",
    padding: 10,
  },
});

const Watermark = () => (
  <View style={styles.watermark}>
    <Text>ATTACHMENT</Text>
  </View>
);

const MyDoc = ({
  order,
  products,
  companyData,
  receiptData,
  orderFourDegit,
}) => {
  const orderID = receiptData?.order_details.order_id;
  const customer = receiptData?.customer;
  const hasReceipt = order?.receipt === "Receipt";
  const itemsPerFirstPage = hasReceipt ? 15 : 25;
  const itemsPerPage = 30;

  const itemChunks = [];
  if (order.items.length > 0) {
    itemChunks.push(order.items.slice(0, itemsPerFirstPage));

    const remainingItems = order.items.slice(itemsPerFirstPage);

    let currentChunk = [];
    remainingItems.forEach((item, index) => {
      currentChunk.push(item);
      if (currentChunk.length >= itemsPerPage) {
        itemChunks.push(currentChunk);
        currentChunk = [];
      }
    });

    if (currentChunk.length > 0) {
      itemChunks.push(currentChunk);
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "numeric", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const showWatermark = order.vat !== "0.00";

  return (
    <Document>
      {itemChunks.map((chunk, chunkIndex) => (
        <Page
          key={chunkIndex}
          size="A5"
          style={{ fontSize: "8px", marginTop: chunkIndex > 0 ? 20 : 0 }}
        >
          {chunkIndex === 0 && (
            <>
              <View
                style={[
                  styles.header,
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    paddingLeft: 10,
                    paddingRight: 10,
                    marginBottom: 0,
                    paddingBottom: 0,
                  },
                ]}
              >
                <Image
                  style={{ width: 80, height: 60 }}
                  src={`${getImageBaseURL()}${companyData?.logo}`}
                />
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "80%",
                  }}
                >
                  {showWatermark && order.items.length <= 10 && <Watermark />}
                  <Text
                    style={{ fontFamily: "ethio", marginLeft: 6, fontSize: 9 }}
                  >
                    {companyData?.am_name}
                  </Text>
                  <Text style={styles.companyName}>
                    {companyData?.en_name || ""}
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.companyInfoPhone}>
                      {companyData?.phone1} {" / "} {companyData?.phone2}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginRight: 19,
                }}
              >
                <View
                  style={{
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    gap: 1,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 8,
                      textDecoration: "underline",
                    }}
                  >
                    ቀን: {formatDate(order.order_date)}
                  </Text>
                  <Text style={{ fontFamily: "ethio", fontSize: 8 }}>Date</Text>
                </View>
              </View>
              {hasReceipt && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: 2,
                    gap: 4,
                    marginRight: 31,
                  }}
                >
                  <Text style={{ fontFamily: "ethio", fontSize: 8 }}>No:</Text>
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 8,
                      color: "red",
                      marginRight: 7,
                    }}
                  >
                    {orderFourDegit ? orderFourDegit : " "}
                  </Text>
                </View>
              )}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 9,
                    fontWeight: "bold",
                    textDecoration: "underline",
                  }}
                >
                  {order.vat > 0 ? "Attachment Cash Invoice" : "Cash Invoice"}
                </Text>
              </View>

              {showWatermark && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginTop: 10,
                    width: "100%",
                    gap: 4,
                    paddingLeft: 15,
                    paddingRight: 15,
                  }}
                >
                  <View style={{ width: "47%" }}>
                    <Text
                      style={{
                        fontFamily: "ethio",
                        fontSize: 8,
                        textDecoration: "underline",
                      }}
                    >{`ከ፦ ${companyData?.owner_am_name ?? ""}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      {`From፦ ${companyData?.owner_en_name ?? ""}`}
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`አድራሻ:- ${companyData?.region ?? ""} ዞን:-${companyData?.zone ?? ""
                      } ከተማ:-${companyData?.city ?? ""} ክ/ከተማ:- ${companyData?.sub_city ?? ""
                      }`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Addr.Reg Zone City Subcity
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የታክስ መለያ ቁጥር፦ ${companyData?.tin_number ?? ""}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Supplier tin No
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የሻጭ ተ.አ.ታ.ቁ፦ ${companyData?.vat_number ?? ""}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Supplier Vat No
                    </Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      የተመዘገበበት ቀን ___________
                    </Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Date of Reg
                    </Text>
                  </View>

                  <View>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>{`ለ፦ ${customer?.name ?? ""
                      }`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>To</Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የተ.አ.ታ.ቁ፦ ${customer?.vat_number ?? ""}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Customer Vat No
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የግብር ከፋይ ታክስ መ/ቁ፦ ${customer?.tin_number ?? ""}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Customer Tin No
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የፊዝካል ደ.ቁ፦ ${customer?.customer_fs ?? ""}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Fs No
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}

          <View style={styles.tableContainer} breakBefore="avoid">
            {showWatermark && order.items.length > 10 && (
              <View
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "20%",
                  transform: "translate(-50%, -50%) rotate(-45deg)",
                  opacity: 0.3,
                  fontSize: 50,
                  color: "#9ca3af",
                  fontWeight: "bold",
                  zIndex: -1,
                  whiteSpace: "nowrap",
                  width: "400",
                }}
              >
                <Text>ATTACHMENT</Text>
              </View>
            )}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <View style={styles.tableCol1}>
                  <View style={styles.headerCellContent}>
                    <Text style={styles.headerCellNumber}>ተ.ቁ</Text>
                    <Text style={styles.headerCellLabel}>No</Text>
                  </View>
                </View>
                <View style={styles.tableCol2}>
                  <View style={styles.headerCellContent}>
                    <Text style={styles.headerCellNumber}>የእቃው አይነት</Text>
                    <Text style={styles.headerCellLabel}>Description</Text>
                  </View>
                </View>
                <View style={styles.tableCol3}>
                  <View style={styles.headerCellContent}>
                    <Text style={styles.headerCellNumber}>መለኪያ</Text>
                    <Text style={styles.headerCellLabel}>Unit</Text>
                  </View>
                </View>
                <View style={styles.tableCol3}>
                  <View style={styles.headerCellContent}>
                    <Text style={styles.headerCellNumber}>ብዛት</Text>
                    <Text style={styles.headerCellLabel}>Quantity</Text>
                  </View>
                </View>
                <View style={styles.tableCol5}>
                  <View style={styles.headerCellContent}>
                    <Text style={styles.headerCellNumber}>የአንድ ዋጋ</Text>
                    <Text style={styles.headerCellLabel}>Unit Price</Text>
                  </View>
                </View>
                <View style={styles.tableCol6}>
                  <View style={styles.headerCellContent}>
                    <Text style={styles.headerCellNumber}>ጠቅላላ ዋጋ</Text>
                    <Text style={styles.headerCellLabel}>Total Price</Text>
                  </View>
                </View>
              </View>
              {chunk.map((item, index) => {
                const product = products.find(
                  (product) => product.id === item.product
                );
                return (
                  <View key={index} style={[styles.tableRow]}>
                    <View style={styles.tableCol1}>
                      <Text style={styles.tableCell}>
                        {index +
                          1 +
                          (chunkIndex > 0
                            ? itemsPerFirstPage +
                            (chunkIndex - 1) * itemsPerPage
                            : 0)}
                      </Text>
                    </View>
                    <View style={styles.tableCol2}>
                      <Text style={styles.tableCell}>
                        {item.product ?? "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableColNew}>
                      <Text style={styles.tableCell}>{item.unit}</Text>
                    </View>
                    <View style={styles.tableCol3}>
                      <Text style={styles.tableCell}>{item.quantity}</Text>
                    </View>
                    <View style={styles.tableCol4}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(item.product_price)}
                      </Text>
                    </View>
                    <View style={styles.tableCol5}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(item.price)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {chunkIndex === itemChunks.length - 1 && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 10,
                  alignContent: "flex-start",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 8,
                      marginLeft: 10,
                      maxWidth: 230,
                    }}
                  >
                    Amount in Words:{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      {" "}
                      {convertToWordsWithCurrency(order.total_amount)}
                    </Text>
                  </Text>
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 8,
                      marginTop: 2,
                      marginLeft: 10,
                    }}
                  >
                    Other memo or reason for refund____________
                  </Text>
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 8,
                      marginTop: 2,
                      marginLeft: 10,
                    }}
                  >
                    Buyer's signture______ Seller's signture______
                  </Text>
                </View>

                <View style={styles.summarySection}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>ጠቅላላ ድምር Total:</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(
                        order.items.reduce((acc, item) => acc + item.price, 0)
                      )}{" "}
                      ETB
                    </Text>
                  </View>
                  {showWatermark && (
                    <View style={styles.totalRow}>
                      <Text style={styles.summaryLabel}>ተ.እ.ታ VAT (15%):</Text>
                      <Text style={styles.vatValue}>
                        {formatCurrency(order.vat)} ETB
                      </Text>
                    </View>
                  )}
                  {showWatermark && (
                    <View style={styles.totalRow}>
                      <View style={{ flexDirection: "column" }}>
                        <Text style={styles.summaryLabel}>
                          ጠቅላላ ዋጋ ተ.እ.ታ ጨምሮ
                        </Text>
                        <Text style={styles.summaryLabel}>
                          Selling Price(Inc.VAT):
                        </Text>
                      </View>

                      <Text style={styles.totalValue}>
                        {formatCurrency(order.total_amount)} ETB
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </>
          )}

          <View style={styles.customFooter}>
            <Text>Powered By Po'o Technologies</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};



const PDFModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-4xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-400 hover:bg-red-300 text-white py-2 px-4 rounded-lg"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-md">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-300">
          {t("confirm_update")}
        </h2>
        <p>{t("do_you_to_update")}</p>
        <div className="flex justify-end mt-4 space-x-5">
          <div className="flex justify-end mt-4 space-x-5">
            <button
              onClick={onConfirm}
              className="bg-[#55B990] hover:bg-[#54ce9b] text-white px-4 py-2 rounded-md"
            >
              {t("yes")}
            </button>
            <button
              onClick={onClose}
              className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
            >
              {t("no")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedStatus,
  setSelectedStatus,
  selectedOrderForStatus,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-md">
        <h2 className="text-xl font-bold  border-b pb-2 border-gray-300">
          {t("update_status")}
        </h2>{" "}
        <span className="mb-4 mt-2  flex justify-end space-x-1 bg-gray-50">
          <span className="font-semibold text-gray-400">Customer Name:</span>{" "}
          <span className="text-black">
            {" "}
            {selectedOrderForStatus.customer_name}
          </span>
        </span>
        <div className="mb-4">
          <label className="block minline-blockb-2 font-bold mt-2 mb-2">
            {t("status")}
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="Done">{t("done")}</option>
            <option value="Cancelled">{t("cancelled")}</option>
          </select>
        </div>
        <div className="flex justify-end mt-4 space-x-5">
          <button
            onClick={onConfirm}
            className="bg-[#55B990] hover:bg-[#54ce9b] text-white px-4 py-2 rounded-md"
          >
            {t("update")}
          </button>
          <button
            onClick={onClose}
            className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md mr-2"
          >
            {t("cancel")}
          </button>
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
          <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400"><Trash2 className="h-5 w-5" /></div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("are_you_sure")}</h2>
        </div>
      </div>
      <div className="p-6"><p className="text-slate-600 dark:text-slate-400">{t("sure_discription")}</p></div>
      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
        <Button onClick={onCancel} className="rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 px-6">{t("cancel")}</Button>
        <Button onClick={onConfirm} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-6">{t("delete")}</Button>
      </div>
    </div>
  </div>
);

function ManageOrder() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const modalItemsPerPage = 5;
  const [isVisible, setIsVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [filters, setFilters] = useState({
    customerName: "",
    orderDate: "",
    totalAmount: "",
  });
  const [showPDF, setShowPDF] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [receiptPosData, setReceiptPosData] = useState(null);
  const [showReceiptPosModal, setShowReceiptPosModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false); // State for AddOrderModal
  const [showOrderLogModal, setShowOrderLogModal] = useState(false);
  const [showOrderDeleteModal, setShowOrderDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [selectedRowOrder, setSelectedRowOrder] = useState();
  const [selectedOrderId, setSelectedOrderId] = useState();
  const [
    showSelectedOrderPaymentStatusModal,
    setShowSelectedOrderPaymentStatusModal,
  ] = useState(false);

  const [selectedRowPayment, setSelectedRowPayment] = useState();
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paidAmount, setPaidAmount] = useState("");

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSimplifiedView, setIsSimplifiedView] = useState(true);
  const [orderFourDegit, setOrderFourDegit] = useState();
  const [showDownloadConfirmation, setShowDownloadConfirmation] =
    useState(false);
  const [orderToDownload, setOrderToDownload] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10; // Match your backend page size

  // Add this function to toggle the view mode
  const toggleView = () => {
    setIsSimplifiedView(!isSimplifiedView);
  };

  const fetchOrders = async ({ pageSize, page, search }) => {
    let url = `${getBaseURL()}${API_ENDPOINTS.ORDERS}?page=${page}&page_size=${pageSize}`;
    if (search) {
      url += `&search="${search}"`;
    }
    const response = await axiosInstance.get(url);
    setTotalPages(Math.ceil(response.data.count / pageSize));
    return response.data.results || response.data || [];
  };

  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders", page, searchTerm],
    queryFn: () =>
      fetchOrders({ pageSize: PAGE_SIZE, page, search: searchTerm }),
    keepPreviousData: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const handleAddOrderClick = () => {
    setShowAddOrderModal(true);
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const queryClient = useQueryClient();

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () =>
      axiosInstance
        .get(API_ENDPOINTS.PRODUCTS)
        .then((res) => res?.data?.all_results),
    staleTime: 0,
  });

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axiosInstance.get(API_ENDPOINTS.COMPANY);

        setCompanyData(response.data[0]);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchCompanyData();
  }, []);

  // fetch customers

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_ENDPOINTS.CUSTOMERS}?include_all=True`
        );

        setCustomers(response?.data?.all_results);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);


  const deleteOrderMutation = useMutation({
    mutationFn: (orderId) =>
      axiosInstance.delete(`${API_ENDPOINTS.ORDERS}/${orderId}`),
    onSuccess: () => {
      toast.success("Order deleted successfully!");
      queryClient.invalidateQueries(["orders"]);
      setShowOrderDeleteModal(false);
      setOrderToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete order!");
      console.error("Delete order error:", error);
    },
  });

  const handleDeleteOrderClick = (order) => {
    setOrderToDelete(order.id);
    setShowOrderDeleteModal(true);
  };

  const handleConfirmOrderDelete = () => {
    if (orderToDelete) {
      deleteOrderMutation.mutate(orderToDelete);
    }
  };

  const updateProductMutation = useMutation({
    mutationFn: (updatedProduct) =>
      axiosInstance.patch(
        `${API_ENDPOINTS.ORDERITEMS}/${updatedProduct.id}`,
        updatedProduct
      ),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries(["orders"]);
      setEditProduct(null);
    },
    onError: () => {
      toast.error("Failed to update product!");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (updatedOrder) =>
      axiosInstance.patch(
        `${API_ENDPOINTS.ORDERS}/${updatedOrder.orderId}`,
        updatedOrder
      ),
    onSuccess: () => {
      toast.success("Order status updated successfully!");
      queryClient.invalidateQueries(["orders"]);
      setSelectedOrderForStatus(null);
      setSelectedStatus("");
    },
    onError: () => {
      toast.error("Failed to update order status!");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId) =>
      axiosInstance.delete(`${API_ENDPOINTS.ORDERITEMS}/${productId}`),
    onSuccess: (data, variables) => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries(["orders"]);
      // Check if the response contains number_of_items and it's <= 0
      if (data?.data?.number_of_items <= 0) {
        setShowOrderModal(false); // Close the modal
        setSelectedOrder(null);
      }
    },
    onError: (error) => {
      toast.error("Failed to delete product!");
      console.error("Delete error:", error);
    },
  });

  const showOrderDetails = (order) => {
    navigate(`/order-detail/${order.id}`);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setEditProduct(null);
    setSelectedItem(null);
    setShowOrderModal(false);
    setShowPDF(false);
    setShowConfirmationModal(false);
    setShowStatusModal(false);
    setShowReceiptPosModal(false);
    setShowDeleteModal(false);
  };

  const closeModalAdd = () => {
    setShowAddOrderModal(false);
  };

  const closeModalOrderLog = () => {
    setShowOrderLogModal(false);
  };

  const closeOrderPaymentStatus = () => {
    setShowSelectedOrderPaymentStatusModal(false);
  };

  const handleProductUpdate = () => {
    const updatedProducts = orderItems.map((item) => {
      if (item.id === editProduct.id) {
        return {
          quantity: editProduct.quantity,
          unit_price: editProduct.unit_price,
          status: editProduct.status,
        };
      }
      return item;
    });
    setOrderItems(updatedProducts);
    setEditProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    // Do NOT update local state here
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const handleUpdateSubmit = (data) => {
    const updatedProduct = {
      id: editProduct.id,
      unit_price: data.unit_price,
      quantity: data.quantity,
      status: data.status,
    };
    setEditProduct(updatedProduct);
    setShowConfirmationModal(true);
  };

  const handleConfirmUpdate = () => {
    if (editProduct) {
      updateProductMutation.mutate(editProduct);
      setShowConfirmationModal(false);
      setEditProduct(null);
    }
  };

  const handleDeleteSubmit = (productId) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const showItemDetails = (item) => {
    setSelectedItem(item);
  };

  const handleSearch = (term) => {
    const searchTerm = term === "All" ? "" : term || "";
    setSearchTerm(searchTerm);
    setPage(1); // Reset to first page on new search
  };


  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const sortedOrders = orders?.sort(
    (a, b) => new Date(b.order_date) - new Date(a.order_date)
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredOrders = sortedOrders?.filter((order) => {
    const customerName = String(order?.customer || "N/A").toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    const customerNameFilter = String(filters.customerName || "").toLowerCase();

    const matchesSearch = customerName.includes(searchTermLower);
    const matchesCustomerName = customerName.includes(customerNameFilter);

    return matchesSearch && matchesCustomerName;
  });

  const pageCount = Math.ceil(filteredOrders?.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const modalPageCount = Math.ceil(orderItems?.length / modalItemsPerPage);
  const displayModalItems = orderItems?.slice(
    (modalCurrentPage - 1) * modalItemsPerPage,
    modalCurrentPage * modalItemsPerPage
  );

  const handleModalPageChange = (event, value) => {
    setModalCurrentPage(value);
  };

  const productMap = products?.reduce((map, product) => {
    map[product.id] = product.name;
    return map;
  }, {});

  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (editProduct) {
      // setValue("price", editProduct.price);
      setValue("quantity", editProduct.quantity);
      setValue("unit_price", editProduct.unit_price);
      setValue("status", editProduct.status);
    }
  }, [editProduct, setValue]);

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

  const isLoading = isLoadingOrders || isLoadingProducts;

  const handleGeneratePDF = async (order) => {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.RECEIPT}${order.id}/receipt/`
      );

      const receipt = response.data;

      setReceiptData(receipt);

      const updatedOrder = {
        ...order,
        customer: receipt?.customer?.name,
        items: receipt.items.map((item) => ({
          ...item,
          product: item.product_name,
        })),
        total_amount: receipt.order_details.total_amount,
        order_date: receipt.order_details.date,
        status: receipt.order_details.status,
      };

      setSelectedOrder(updatedOrder);

      if (isMobile) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setOrderToDownload(updatedOrder);
        setShowDownloadConfirmation(true);
      } else {
        setShowPDF(true);
      }
    } catch (error) {
      console.error("Error fetching receipt data:", error);
    }
  };

  const handleConfirmDownload = async () => {
    if (orderToDownload) {
      const blob = await pdf(
        <MyDoc
          orderFourDegit={orderFourDegit}
          order={orderToDownload}
          products={products}
          companyData={companyData}
          receiptData={receiptData}
        />
      ).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const customerName = orderToDownload?.customer || "customer";
      const orderDate = formatTimestamp(orderToDownload?.order_date);
      link.download = `Receipt_${customerName}_${orderDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowDownloadConfirmation(false);
      setOrderToDownload(null);
    }
  };

  const handleShowReceiptPos = async (order) => {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.RECEIPT}${order.id}/receipt/`
      );

      const receiptData = response.data;
      const formattedOrder = {
        ...receiptData.order_details,
        id: receiptData.order_details.order_id,
        order_date: receiptData.order_details.date,
        items: receiptData.items
      };

      if (isMobile) {
        const blob = await pdf(
          <ReceiptPosPDF order={formattedOrder} companyData={receiptData.company} />
        ).toBlob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `receipt_pos_${order.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setReceiptPosData({ order: formattedOrder, companyData: receiptData.company });
        setShowReceiptPosModal(true);
      }
    } catch (error) {
      console.error("Error fetching POS receipt data:", error);
    }
  };

  const handleStatusUpdate = () => {
    if (selectedOrderForStatus) {
      const orderId = selectedOrderForStatus.id;

      const updatedOrder = {
        orderId: orderId,
        status: selectedStatus,
      };
      updateStatusMutation.mutate(updatedOrder);
      setShowStatusModal(false);
    }
  };

  // Define simplified columns
  const simplifiedColumns = [
    { field: "id", headerName: t("id"), width: 100 },
    { field: "customer", headerName: t("customer_name"), width: 130 },
    { field: "order_date", headerName: t("order_date"), width: 110 },
    { field: "total_amount", headerName: t("total_amount"), width: 130 },

    {
      field: "payment_status",
      headerName: t("payment_status"),
      width: 150,
      renderCell: (params) => {
        const status = params.value;

        let color = "";
        switch (status) {
          case "Paid":
            color = "green";
            break;
          case "Pending":
            color = "orange";
            break;
          case "Unpaid":
            color = "red";
            break;
          default:
            color = "gray";
        }

        return <span style={{ color, fontWeight: "bold" }}>{status}</span>;
      },
    },
    {
      field: "actions",
      headerName: t("actions"),
      width: 150,
      renderCell: (params) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                setSelectedOrderId(params.row.actions.id);
                showOrderDetails(params.row.actions);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              {t("view")}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                setSelectedOrderId(params.row.actions.id);
                handleGeneratePDF(params.row.actions);
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              {t("receipt")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const columns = [
    { field: "id", headerName: t("id"), width: 50 },
    { field: "customer", headerName: t("customer_name"), width: 130 },
    { field: "order_date", headerName: t("order_date"), width: 110 },
    { field: "number_of_items", headerName: t("ordered_items"), width: 105 },
    { field: "sub_total", headerName: t("sub_total"), width: 130 },
    { field: "total_amount", headerName: t("total_amount"), width: 130 },
    {
      field: "payment_status",
      headerName: t("payment_status"),
      width: 150,
      renderCell: (params) => {
        const status = params.value;
        let color = "";
        switch (status) {
          case "Paid":
            color = "green";
            break;
          case "Pending":
            color = "orange";
            break;
          case "Unpaid":
            color = "red";
            break;
          default:
            color = "gray";
        }
        return <span style={{ color, fontWeight: "bold" }}>{status}</span>;
      },
    },
    { field: "paid_amount", headerName: t("paid_amount"), width: 130 },
    {
      field: "status",
      headerName: t("status"),
      width: 110,
      renderCell: (params) => {
        const statusColor =
          params.value === "Pending"
            ? "orange"
            : params.value === "Done"
              ? "green"
              : "red";
        return (
          <span
            style={{
              backgroundColor: statusColor,
              color: "white",
              padding: "4px 4px",
              borderRadius: "4px",
              minWidth: "100%",
              height: 40,
            }}
          >
            {params.value
              ? params.value === "Done" &&
                params.row.actions.item_pending !== null &&
                params.row.actions.item_pending !== 0
                ? `${params.value} `
                : params.value
              : ""}
          </span>
        );
      },
    },
    { field: "user", headerName: t("created_by"), width: 110 },
    {
      field: "actions",
      headerName: t("actions"),
      width: 150,
      renderCell: (params) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                setSelectedOrderId(params.row.actions.id);
                showOrderDetails(params.row.actions);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              {t("view")}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                setSelectedOrderId(params.row.actions.id);
                handleGeneratePDF(params.row.actions);
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              {t("receipt")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  const rows = orders?.map((order) => ({
    id: order.id,
    customer: order.customer_name || "N/A",
    order_date: formatTimestamp(order.order_date),
    receipt: order.receipt,
    sub_total: order.sub_total, // Use the exact value from API
    vat: order.vat, // Use the exact value from API
    number_of_items: order.number_of_items,
    status: order.status,
    total_amount: order.total_amount, // Use the exact value from API
    payment_status: order.payment_status,
    paid_amount: order.paid_amount, // Use the exact value from API
    unpaid_amount: order.unpaid_amount, // Use the exact value from API
    user: order.user,
    vat_type: order.vat_type, // Include vat_type if needed
    receipt_id: order.receipt_id, // Include receipt_id if needed
    actions: order,
  }));

  return (
    <div className="px-5 mt-10 md:mt-0 min-h-[calc(100vh-4rem)] bg-slate-50/30 dark:bg-background md:p-8 lg:p-12 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="w-full mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 tracking-tight">
              {t("manage_orders")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl leading-relaxed">
              Monitor and manage all customer orders. Update status, track payments, and generate receipts.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              {/* <div className="relative flex items-center gap-2 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-xl px-3 h-12 shadow-sm w-full sm:w-64">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <Select
                  isClearable
                  id="customer-name"
                  options={[
                    { label: t("all_customers"), value: "" },
                    ...customers.map((customer) => ({
                      label: customer.name,
                      value: customer.name,
                    })),
                  ]}
                  placeholder={t("search_by_customer...")}
                  onChange={(selectedOption) => {
                    handleSearch(selectedOption ? selectedOption.value : "");
                  }}
                  value={
                    searchTerm
                      ? {
                        label: searchTerm,
                        value: searchTerm,
                      }
                      : null
                  }
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'transparent',
                      border: 'none',
                      boxShadow: 'none',
                      '&:hover': { border: 'none' },
                      minHeight: 'auto',
                      height: '100%',
                      width: '100%',
                    }),
                    container: (base) => ({
                      ...base,
                      width: '100%',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: 'inherit',
                      fontSize: '0.875rem',
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      zIndex: 50,
                    })
                  }}
                  className="flex-1 text-sm"
                />
              </div> */}
              <Button
                variant="outline"
                onClick={toggleView}
                className="hidden md:flex bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 rounded-xl h-12 px-4 font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-800  items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">{isSimplifiedView ? t("detailed") : t("simplified")}</span>
              </Button>
            </div>
            {/* <Button
              onClick={() => { setShowAddOrderModal(true); }}
              className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 rounded-xl h-12 px-6 font-semibold"
            >
              <Plus className="h-5 w-5" />
              New Order
            </Button> */}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-200/60 dark:border-slate-800 overflow-hidden relative">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100/80 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">ID</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">CUSTOMER</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">DATE</th>
                  {!isSimplifiedView && (
                    <>
                      <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">ITEMS</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap">SUB TOTAL</th>
                    </>
                  )}
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap">TOTAL</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap">PAYMENT</th>
                  {!isSimplifiedView && (
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap">PAID AMOUNT</th>
                  )}
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap">STATUS</th>
                  {!isSimplifiedView && <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap">CREATED BY</th>}
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm text-right pr-8">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingOrders ? (
                  <tr>
                    <td colSpan={isSimplifiedView ? 8 : 14} className="h-96 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-100"></div>
                        <p className="text-slate-500 dark:text-slate-400">Loading orders...</p>
                      </div>
                    </td>
                  </tr>
                ) : orders?.length === 0 ? (
                  <tr>
                    <td colSpan={isSimplifiedView ? 8 : 14} className="h-96 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                          <ShoppingCart className="h-10 w-10 text-slate-400" />
                        </div>
                        <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">No orders found</p>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Try adjusting your search or add a new order.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders?.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                          <Hash className="h-3 w-3 mr-1 text-slate-400" />
                          {order.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-colors">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{order.customer_name || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatTimestamp(order.order_date)}
                      </td>
                      {!isSimplifiedView && (
                        <>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {order.number_of_items} items
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {formatCurrency(order.sub_total)}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm border ${order.payment_status === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                            : order.payment_status === "Pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                              : "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800"
                          }`}>
                          <DollarSign className="h-3 w-3 mr-1 opacity-80" />
                          {order.payment_status}
                        </span>
                      </td>
                      {!isSimplifiedView && (
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600 whitespace-nowrap">
                          {formatCurrency(order.paid_amount)}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm ${order.status === "Done"
                            ? "bg-emerald-600 dark:bg-emerald-500"
                            : order.status === "Pending"
                              ? "bg-amber-500 dark:bg-amber-400"
                              : "bg-rose-600 dark:bg-rose-500"
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      {!isSimplifiedView && (
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {order.user}
                        </td>
                      )}
                      <td className="px-6 py-4 text-right pr-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all flex items-center justify-center">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-2xl">

                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedOrderId(order.id);
                                showOrderDetails(order);
                              }}
                              className="rounded-xl flex items-center gap-2 p-3 text-sm font-medium focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors"
                            >
                              <Eye className="h-4 w-4 text-slate-500" />
                              {t("view")}
                            </DropdownMenuItem>

                            {order.status !== "Pending" && order.status !== "Cancelled" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  handleShowReceiptPos(order);
                                }}
                                className="rounded-xl flex items-center gap-2 p-3 text-sm font-medium focus:bg-slate-100 dark:focus:bg-slate-800 transition-colors"
                              >
                                <FileText className="h-4 w-4 text-rose-500" />
                                {t("receipt")}
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onClick={() => handleDeleteOrderClick(order)}
                              className="rounded-xl flex items-center gap-2 p-3 text-sm font-medium text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/30 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-rose-500" />
                              {t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Desktop Pagination */}
          {!isLoadingOrders && orders?.length > 0 && (
            <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100/80 dark:border-slate-800 px-8 py-4 text-sm flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-[24px]">
              <span className="text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{orders.length}</span> orders
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                  className="h-8 rounded-lg shadow-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-3 text-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> {t("previous") || "Previous"}
                </Button>
                <span className="text-slate-600 dark:text-slate-400 font-medium px-2">
                  {t("page")} {page} of {totalPages || 1}
                </span>
                <Button 
                  onClick={() => setPage(p => (!totalPages || page >= totalPages ? p : p + 1))} 
                  disabled={!totalPages || page >= totalPages} 
                  className="h-8 rounded-lg shadow-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-3 text-sm"
                >
                  {t("next") || "Next"} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-4">
          {isLoadingOrders ? (
            <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 dark:border-slate-100 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading orders...</p>
            </div>
          ) : orders?.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-[24px] p-12 text-center border border-slate-200/60 dark:border-slate-800">
              <ShoppingCart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">No orders found</p>
            </div>
          ) : (
            orders?.map((order) => (
              <div key={order.id} className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-lg rounded-[24px] shadow-sm border border-slate-200/60 dark:border-slate-800 p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-inner">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-0.5">Order #{order.id}</p>
                      <p className="font-extrabold text-slate-900 dark:text-slate-100 text-lg leading-none">{order.customer_name || "N/A"}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-2xl z-50">
                      {/* Reuse DropdownMenuItems from desktop table */}
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          showOrderDetails(order);
                        }}
                        className="rounded-xl flex items-center gap-2 p-3 text-sm font-medium"
                      >
                        <Eye className="h-4 w-4 text-slate-500" />
                        {t("view")}
                      </DropdownMenuItem>
                      {order.status !== "Pending" && order.status !== "Cancelled" && (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            handleShowReceiptPos(order);
                          }}
                          className="rounded-xl flex items-center gap-2 p-3 text-sm font-medium"
                        >
                          <FileText className="h-4 w-4 text-rose-500" />
                          {t("receipt")}
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        onClick={() => handleDeleteOrderClick(order)}
                        className="rounded-xl flex items-center gap-2 p-3 text-sm font-medium text-rose-600"
                      >
                        <Trash2 className="h-4 w-4 text-rose-500" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-3 border border-slate-100/50 dark:border-slate-800/50">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{t("date")}</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{formatTimestamp(order.order_date)}</p>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl p-3 border border-slate-100/50 dark:border-slate-800/50">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{t("total")}</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{formatCurrency(order.total_amount)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className={`flex-1 flex justify-center items-center py-2 rounded-xl text-[11px] font-bold shadow-sm border ${order.payment_status === "Paid"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                      : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800"
                    }`}>
                    {order.payment_status}
                  </span>
                  <span className={`flex-1 flex justify-center items-center py-2 rounded-xl text-[11px] font-bold text-white shadow-sm ${order.status === "Done" ? "bg-emerald-600" : "bg-amber-500"
                    }`}>
                    {order.status}
                  </span>
                </div>

                {!isSimplifiedView && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between py-1.5 px-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100/50 dark:border-slate-700/30">
                      <span className="text-xs text-slate-500 font-bold uppercase">{t("created_by")}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <User className="h-3 w-3" /> {order.user}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setExpandedCards(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                  className="w-full pt-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {expandedCards[order.id] ? (
                    <>
                      <span>Hide Details</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Show Full Details</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>

                {expandedCards[order.id] && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between py-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                        <span className="text-slate-500">{t("ordered_items")}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{order.number_of_items}</span>
                      </div>
                      <div className="flex justify-between py-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                        <span className="text-slate-500">{t("sub_total")}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(order.sub_total)}</span>
                      </div>
                      <div className="flex justify-between py-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                        <span className="text-slate-500">{t("paid_amount")}</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(order.paid_amount)}</span>
                      </div>

                      <div className="flex justify-between py-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                        <span className="text-slate-500">{t("created_by")}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1"><User className="h-3 w-3" /> {order.user}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {/* Mobile Pagination */}
          {!isLoadingOrders && orders?.length > 0 && (
            <div className="flex flex-col items-center gap-3 pt-2 pb-4">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{orders.length}</span> orders
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                  className="h-8 rounded-lg shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-slate-600 dark:text-slate-400 text-sm font-medium px-2">
                  {t("page")} {page} of {totalPages || 1}
                </span>
                <Button 
                  onClick={() => setPage(p => (!totalPages || page >= totalPages ? p : p + 1))} 
                  disabled={!totalPages || page >= totalPages} 
                  className="h-8 rounded-lg shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 px-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals - Modernized Backgrounds */}
      {showOrderModal && selectedOrder && (
        <OrderDetailModal
          isOpen={showOrderModal}
          onClose={closeModal}
          displayModalItems={displayModalItems}
          modalItemsPerPage={modalItemsPerPage}
          modalPageCount={modalPageCount}
          modalCurrentPage={modalCurrentPage}
          handleModalPageChange={handleModalPageChange}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          handleConfirmDelete={handleConfirmDelete}
          handleAddOrderClick={handleAddOrderClick}
          showItemDetails={showItemDetails}
          setEditProduct={setEditProduct}
          handleDeleteSubmit={handleDeleteSubmit}
          t={t}
          selectedOrderId={selectedOrderId}
        />
      )}

      {showDownloadConfirmation && (
        <DownloadConfirmationModal
          isOpen={showDownloadConfirmation}
          onClose={() => {
            setShowDownloadConfirmation(false);
            setOrderToDownload(null);
          }}
          onConfirm={handleConfirmDownload}
        />
      )}

      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditProduct(null)}>
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-slate-100"><Layers className="h-6 w-6" /></div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{t("update_orders")}</h2>
              </div>
            </div>
            <form onSubmit={handleSubmit(handleUpdateSubmit)} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t("product_name")}</label>
                <input type="text" value={editProduct.product_name || "N/A"} disabled className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-5 py-4 text-slate-500 font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t("quantity")}</label>
                  <input type="number" {...register("quantity")} min="1" className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t("unit_price")}</label>
                  <input type="number" {...register("unit_price")} min="1" className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">{t("status")}</label>
                <select {...register("status")} className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold appearance-none">
                  <option value="Done">{t("done")}</option>
                  <option value="Cancelled">{t("cancelled")}</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => setEditProduct(null)} className="flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 h-14 font-bold">{t("cancel")}</Button>
                <Button type="submit" className="flex-1 rounded-2xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white h-14 font-bold shadow-xl shadow-slate-900/10 dark:shadow-none">{t("update")}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400"><Eye className="h-6 w-6" /></div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{t("item_detail")}</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{t("product_name")}</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{selectedItem.product_name || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{t("quantity")}</p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{selectedItem.quantity}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{t("price")}</p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{formatCurrency(selectedItem.total_price || selectedItem.price)}</p>
                </div>
              </div>
              {selectedItem.product_specification && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{t("specification")}</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{selectedItem.product_specification}</p>
                </div>
              )}
              <Button onClick={() => setSelectedItem(null)} className="w-full rounded-2xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white h-14 font-bold shadow-lg mt-2">{t("close")}</Button>
            </div>
          </div>
        </div>
      )}

      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 left-6 h-12 w-12 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border border-white/20 dark:border-black/20"
        >
          <ChevronUp className="h-6 w-6 group-hover:scale-125 transition-transform" />
        </button>
      )}

      {/* Other Modals (preserving original components but they will use updated internal logic/styling if they were built correctly) */}
      <PDFModal isOpen={showPDF} onClose={() => setShowPDF(false)} className="z-50">
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 dark:border-slate-800">
          <PDFViewer width="100%" height="700">
            <MyDoc orderFourDegit={orderFourDegit} order={selectedOrder} products={products} companyData={companyData} receiptData={receiptData} />
          </PDFViewer>
        </div>
      </PDFModal>

      <PDFModal isOpen={showReceiptPosModal} onClose={() => setShowReceiptPosModal(false)} className="z-50">
        {receiptPosData && (
          <PDFViewer width="100%" height="600">
            <ReceiptPosPDF order={receiptPosData.order} companyData={receiptPosData.companyData} />
          </PDFViewer>
        )}
      </PDFModal>

      <ConfirmationModal isOpen={showConfirmationModal} onClose={() => setShowConfirmationModal(false)} onConfirm={handleConfirmUpdate} />

      <StatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusUpdate}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedOrderForStatus={selectedOrderForStatus}
      />

      <AddOrderModal isOpen={showAddOrderModal} onClose={closeModalAdd} selectedOrderId={selectedOrderId} id={selectedOrder?.id} />

      {showOrderLogModal && (
        <OrderLogsModal selectedRowOrder={selectedRowOrder} open={showOrderLogModal} onClose={closeModalOrderLog} />
      )}

      {showSelectedOrderPaymentStatusModal && (
        <OrderPaymentStatusModal
          paymentStatus={paymentStatus}
          setPaymentStatus={setPaymentStatus}
          paidAmount={paidAmount}
          setPaidAmount={setPaidAmount}
          selectedRowPayment={selectedRowPayment}
          open={showSelectedOrderPaymentStatusModal}
          onClose={closeOrderPaymentStatus}
        />
      )}

      {showOrderDeleteModal && (
        <ConfirmDeleteModal
          isOpen={showOrderDeleteModal}
          onConfirm={handleConfirmOrderDelete}
          onCancel={() => {
            setShowOrderDeleteModal(false);
            setOrderToDelete(null);
          }}
        />
      )}
    </div>
  );
}

export default ManageOrder;
