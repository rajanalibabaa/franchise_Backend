import crypto from "crypto";

const order_id = "order_Shi8Wx4hnC6ijh";
const payment_id = "pay_test123";
const secret = "8PAszOgWkXwnrY3e7bV8zTlQ";
const signature = crypto
  .createHmac("sha256", secret)
  .update(order_id + "|" + payment_id)
  .digest("hex");

console.log(signature);