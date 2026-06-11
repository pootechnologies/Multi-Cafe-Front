import React, { useState, useEffect } from "react";
import { Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
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

const ReceiptPosPDF = ({ receiptData }) => {
  const { items, company, customer, order_details } = receiptData;
  const subTotal = order_details?.sub_total;
  const taxAmount = order_details?.vat;
  const totalAmount = order_details?.total_amount;

  const hasNoReceipt = items.some((item) => item.receipt === "No Receipt");

  return (
    <Document>
      <Page
        size="A4"
        style={{
          maxWidth: "80mm",
          fontSize: 8,
          fontFamily: "Roboto",
        }}
      >
        <View style={styles.header}>
          <Text style={styles.companyInfo}>TIN: {company?.tin_number}</Text>
          <Text style={styles.companyName}>{company?.en_name}</Text>

          {/*  <Text style={styles.companyInfo}>Phone 2: {company.phone}</Text>*/}
          <Text style={styles.companyInfo}>CITY: {company?.city}</Text>
          <Text style={styles.companyInfo}>TELL- {company?.phone}</Text>
        </View>

        <View
          style={{
            marginLeft: "auto",
            fontSize: 8,
            fontWeight: "bold",
            marginBottom: 5,
          }}
        >
          <Text>
            Date:{" "}
            {(() => {
              const date = new Date(order_details?.date);
              if (isNaN(date)) return ""; // handle invalid date safely

              const day = date.toLocaleDateString();
              let hours = date.getHours();
              const minutes = date.getMinutes().toString().padStart(2, "0");

              // Convert to 12-hour format (no AM/PM)
              hours = hours % 12 || 12;

              return `${day}, ${hours}:${minutes}`;
            })()}
          </Text>
        </View>
        <View>
          <View style={styles.itemRow}>
            <Text style={[styles.itemHeader, { flex: 2, textAlign: "left" }]}>
              DESCRIPTION
            </Text>
            <Text
              style={[styles.itemHeader, { flex: 0.5, textAlign: "center" }]}
            >
              QTY
            </Text>
            <Text style={[styles.itemHeader, { flex: 1, textAlign: "right" }]}>
              PRICE
            </Text>
            <Text style={[styles.itemHeader, { flex: 1, textAlign: "right" }]}>
              AMOUNT
            </Text>
          </View>
          <View style={styles.dashedBorder} />
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text
                style={{
                  flex: 2,
                  textAlign: "left",
                  wordWrap: "break-word",
                  maxWidth: "38mm",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {item.product_name}{" "}
                {item.specification ? `(${item.specification})` : ""}
              </Text>
              <Text
                style={{
                  flex: 0.5,
                  textAlign: "center",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {item.quantity}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "right",
                  wordBreak: "break-word",
                  maxWidth: "22mm",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {item.product_price.toLocaleString()}
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "right",
                  wordBreak: "break-word",
                  maxWidth: "22mm",
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {item.price.toLocaleString()}
              </Text>
            </View>
          ))}
          <View style={styles.dashedBorder} />

          <View style={styles.itemRow}>
            <Text style={{ textAlign: "left", fontSize: 10 }}>SUB TOTAL</Text>
            <Text
              style={{ textAlign: "right", fontSize: 10, fontWeight: "bold" }}
            >
              *{subTotal.toLocaleString()}
            </Text>
          </View>
          {!hasNoReceipt && (
            <View style={styles.itemRow}>
              <Text style={{ textAlign: "left", fontSize: 10 }}>
                TAX (15.00%)
              </Text>
              <Text
                style={{ textAlign: "right", fontSize: 10, fontWeight: "bold" }}
              >
                *{taxAmount.toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.dashedBorder} />
          <View style={styles.itemRow}>
            <Text
              style={{ textAlign: "left", fontWeight: "bold", fontSize: 14 }}
            >
              TOTAL
            </Text>
            <Text
              style={{ textAlign: "right", fontWeight: "bold", fontSize: 14 }}
            >
              *{totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>
        <View style={styles.customFooter}>
          <Text>Powered By Po'o Technologies</Text>
        </View>
      </Page>
    </Document>
  );
};

const ReceiptPos = ({ receiptData }) => {
  return (
    <PDFViewer width="100%" height="600">
      <ReceiptPosPDF receiptData={receiptData} />
    </PDFViewer>
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
  <div
    style={{
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
    onClick={onCancel}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        width: "400px",
      }}
    >
      <h2 className="mb-4 font-bold text-2xl border-b p-1">
        {t("are_you_sure")}
      </h2>
      <p>{t("sure_discription")}</p>
      <div className="mt-4 flex justify-end space-x-2">
        <Button
          onClick={onConfirm}
          className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-md"
        >
          {t("delete")}
        </Button>
        <Button
          onClick={onCancel}
          className="bg-black text-white px-4 py-2 rounded-md mr-2"
        >
          {t("cancel")}
        </Button>
      </div>
    </div>
  </div>
);

function ManageCredit() {
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
    receipt: "",
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
    let url = `${getBaseURL()}${API_ENDPOINTS.CREDIT}?page=${page}&page_size=${pageSize}`;
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

  // fetch to get four degit number

  const { data: orderFourDegitFetch } = useQuery({
    queryKey: ["orderFourDegitFetch", selectedOrderId],
    queryFn: () =>
      axiosInstance
        .get(`${API_ENDPOINTS.ORDERS}/${selectedOrderId}`)
        .then((res) => {
          setOrderFourDegit(res?.data.id);
          return res?.data.id;
        }),
    refetchOnWindowFocus: true,
    refetchInterval: 1000,
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
    },
    onError: (error) => {
      toast.error("Failed to delete product!");
      console.error("Delete error:", error);
    },
  });

  const showOrderDetails = (order) => {
    navigate(`/credit-detail/${order.id}`);
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
  // const orders = filteredOrders?.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );

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
      const customerName = order?.customer_name;
      const orderDate = formatTimestamp(order?.order_date);

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

      if (isMobile) {
        const blob = await pdf(
          <ReceiptPosPDF receiptData={receiptData} />
        ).toBlob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `receipt_pos_${order.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setReceiptPosData(receiptData);
        setShowReceiptPosModal(true);
      }
    } catch (error) {
      console.error("Error fetching receipt data:", error);
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
    { field: "receipt", headerName: t("receipt"), width: 100 },
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
                setSelectedOrderForStatus(params.row.actions);
                setSelectedStatus(params.row.actions.status);
                setShowStatusModal(true);
              }}
            >
              <BadgeCheck className="mr-2 h-4 w-4" />
              {t("status")}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                setPaymentStatus(params.row.payment_status);
                setPaidAmount(params.row.paid_amount);
                setSelectedRowPayment(params.row.actions);
                setShowSelectedOrderPaymentStatusModal(true);
              }}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              {t("payment_status")}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                setShowOrderLogModal(true);
                setSelectedRowOrder(params.row);
              }}
            >
              <ActivitySquare className="mr-2 h-4 w-4" />
              {t("logs")}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => showOrderDetails(params.row.actions)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {t("view")}
            </DropdownMenuItem>

            <>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedOrderId(params.row.actions.id);
                  handleGeneratePDF(params.row.actions);
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                {t("receipt")}
              </DropdownMenuItem>

              {/* <DropdownMenuItem
                onClick={() => handleShowReceiptPos(params.row.actions)}
              >
                <ReceiptText className="mr-2 h-4 w-4" />
                {t("pos")}
              </DropdownMenuItem> */}
            </>
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
    { field: "receipt", headerName: t("receipt"), width: 100 },
    { field: "sub_total", headerName: t("sub_total"), width: 130 },
    { field: "vat", headerName: t("vat"), width: 80 },
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
    { field: "unpaid_amount", headerName: t("unpaid_amount"), width: 130 },
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
                setSelectedOrderForStatus(params.row.actions);
                setSelectedStatus(params.row.actions.status);
                setShowStatusModal(true);
              }}
            >
              <BadgeCheck className="mr-2 h-4 w-4" />
              {t("status")}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                setPaymentStatus(params.row.payment_status);
                setPaidAmount(params.row.paid_amount);
                setSelectedRowPayment(params.row.actions);
                setShowSelectedOrderPaymentStatusModal(true);
              }}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              {t("payment_status")}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                setShowOrderLogModal(true);
                setSelectedRowOrder(params.row);
              }}
            >
              <ActivitySquare className="mr-2 h-4 w-4" />
              {t("logs")}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => showOrderDetails(params.row.actions)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {t("view")}
            </DropdownMenuItem>

            {params.row.actions.status !== "Pending" &&
              params.row.actions.status !== "Cancelled" && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleGeneratePDF(params.row.actions)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {t("receipt")}
                  </DropdownMenuItem>

                  {/* <DropdownMenuItem
                    onClick={() => handleShowReceiptPos(params.row.actions)}
                  >
                    <ReceiptText className="mr-2 h-4 w-4" />
                    {t("pos")}
                  </DropdownMenuItem> */}
                </>
              )}
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
    <div className="container pl-5 pr-5">
      <h1 className="text-lg font-semibold mt-2 border-b mb-2">
        {t("manage_credit")}
      </h1>
      <div className="flex flex-col mb-4 md:flex md:flex-row space-x-5 md:items-center md:mb-2">
        {/* <input
          type="search"
          placeholder={t("search_by_customer_name")}
          className="mb-4 p-2 border border-gray-300 rounded"
          onChange={(e) => handleSearch(e.target.value)}
        /> */}

        <div className="flex flex-col space-y-2 sm:flex sm:flex-row sm:space-y-0 md:space-x-5">
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
            placeholder={t("select_customer_name")}
            onChange={(selectedOption) => {
              handleSearch(selectedOption.value);
            }}
            value={
              searchTerm
                ? {
                  label: searchTerm,
                  value: searchTerm,
                }
                : null
            }
            className="w-full md:w-64 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <Select
          isClearable
            id="payment-status"
            options={[
              { label: t("all"), value: "All" },
              { label: t("paid"), value: "Paid" },
              { label: t("pending"), value: "Pending" },
              { label: t("unpaid"), value: "Unpaid" },
            ]}
            placeholder={t("select_payment_status")}
            onChange={(selectedOption) => {
              setSelectedStatus(selectedOption.value);
              handleSearch(selectedOption.value); // You can use this value to filter
            }}
            value={
              selectedStatus
                ? {
                  label: t(selectedStatus),
                  value: selectedStatus,
                }
                : null
            }
            className="w-full md:w-64 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <Button variant="outline" onClick={toggleView}>
            {isSimplifiedView ? t("detailed") : t("simplified")}
          </Button>
        </div>
      </div>

      {/* Desktop View - DataGrid */}
      <div className="hidden md:block">
        <DataGrid
          sx={{
            "& .MuiDataGrid-footerContainer": { display: "none" },
            "& .MuiDataGrid-scrollbar--horizontal": {
              display: "scroll",
              zIndex: 0,
            },
          }}
          rows={rows || []}
          columns={isSimplifiedView ? simplifiedColumns : columns}
          loading={isLoadingOrders}
          disableSelectionOnClick
          components={{
            Toolbar: () => (
              <GridToolbarContainer>
                <GridToolbarFilterButton />
                <TextField
                  size="small"
                  variant="standard"
                  label="Customer Name"
                  name="customerName"
                  value={filters.customerName}
                  onChange={handleFilterChange}
                />
                <TextField
                  size="small"
                  variant="standard"
                  label="Order Date"
                  name="orderDate"
                  value={filters.orderDate}
                  onChange={handleFilterChange}
                />
                <TextField
                  size="small"
                  variant="standard"
                  label="Total Amount"
                  name="totalAmount"
                  value={filters.totalAmount}
                  onChange={handleFilterChange}
                />
                <TextField
                  size="small"
                  variant="standard"
                  label="Receipt"
                  name="receipt"
                  value={filters.receipt}
                  onChange={handleFilterChange}
                  select
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">All</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </TextField>
              </GridToolbarContainer>
            ),
          }}
        />
        <div className="flex justify-center mt-4">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {isLoadingOrders ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          orders?.map((order) => (
            <div key={order.id} className={`bg-white rounded-lg shadow p-4 border border-gray-200 hover:shadow-md transition-all ${Object.values(expandedCards).some(v => v) && !expandedCards[order.id] ? 'opacity-40 blur-sm' : ''}`}>
              <div className="flex justify-between items-start mb-3 pb-3 border-b">
                <div>
                  <h3 className="text-sm text-gray-900">#{order.id}</h3>
                  <p className="text-base font-bold mt-1">{order.customer_name || "N/A"}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => { setSelectedOrderForStatus(order); setSelectedStatus(order.status); setShowStatusModal(true); }}>
                      <BadgeCheck className="mr-2 h-4 w-4" />{t("status")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setPaymentStatus(order.payment_status); setPaidAmount(order.paid_amount); setSelectedRowPayment(order); setShowSelectedOrderPaymentStatusModal(true); }}>
                      <DollarSign className="mr-2 h-4 w-4" />{t("payment_status")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setShowOrderLogModal(true); setSelectedRowOrder({ actions: order }); }}>
                      <ActivitySquare className="mr-2 h-4 w-4" />{t("logs")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => showOrderDetails(order)}>
                      <Eye className="mr-2 h-4 w-4" />{t("view")}
                    </DropdownMenuItem>
                    {order.status !== "Pending" && order.status !== "Cancelled" && (
                      <DropdownMenuItem onClick={() => { setSelectedOrderId(order.id); handleGeneratePDF(order); }}>
                        <FileText className="mr-2 h-4 w-4" />{t("receipt")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("order_date")}</span>
                  <span className="font-medium text-gray-900">{formatTimestamp(order.order_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("receipt")}</span>
                  <span className="font-medium text-gray-900">{order.receipt}</span>
                </div>
                <div className="flex justify-between py-2 px-3 bg-gray-50 rounded -mx-1">
                  <span className="text-gray-700 font-medium">{t("total_amount")}</span>
                  <span className="font-bold text-gray-900">{formatCurrency(order.total_amount)} ETB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("payment_status")}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: order.payment_status === "Paid" ? "#10b981" : order.payment_status === "Pending" ? "#f59e0b" : "#ef4444", backgroundColor: order.payment_status === "Paid" ? "#d1fae5" : order.payment_status === "Pending" ? "#fef3c7" : "#fee2e2" }}>
                    {order.payment_status}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-600">{t("status")}</span>
                  <span className="px-2.5 py-1 rounded text-xs font-semibold text-white" style={{ backgroundColor: order.status === "Pending" ? "#f59e0b" : order.status === "Done" ? "#10b981" : "#ef4444" }}>
                    {order.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setExpandedCards(prev => {
                  const isCurrentlyExpanded = prev[order.id];
                  return isCurrentlyExpanded ? {} : { [order.id]: true };
                })}
                className="w-full mt-3 pt-3 border-t flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {expandedCards[order.id] ? (
                  <>
                    <span>Hide Details</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Show Details</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>

              {expandedCards[order.id] && (
                <div className="mt-3 pt-3 border-t space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("ordered_items")}</span>
                    <span className="font-medium text-gray-900">{order.number_of_items}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("sub_total")}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(order.sub_total)} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("vat")}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(order.vat)} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("paid_amount")}</span>
                    <span className="font-medium text-green-600">{formatCurrency(order.paid_amount)} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("unpaid_amount")}</span>
                    <span className="font-medium text-red-600">{formatCurrency(order.unpaid_amount)} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("created_by")}</span>
                    <span className="font-medium text-gray-900">{order.user}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div className="flex justify-center mt-4">
          <Pagination count={totalPages} page={page} onChange={(event, value) => setPage(value)} color="primary" />
        </div>
      </div>
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-md">
            <h2 className="text-xl mb-4 border-b pb-2 border-gray-300">
              {t("update_orders")}
            </h2>
            <form onSubmit={handleSubmit(handleUpdateSubmit)}>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  {t("product_name")}
                </label>
                <input
                  type="text"
                  value={editProduct.product_name || "N/A"}
                  disabled
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">{t("quantity")}</label>
                <input
                  type="number"
                  {...register("quantity")}
                  min="1"
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">
                  {t("unit_price")}
                </label>
                <input
                  type="number"
                  {...register("unit_price")}
                  min="1"
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">{t("status")}</label>
                <select
                  {...register("status")}
                  className="w-full border rounded p-2"
                >
                  <option value="Done">{t("done")}</option>
                  <option value="Cancelled">{t("cancelled")}</option>
                </select>
              </div>
              <div className="flex justify-end space-x-5">
                <button
                  type="submit"
                  className="bg-[#55B990] hover:bg-[#54ce9b] text-white px-4 py-2 rounded-md mr-2"
                >
                  {t("update")}
                </button>
                <Button
                  type="button"
                  className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
                  onClick={() => setEditProduct(null)}
                >
                  {t("cancel")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-md">
            <h2 className="text-xl border-b pb-2 mb-4">{t("item_detail")}</h2>
            <div className="mb-4">
              <label className="block mb-2 font-bold">
                {t("product_name")}
              </label>
              <p>{selectedItem.product_name || "N/A"}</p>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">{t("quantity")}</label>
              <p>{selectedItem.quantity}</p>
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-bold">{t("price")}</label>
              <p>
                Etb{" "}
                {formatCurrency(
                  selectedItem.total_price
                    ? selectedItem.total_price
                    : selectedItem.price
                )}
              </p>
            </div>
            <div className="flex justify-end space-x-5">
              <Button
                className="bg-[#FF5555] hover:bg-[#f37979] text-white px-4 py-2 rounded-md"
                onClick={() => setSelectedItem(null)}
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </div>
      )}
      {isVisible && (
        <button
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: "20px",
            left: "20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            cursor: "pointer",
          }}
        >
          ↑
        </button>
      )}
      <PDFModal
        isOpen={showPDF}
        onClose={() => setShowPDF(false)}
        className="z-10"
      >
        <PDFViewer width="100%" height="600">
          <MyDoc
            orderFourDegit={orderFourDegit}
            order={selectedOrder}
            products={products}
            companyData={companyData}
            receiptData={receiptData}
          />
        </PDFViewer>
      </PDFModal>
      <PDFModal
        isOpen={showReceiptPosModal}
        onClose={() => setShowReceiptPosModal(false)}
        className="z-10"
      >
        <ReceiptPos receiptData={receiptPosData} />
      </PDFModal>
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmUpdate}
      />
      <StatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusUpdate}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedOrderForStatus={selectedOrderForStatus}
      />
      <AddOrderModal
        isOpen={showAddOrderModal}
        onClose={closeModalAdd}
        selectedOrderId={selectedOrderId}
        id={selectedOrder?.id}
      />
      {showOrderLogModal && (
        <OrderLogsModal
          selectedRowOrder={selectedRowOrder}
          open={showOrderLogModal}
          onClose={closeModalOrderLog}
        />
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
    </div>
  );
}

export default ManageCredit;
