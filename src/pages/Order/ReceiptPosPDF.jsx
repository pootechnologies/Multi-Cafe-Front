import { formatDateTypeStamp } from "@/utils/formatDateTypeStamp";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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
    maxWidth: "80mm",
    fontSize: 8,
    fontFamily: "Roboto",
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

const ReceiptPosPDF = ({ order, companyData }) => {
  const subTotal = order?.sub_total || 0;
  const taxAmount = order?.vat || 0;
  const totalAmount = order?.total_amount || 0;
  const hasNoReceipt =
    order?.items?.some((item) => item.receipt === "No Receipt") || false;

  return (
    <Document>
      <Page size="A4" style={styles.receipt}>
        {/* <View style={styles.header}>
          <Text style={styles.companyInfo}>TIN: {companyData?.tin_number}</Text>
          <Text style={styles.companyName}>{companyData?.en_name}</Text>
          <Text style={styles.companyInfo}>CITY: {companyData?.city}</Text>
          <Text style={styles.companyInfo}>TELL- {companyData?.phone1}</Text>
        </View> */}
        <View
          style={{
            fontSize: 25,
            fontWeight: "semibold",
            marginBottom: 5,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {(order?.id || order?.order_id) && (
            <Text style={{ marginBottom: 2 }}>
              {order.id || order.order_id}
            </Text>
          )}

          <View
            style={{
              width: "100%",
              alignItems: "flex-end",
            }}
          >
            <Text style={{ fontSize: 8, fontFamily: "ethio" }}>
              Date:{" "}
              {(() => {
                const date = new Date(order?.order_date);
                let hours = date.getHours();
                const minutes = date.getMinutes().toString().padStart(2, "0");
                const day = date.toLocaleDateString();

                hours = hours % 12 || 12;

                return `${day}, ${hours}:${minutes}`;
              })()}
            </Text>
          </View>
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
          {order?.items?.map((item, index) => (
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
                {Number(item.product_price).toLocaleString()}
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
                {Number(item.price).toLocaleString()}
              </Text>
            </View>
          ))}
          <View style={styles.dashedBorder} />
          <View style={styles.itemRow}>
            <Text style={{ textAlign: "left", fontSize: 10 }}>SUB TOTAL</Text>
            <Text
              style={{ textAlign: "right", fontSize: 10, fontWeight: "bold" }}
            >
              <Text>*</Text>
              {Number(subTotal).toLocaleString()}
            </Text>
          </View>
          {/* {!hasNoReceipt && (
            <View style={styles.itemRow}>
              <Text style={{ textAlign: "left", fontSize: 10 }}>
                TAX (15.00%)
              </Text>
              <Text
                style={{ textAlign: "right", fontSize: 10, fontWeight: "bold" }}
              >
                *{Number(taxAmount).toLocaleString()}
              </Text>
            </View>
          )} */}
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
              *{Number(totalAmount).toLocaleString()}
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

export default ReceiptPosPDF;
