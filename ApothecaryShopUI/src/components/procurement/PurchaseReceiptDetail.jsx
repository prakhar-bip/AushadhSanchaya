import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { getPurchaseReceipt } from "../../services/purchaseReceiptService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AppLoader from "../AppLoader";

function PurchaseReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetchPurchaseReceipt();
  }, [id]);

  const fetchPurchaseReceipt = async () => {
    try {
      const data = await getPurchaseReceipt(id);
      setReceipt(data);
    } catch (err) {
      setError("Failed to load purchase receipt");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!receipt) return;

    // Create PDF document with professional styling
    const doc = new jsPDF();

    // Add border to the entire page
    doc.setDrawColor(0, 128, 0); // Green border
    doc.setLineWidth(1);
    doc.rect(5, 5, 200, 287); // Border around the page (margins of 5mm)

    // Add header with company name - simple clean version
    doc.setFontSize(22);
    doc.setTextColor(0, 100, 0); // Dark green color
    doc.text("AushadhSanchaya", 14, 15);
    doc.setDrawColor(0, 128, 0);
    doc.setLineWidth(0.5);
    doc.line(14, 18, 196, 18); // Underline below company name

    // Removed the green circle that didn't look good

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0); // Black color
    doc.setFont(undefined, "bold");
    doc.text(`Purchase Receipt - ${receipt.receiptNumber}`, 14, 30);
    doc.setFont(undefined, "normal");

    // Add receipt info in a styled box
    doc.setFillColor(240, 248, 240); // Light green background
    doc.roundedRect(14, 35, 182, 30, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    // Add receipt metadata
    doc.setFont(undefined, "bold");
    doc.text("PO Number:", 20, 45);
    doc.text("Receipt Date:", 90, 45);
    doc.text("Received By:", 20, 55);
    doc.setFont(undefined, "normal");
    doc.text(receipt.purchaseOrder?.poNumber || "N/A", 50, 45);
    doc.text(
      receipt.receiptDate
        ? new Date(receipt.receiptDate).toLocaleDateString()
        : "N/A",
      130,
      45
    );
    doc.text(receipt.receivedBy?.name || "N/A", 60, 55);

    // Create table for items with enhanced styling
    const tableColumn = [
      "Product",
      "Received Qty",
      "Batch #",
      "Expiry Date",
      "Unit Price",
      "Comments",
    ];
    const tableRows = [];

    (receipt.items || []).forEach((item) => {
      // Fix unit price formatting - use 'Rs.' instead of the rupee symbol to avoid encoding issues
      let formattedPrice = "N/A";
      if (item.unitPrice !== null && item.unitPrice !== undefined) {
        // Using "Rs." text instead of the rupee symbol
        formattedPrice = `Rs. ${parseFloat(item.unitPrice).toFixed(2)}`;
      }

      const itemData = [
        item.genericName || "N/A",
        item.receivedQuantity || 0,
        item.batchNumber || "",
        item.expiryDate
          ? new Date(item.expiryDate).toLocaleDateString()
          : "N/A",
        formattedPrice,
        item.comments || "",
      ];
      tableRows.push(itemData);
      console.log(item);
    });

    // Use autoTable directly with the document and enhanced styling
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      theme: "grid",
      headStyles: {
        fillColor: [0, 100, 0],
        textColor: [255, 255, 255],
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [240, 248, 240],
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      margin: { left: 14, right: 14 },
    });

    // Get the final Y position after the table is drawn
    let finalY =
      doc.lastAutoTable && doc.lastAutoTable.finalY
        ? doc.lastAutoTable.finalY + 10
        : 80;

    // Add quality check info in a styled box
    doc.setFillColor(240, 248, 240);
    doc.roundedRect(14, finalY, 85, 25, 3, 3, "F");
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Quality Check", 18, finalY + 7);
    doc.setFont(undefined, "normal");

    // Quality check status with colored indicator
    const passedStatus = receipt.qualityCheck?.passed ? "Passed" : "Failed";
    const statusColor = receipt.qualityCheck?.passed
      ? [0, 128, 0]
      : [200, 0, 0];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFont(undefined, "bold");
    doc.text(passedStatus, 75, finalY + 7);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");

    if (receipt.qualityCheck?.notes) {
      doc.setFontSize(10);
      doc.text(`Notes: ${receipt.qualityCheck.notes}`, 18, finalY + 17);
    }

    // Add additional notes
    if (receipt.notes) {
      doc.setFillColor(240, 248, 240);
      doc.roundedRect(105, finalY, 91, 25, 3, 3, "F");
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text(`Additional Notes:`, 110, finalY + 7);
      doc.setFont(undefined, "normal");
      doc.setFontSize(10);

      // Handle multi-line notes with text wrapping
      const splitNotes = doc.splitTextToSize(receipt.notes, 80);
      doc.text(splitNotes, 110, finalY + 17);
    }

    // Add footer
    finalY = Math.max(finalY + 35, 250);
    doc.setDrawColor(0, 128, 0);
    doc.setLineWidth(0.5);
    doc.line(14, finalY, 196, finalY);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "AushadhSanchaya | Generated on: " + new Date().toLocaleString(),
      14,
      finalY + 7
    );
    doc.text("Page 1 of 1", 180, finalY + 7);

    // Save the PDF
    doc.save(`${receipt.receiptNumber}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60]/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-[#4D6E60] rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-[#B47134] bg-[#B47134]/10 p-4 rounded-xl text-center font-medium border border-[#B47134]/20 mx-4">
        {error}
      </div>
    );
  }
  
  if (!receipt) {
    return (
      <div className="text-[#2D3E37]/60 text-center py-8 font-medium">
        Purchase receipt not found
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="max-w-6xl mx-auto pb-10"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-[#16221D]">Receipt: {receipt.receiptNumber}</h1>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={generatePDF}
            className="px-5 py-2.5 bg-[#4D6E60] text-white rounded-xl font-semibold hover:bg-[#678E7D] transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Download PDF
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/procurement/purchase-receipts")}
            className="px-5 py-2.5 bg-[#F5F7F4] border border-[#16221D]/10 text-[#2D3E37] rounded-xl font-semibold hover:bg-[#16221D]/5 transition-colors"
          >
            Back to List
          </motion.button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#16221D]/5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5">
            <p className="text-xs font-bold text-[#2D3E37]/60 uppercase tracking-wider mb-1">PO Number</p>
            <p className="font-bold text-[#4D6E60] text-lg">
              {receipt.purchaseOrder?.poNumber || "N/A"}
            </p>
          </div>
          <div className="bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5">
            <p className="text-xs font-bold text-[#2D3E37]/60 uppercase tracking-wider mb-1">Receipt Date</p>
            <p className="font-bold text-[#16221D] flex items-center text-lg">
              <svg className="w-4 h-4 mr-1.5 text-[#4D6E60]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {receipt.receiptDate
                ? new Date(receipt.receiptDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div className="bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5">
            <p className="text-xs font-bold text-[#2D3E37]/60 uppercase tracking-wider mb-1">Received By</p>
            <p className="font-bold text-[#16221D] text-lg">{receipt.receivedBy?.name || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#16221D]/5 overflow-hidden mb-8">
        <div className="p-6 md:p-8 border-b border-[#16221D]/5">
          <h2 className="text-xl font-bold text-[#4D6E60] flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            Received Items
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#16221D]/5">
            <thead className="bg-[#F5F7F4]/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Received Qty</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Batch #</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#2D3E37] uppercase tracking-wider">Comments</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#16221D]/5">
              {(receipt.items || []).map((item, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={index}
                  className="hover:bg-[#F5F7F4]/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-[#16221D]">
                    {item.genericName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-[#16221D]">
                    {item.receivedQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#2D3E37]">
                    {item.batchNumber || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#2D3E37]">
                    {item.expiryDate
                      ? new Date(item.expiryDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#2D3E37] font-medium">
                    ₹{item.unitPrice?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#2D3E37]">
                    {item.comments || "-"}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#16221D]/5">
          <h2 className="text-xl font-bold text-[#4D6E60] mb-6 border-b border-[#16221D]/5 pb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Quality Check
          </h2>
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#2D3E37]">Status:</span>
            <span
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                receipt.qualityCheck?.passed
                  ? "bg-[#4D6E60]/20 text-[#4D6E60]"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {receipt.qualityCheck?.passed ? "PASSED" : "FAILED"}
            </span>
          </div>
          <div className="bg-[#F5F7F4]/50 p-4 rounded-xl border border-[#16221D]/5">
            <p className="text-xs font-bold text-[#2D3E37]/60 uppercase tracking-wider mb-2">Notes</p>
            <p className="text-sm text-[#16221D] font-medium">{receipt.qualityCheck?.notes || "No notes available"}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#16221D]/5">
          <h2 className="text-xl font-bold text-[#4D6E60] mb-6 border-b border-[#16221D]/5 pb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            Additional Notes
          </h2>
          <div className="bg-[#B47134]/5 p-4 rounded-xl border border-[#B47134]/10 min-h-[100px]">
            <p className="whitespace-pre-wrap text-sm text-[#2D3E37]">
              {receipt.notes || "No additional notes"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default PurchaseReceiptDetail;
