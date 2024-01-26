const express = require("express");
const { default: puppeteer } = require("puppeteer");
const app = express();
const https = require("https");
const cors = require("cors");
const fs = require("fs");
const replaceTemplate = require("./replaceTemplate");

require("dotenv").config();
app.use(cors());
// For parsing application/json
app.use(express.json());

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const textIn = fs.readFileSync("./index.html", "utf-8");

const REGION = "ny"; // If German region, set this to an empty string: ''
const BASE_HOSTNAME = "storage.bunnycdn.com";
const HOSTNAME = REGION ? `${REGION}.${BASE_HOSTNAME}` : BASE_HOSTNAME;
const STORAGE_ZONE_NAME = "hedonova-files";

const ACCESS_KEY = process.env.ACCESS_KEY_BUNNY;

const uploadFile = async (pdfContent, res) => {
  const FILENAME_TO_UPLOAD = `Coinvestment_contract_note_${Date.now()}.pdf`;
  const options = {
    method: "PUT",
    host: HOSTNAME,
    path: `/${STORAGE_ZONE_NAME}/coinvestment/${FILENAME_TO_UPLOAD}`,
    headers: {
      AccessKey: ACCESS_KEY,
      "Content-Type": "application/octet-stream",
    },
  };

  const req = https.request(options, (externalServerRes) => {
    let externalServerResponseData = "";

    externalServerRes.on("data", (chunk) => {
      externalServerResponseData += chunk;
    });

    externalServerRes.on("end", () => {
      // Now you have the complete response from the external server
      console.log("External server response:", externalServerResponseData);

      // Send a response to the client based on the external server's response
      res.json({
        ...JSON.parse(externalServerResponseData),
        fileUrl: `https://hedonova.b-cdn.net/coinvestment/${FILENAME_TO_UPLOAD}`,
      });
    });
  });

  req.on("error", (error) => {
    console.error("error", error);
    // Handle the error and send an error response to the client
    res.status(500).json({
      status: "error",
      message: "Failed to upload PDF",
      error: error.message,
    });
  });

  // Pipe the PDF content directly into the request
  req.write(pdfContent);
  req.end();
};

app.get("/", (req, res) => {
  res.json({
    message: "Coinvestment contract note",
  });
});

app.post("/create-contract-note", async (req, res) => {
  console.log(req.body.email);

  try {
    const loginDetail = await fetch(
      "https://api-live.hedonova.io/admin-api/v2/signin-with-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "metaelango@gmail.com",
          password: "hedonova",
        }),
      }
    );
    const loginDetailResponse = await loginDetail.json();
    token = loginDetailResponse.data.token;
    id = loginDetailResponse.data.id;

    const usersDetail = await fetch(
      "https://api-live.hedonova.io/admin-api/v2/users-list",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          adminId: id,
        }),
      }
    );

    const usersDetailResponse = await usersDetail.json();
    const users = usersDetailResponse.data;
    const user = users.filter((user) => user.email === req.body.email);

    const getUser = await fetch(
      "https://api-live.hedonova.io/admin-api/v2/get-user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          adminId: id,
          userId: user[0].id,
        }),
      }
    );

    const getUserResponse = await getUser.json();
    const userCompleteDetail = getUserResponse.data;

    const pdfDetails = {
      firstname: userCompleteDetail.user.firstName
        ? userCompleteDetail.user.firstName
        : "",
      lastname: userCompleteDetail.user.lastName
        ? userCompleteDetail.user.lastName
        : "",

      lineOne: userCompleteDetail.user.address?.lineOne || "",
      lineTwo: userCompleteDetail.user.address?.lineTwo || "",
      country: userCompleteDetail.user.address?.country || "",
      state: userCompleteDetail.user.address?.state || "",
      city: userCompleteDetail.user.address?.city || "",
      zip: userCompleteDetail.user.address?.zipCode || "",
      hedonovaId: userCompleteDetail.user?.accountNumber || "",
      transaction: {
        date: req.body.transaction.date,
        type: req.body.transaction.type,
        amount: req.body.transaction.amount,
        source: req.body.transaction.source,
        referenceID: req.body.transaction.referenceID,
      },
      coinvestment_name: req.body.coinvestment_name,
    };

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const output = replaceTemplate(textIn, pdfDetails);

    await page.setContent(output, { waitUntil: "networkidle0" });

    await page.emulateMediaType("screen");

    const pdf = await page.pdf({
      // path: `Coinvestment_contract_note_${Date.now()}.pdf`,
      // margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
      printBackground: true,
      format: "A4",
    });
    await browser.close();
    uploadFile(pdf, res);
    // res.json({
    //   status: "success",

    //   message: "pdf created successfully",
    //   pdfDetails,
    // });
  } catch (error) {
    res.json({
      status: "Failed",

      message: "pdf not created",
    });
  }
});

const port = process.env.PORT || 3030;

app.listen(port, function () {
  console.log("server is listening on the port " + port);
});
