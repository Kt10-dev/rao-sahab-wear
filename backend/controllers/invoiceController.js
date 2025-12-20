// backend/controllers/invoiceController.js

const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const PDFDocument = require("pdfkit");

// @desc    Generate PDF Invoice
// @route   GET /api/orders/:id/invoice
// @access  Private (User/Admin)
const generateInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // 1. Create Document
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  // 2. Set Headers
  let filename = `Invoice-${order._id}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  doc.pipe(res);

  // ===========================
  // 🟢 1. HEADER SECTION
  // ===========================

  // Brand Name (Top Left)
  doc
    .fillColor("#2c2c2c")
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("RAO SAHAB WEAR", 50, 50)
    .fontSize(10)
    .font("Helvetica")
    .text("Fashion that defines you", 50, 75)
    .moveDown();

  // Company Details (Top Right)
  doc
    .fillColor("#555555")
    .fontSize(10)
    .text("TAX INVOICE", 200, 50, { align: "right" })
    .text("123, Fashion Street", 200, 65, { align: "right" })
    .text("Madhya Pradesh, India - 473226", 200, 80, { align: "right" })
    .text("GSTIN: 23ABCDE1234F1Z5", 200, 95, { align: "right" })
    .text("support@raosahabwear.com", 200, 110, { align: "right" });

  generateHr(doc, 130);

  // ===========================
  // 🟢 2. BILLING INFO
  // ===========================

  const customerTop = 145;

  // Left Column: Bill To
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor("black")
    .text("Bill To / Ship To:", 50, customerTop)
    .font("Helvetica")
    .text(order.shippingAddress.name || order.user.name, 50, customerTop + 15)
    .text(order.shippingAddress.address, 50, customerTop + 30)
    .text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`,
      50,
      customerTop + 45
    )
    .text(
      `Mobile: ${order.shippingAddress.mobile || "N/A"}`,
      50,
      customerTop + 60
    );

  // Right Column: Invoice Details
  const rightColX = 350;

  doc
    .font("Helvetica-Bold")
    .text("Invoice No:", rightColX, customerTop)
    .font("Helvetica")
    .text(
      order._id.toString().toUpperCase().substring(0, 12),
      rightColX + 90,
      customerTop
    )

    .font("Helvetica-Bold")
    .text("Date:", rightColX, customerTop + 15)
    .font("Helvetica")
    .text(
      new Date(order.createdAt).toLocaleDateString(),
      rightColX + 90,
      customerTop + 15
    )

    .font("Helvetica-Bold")
    .text("Payment Mode:", rightColX, customerTop + 30)
    .font("Helvetica")
    .text(order.paymentMethod, rightColX + 90, customerTop + 30)

    .font("Helvetica-Bold")
    .text("Status:", rightColX, customerTop + 45)
    .fillColor(order.isPaid ? "green" : "red")
    .text(order.isPaid ? "PAID" : "PENDING", rightColX + 90, customerTop + 45);

  generateHr(doc, 225);

  // ===========================
  // 🟢 3. PRODUCT TABLE
  // ===========================

  const tableTop = 240;
  const itemCodeX = 50;
  const descriptionX = 100;
  const quantityX = 280;
  const priceX = 350;
  const totalX = 450;

  // Header Row
  doc
    .fillColor("black")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("#", itemCodeX, tableTop)
    .text("Item Description", descriptionX, tableTop)
    .text("Qty", quantityX, tableTop)
    .text("Price", priceX, tableTop)
    .text("Total", totalX, tableTop);

  generateHr(doc, tableTop + 15);

  // Item Rows
  let i = 0;
  let position = 0;
  doc.font("Helvetica");

  order.orderItems.forEach((item, index) => {
    position = tableTop + 30 + i * 30;

    // Page Break Handling
    if (position > 700) {
      doc.addPage();
      position = 50;
      i = 0;
    }

    doc
      .fontSize(10)
      .text(index + 1, itemCodeX, position)
      .text(
        item.name.substring(0, 35) + (item.name.length > 35 ? "..." : ""),
        descriptionX,
        position
      )
      .text(item.qty, quantityX, position)
      .text(`Rs. ${item.price}`, priceX, position)
      .text(`Rs. ${item.price * item.qty}`, totalX, position);

    generateHr(doc, position + 20);
    i++;
  });

  // ===========================
  // 🟢 4. TOTALS SECTION
  // ===========================

  const subtotalPosition = position + 40;

  const printTotalRow = (label, value, y, isBold = false, color = "black") => {
    doc
      .fillColor(color)
      .font(isBold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(isBold ? 11 : 10)
      .text(label, 300, y, { width: 130, align: "right" }) // Label Right Align
      .text(`Rs. ${value}`, 440, y, { width: 100, align: "left" }); // Value Left Align
  };

  // Fallback values to prevent crash
  const itemsPrice = order.itemsPrice || 0;
  const shippingPrice = order.shippingPrice || 0;
  const taxPrice = order.taxPrice || 0;
  const totalPrice = order.totalPrice || 0;

  printTotalRow("Subtotal:", itemsPrice.toFixed(2), subtotalPosition);
  printTotalRow(
    "Shipping Fee:",
    shippingPrice.toFixed(2),
    subtotalPosition + 15
  );
  printTotalRow("GST (18%):", taxPrice.toFixed(2), subtotalPosition + 30);

  // Grand Total Line
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(300, subtotalPosition + 50)
    .lineTo(550, subtotalPosition + 50)
    .stroke();

  printTotalRow(
    "Grand Total:",
    totalPrice.toFixed(2),
    subtotalPosition + 60,
    true,
    "#0BC5EA"
  );

  // ===========================
  // 🟢 5. FOOTER & TERMS
  // ===========================

  const footerTop = 700;

  doc
    .fillColor("#777777")
    .fontSize(8)
    .font("Helvetica")
    .text("Terms & Conditions:", 50, footerTop)
    .text(
      "1. Goods once sold can be returned within 10 days.",
      50,
      footerTop + 12
    )
    .text(
      "2. This is a computer-generated invoice, no signature required.",
      50,
      footerTop + 24
    )
    .text(
      "3. All disputes are subject to MP jurisdiction.",
      50,
      footerTop + 36
    );

  doc
    .fillColor("black")
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Thank you for shopping with Rao Sahab Wear!", 50, footerTop + 60, {
      align: "center",
      width: 500,
    });

  doc.end();
});

// Helper: Horizontal Line
function generateHr(doc, y) {
  doc.strokeColor("#dddddd").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

module.exports = { generateInvoice };
