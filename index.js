const express = require("express");
const paypal = require("paypal-rest-sdk");

mongoose.connect("mongodb+srv://lakhwinderbahl28:UFBK9UyjXIH5wY4s @cluster0.iw9mlve.mongodb.net/test",
 { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas", err));

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "ARkA_pK7L3Z2A8gAot90tjBP3u1rV5JtPRhzA8pa0dzKhCOPYEMa-N_7r7qUG77YOWOyYJoed97Aq0rM",
  client_secret:
    "EFI_tHLWVXgL54xeUlmLpJcurFC0DR-M1TeNJoOpWWSQvozlYXhuz9HTN7gFTdsd2Sn2H3u6Yad7mn1T",
    
});
const env = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const paypalClient = new paypal.core.PayPalHttpClient(env);

const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

app.post("/pay", (req, res) => {
  const create_payment_json = {
    intent: "Book Fair",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "https://paypalnode.com/success",
      cancel_url: "https://paypalnode.com/cancel",
    },
    transactions: [
      {
        books_list: {
          books: [
            {
              name: "Mobile Data Mangement",
              Author: "Shivali Dhaka",
              price: "50.00",
              currency: "CAD",
              quantity: 10,
            },
          ],
        },
        amount: {
          currency: "CAD",
          total: "500.00",
        },
        description: "Mobile Data Managemnt course Book",
      },
    ],
  };

  

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "5.00",
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (
    error,
    payment
  ) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send("Success");
    }
  });
});

app.get("/cancel", (req, res) => res.send("Cancelled"));

app.listen(PORT, () => console.log(`Server Started on ${PORT}`));
