import React from "react";
import {
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { formatCurrency } from "@/utils/numberFormaterStats";
import { convertToWordsWithCurrency } from "@/utils/useNumberToWords";
import ethioFont from "../../assets/ethioFont.ttf";
import RobotoRegular from "../../assets/roboto-regular-webfont.ttf";
import RobotoBold from "../../assets/roboto-bold-webfont.ttf";
import RobotoItalic from "../../assets/roboto-italic-webfont.ttf";
import { IMAGE_BASE_URL } from "@/utils/apiConfig";

// Register fonts for PDF
Font.register({
  family: "Roboto",
  fonts: [
    { src: RobotoRegular, fontWeight: "normal" },
    { src: RobotoBold, fontWeight: "bold" },
    { src: RobotoItalic, fontWeight: "normal", fontStyle: "italic" },
  ],
});
Font.register({ family: "ethio", src: ethioFont });

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
  companyName: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#000",
    maxWidth: "340px",
    marginLeft: 6,
  },
  companyInfo: { fontSize: 10, color: "#000", marginBottom: 3 },
  companyInfoPhone: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 3,
    marginLeft: 6,
  },
  documentTitle: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 5,
    color: "#000",
    fontFamily: "ethio",
  },
  customerInfo: { marginTop: 10, marginBottom: 20 },
  customerName: { fontSize: 12, fontWeight: "bold", marginBottom: 3 },
  date: {
    fontSize: 10,
    color: "#4b5563",
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
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000" },
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
  tableCol6: { width: "20%", padding: 2 },
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
  headerCellLabel: { fontSize: 8, fontWeight: "bold" },
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
    paddingRight: 12,
    breakBefore: "auto",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginBottom: 3,
    marginLeft: 9,
    alignItems: "center",
  },
  summaryLabel: { fontSize: 8, color: "#000", fontFamily: "ethio" },
  summaryValue: { fontSize: 8, color: "#000", fontWeight: "bold" },
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
  totalValue: { fontSize: 8, fontWeight: "bold", color: "#000" },
  vatValue: { fontSize: 8, fontWeight: "bold", color: "#000" },
  vatLabel: { fontSize: 10, fontWeight: "bold", color: "#000" },
  amountInWords: {
    fontSize: 10,
    marginTop: 10,
    fontStyle: "italic",
    color: "#000",
  },
  validitySection: { marginTop: 20, fontSize: 10, color: "#000" },
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
  signatureText: { fontSize: 10, textAlign: "center", color: "#6b7280" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
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
  headerText: { fontSize: 8 },
  headerBold: { fontSize: 8, fontWeight: "bold" },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 6,
  },
  itemHeader: { fontWeight: "bold", marginTop: 2 },
  dashedBorder: { borderTop: "1px dashed #000", margin: "4px 0" },
  footerText: { fontSize: 8, fontWeight: "bold" },
  customFooter: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 5,
    padding: 10,
    color: "#9ca3af",
  },
});

const Watermark = () => (
  <View style={styles.watermark}>
    <Text>ATTACHMENT</Text>
  </View>
);

const MyDoc = ({ order, companyData }) => {
  const customer = order.customer_name
    ? {
        name: order.customer_name,
        tin_number: order.tin_number,
        fs_number: order.fs_number,
        vat_number: order.vat_number,
      }
    : {};
  const hasReceipt = order.receipt === "Receipt";
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
                  src={`${IMAGE_BASE_URL}${companyData?.logo}`}
                />
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "80%",
                  }}
                >
                  {order.vat > 0 && order.items.length <= 10 && <Watermark />}
                  <Text
                    style={{
                      fontFamily: "ethio",
                      marginLeft: 6,
                      fontSize: 9,
                      fontWeight: "bold",
                    }}
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
                    ቀን:{" "}
                    {new Date(order.order_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
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
                    marginRight: 22,
                  }}
                >
                  <Text style={{ fontFamily: "ethio", fontSize: 8 }}>No:</Text>
                  <Text
                    style={{
                      fontFamily: "ethio",
                      fontSize: 8,
                      color: "red",
                      marginRight: 16,
                    }}
                  >
                    {order.receipt_id || " "}
                  </Text>
                </View>
              )}
              <View
                style={{ flexDirection: "row", justifyContent: "space-around" }}
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
              {order.vat > 0 && (
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
                    >{`ከ፦ ${companyData?.owner_am_name}`}</Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`From፦ ${companyData?.owner_en_name}`}</Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`አድራሻ:- ${companyData?.region} ዞን:-${companyData?.zone} ከተማ:-${companyData?.city} ክ/ከተማ:- ${companyData?.sub_city}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Addr.Reg Zone City Subcity
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የታክስ መለያ ቁጥር፦ ${companyData?.tin_number}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Supplier tin No
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የሻጭ ተ.እ.ታ.ቁ፦ ${companyData?.vat_number}`}</Text>
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
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`ለ፡ ${customer?.name}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>To</Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የተ.አ.ታ.ቁ፦ ${customer?.vat_number}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Customer Vat No
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የግብር ከፋይ ታክስ መ/ቁ፦ ${customer?.tin_number}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Customer Tin No
                    </Text>
                    <Text
                      style={{ fontFamily: "ethio", fontSize: 8 }}
                    >{`የፊዝካል ደ.ቁ፦ ${customer?.fs_number}`}</Text>
                    <Text style={{ fontFamily: "ethio", fontSize: 8 }}>
                      Fs No
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
          <View style={styles.tableContainer} breakBefore="avoid">
            {order.vat > 0 && order.items.length > 10 && (
              <View
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "20%",
                  transform: "translate(-50%, -50%) rotate(-45deg)",
                  opacity: 0.3,
                  fontSize: 50,
                  color: "#aaaaaa",
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
                const unitPrice = item.unit_price || 0;
                const quantity = item.package
                  ? item.package * item.piece
                  : item.quantity;
                const totalPrice = unitPrice * quantity;
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
                        {item.product_name ?? "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableColNew}>
                      <Text style={styles.tableCell}>{item.unit}</Text>
                    </View>
                    <View style={styles.tableCol3}>
                      <Text style={styles.tableCell}>{quantity}</Text>
                    </View>
                    <View style={styles.tableCol4}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(unitPrice)}
                      </Text>
                    </View>
                    <View style={styles.tableCol5}>
                      <Text style={styles.tableCellRight}>
                        {formatCurrency(totalPrice)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
          {chunkIndex === itemChunks.length - 1 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <View style={{ marginLeft: 10 }}>
                <Text
                  style={{
                    fontFamily: "ethio",
                    fontSize: 8,
                    marginLeft: 0,
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
                  style={{ fontFamily: "ethio", fontSize: 8, marginTop: 2 }}
                >
                  Other memo or reason for refund____________
                </Text>
                <Text
                  style={{ fontFamily: "ethio", fontSize: 8, marginTop: 2 }}
                >
                  Buyer's signture______ Seller's signture______
                </Text>
              </View>
              <View style={styles.summarySection}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>ጠቅላላ ድምር Total:</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(order.sub_total)} ETB
                  </Text>
                </View>
                {order.vat >= 1 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.summaryLabel}>ተ.እ.ታ VAT (15%):</Text>
                    <Text style={styles.vatValue}>
                      {formatCurrency(order.vat)} ETB
                    </Text>
                  </View>
                )}
                {order.vat >= 1 && (
                  <View style={styles.totalRow}>
                    <View style={{ flexDirection: "column" }}>
                      <Text style={styles.summaryLabel}>ጠቅላላ ዋጋ ጨምሮ ተ.እ.ታ</Text>
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
          )}
          <View style={styles.customFooter}>
            <Text>Powered By Po'o Technologies</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

const PDFModal = ({ isOpen, onClose, children, onPDFClose }) => {
  if (!isOpen) return null;
  const handleClose = () => {
    onClose();
    if (onPDFClose) onPDFClose();
  };
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[90%] lg:max-w-4xl">
        <button
          onClick={handleClose}
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

const PDFDocument = ({ isOpen, onClose, onPDFClose, order, companyData }) => {
  return (
    <PDFModal isOpen={isOpen} onClose={onClose} onPDFClose={onPDFClose}>
      <PDFViewer width="100%" height="600">
        <MyDoc order={order} companyData={companyData} />
      </PDFViewer>
    </PDFModal>
  );
};

export default PDFDocument;
