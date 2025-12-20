// backend/utils/shiprocket.js
const axios = require("axios");

let shiprocketToken = null;

// 1. Login & Get Token
const getShiprocketToken = async () => {
  try {
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );
    shiprocketToken = response.data.token;
    return shiprocketToken;
  } catch (error) {
    console.error("Shiprocket Login Error:", error.message);
    return null;
  }
};

// 2. Create Order on Shiprocket
const createShiprocketOrder = async (orderData) => {
  if (!shiprocketToken) await getShiprocketToken();

  // Shiprocket को जिस फॉर्मेट में डेटा चाहिए, वैसा बनाएं
  // Note: Date format YYYY-MM-DD HH:MM:SS होना चाहिए
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  const payload = {
    order_id: orderData._id,
    order_date: currentDate,
    pickup_location: "work", // Shiprocket dashboard se pickup location name check karein
    billing_customer_name: orderData.user.name,
    billing_last_name: "",
    billing_address: orderData.shippingAddress.address,
    billing_city: orderData.shippingAddress.city,
    billing_pincode: orderData.shippingAddress.postalCode,
    billing_state: orderData.shippingAddress.state,
    billing_country: "India",
    billing_email: orderData.user.email,
    billing_phone: orderData.shippingAddress.mobile,
    shipping_is_billing: true,
    order_items: orderData.orderItems.map((item) => ({
      name: item.name,
      sku: item.product.toString(), // Product ID as SKU
      units: item.qty,
      selling_price: item.price,
      discount: "",
      tax: "",
      hsn: "",
    })),
    payment_method: orderData.paymentMethod === "cod" ? "COD" : "Prepaid",
    sub_total: orderData.totalPrice,
    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5, // Dummy dimensions
  };

  try {
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      { headers: { Authorization: `Bearer ${shiprocketToken}` } }
    );
    return response.data;
  } catch (error) {
    // Token expire check
    if (error.response && error.response.status === 401) {
      await getShiprocketToken();
      // Retry logic can be added here
    }
    console.error(
      "Shiprocket Order Error:",
      error.response?.data || error.message
    );
    return null;
  }
};
const getShippingRate = async (
  pickupPincode,
  deliveryPincode,
  weight = 0.5,
  cod = false
) => {
  if (!shiprocketToken) await getShiprocketToken();

  try {
    const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&cod=${
      cod ? 1 : 0
    }&weight=${weight}`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${shiprocketToken}` },
    });

    // Shiprocket returns list of couriers. We pick the recommended one.
    // Usually data.data.available_courier_companies[0].rate
    const couriers = response.data.data.available_courier_companies;

    if (couriers && couriers.length > 0) {
      // Sort by rate (cheapest first)
      couriers.sort((a, b) => a.rate - b.rate);
      return couriers[0].rate; // Sabse sasta rate return karo
    }
    return 50; // Default fallback agar koi courier na mile
  } catch (error) {
    console.error("Shipping Rate Error:", error.message);
    return 0; // Return 0 on error (Fallback logic handle karna padega)
  }
};

module.exports = { getShiprocketToken, createShiprocketOrder, getShippingRate }; // 🟢 Export updated
