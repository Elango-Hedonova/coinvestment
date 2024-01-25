const express = require("express");
const { default: puppeteer } = require("puppeteer");
const app = express();
const https = require("https");

require("dotenv").config();
app.use(cors());

const REGION = "ny"; // If German region, set this to an empty string: ''
const BASE_HOSTNAME = "storage.bunnycdn.com";
const HOSTNAME = REGION ? `${REGION}.${BASE_HOSTNAME}` : BASE_HOSTNAME;
const STORAGE_ZONE_NAME = "hedonova-files";

const ACCESS_KEY = "9ef1942c-c7bb-46c5-a597fbb3f31b-3b90-4e0f";

// const uploadFile = async () => {
//   const readStream = fs.createReadStream(FILE_PATH);

//   const options = {
//     method: "PUT",
//     host: HOSTNAME,
//     path: `/${STORAGE_ZONE_NAME}/${FILENAME_TO_UPLOAD}`,
//     headers: {
//       AccessKey: ACCESS_KEY,
//       "Content-Type": "application/octet-stream",
//     },
//   };

//   console.log(options);

//   const req = https.request(options, (res) => {
//     res.on("data", (chunk) => {
//       console.log("data", chunk.toString("utf8"));
//     });
//   });

//   req.on("error", (error) => {
//     console.error("error", error);
//   });

//   readStream.pipe(req);
// };

const uploadFile = async (pdfContent) => {
  const FILENAME_TO_UPLOAD = "result2.pdf";
  const options = {
    method: "PUT",
    host: HOSTNAME,
    path: `/${STORAGE_ZONE_NAME}/coinvestment/${FILENAME_TO_UPLOAD}`,
    headers: {
      AccessKey: ACCESS_KEY,
      "Content-Type": "application/octet-stream",
    },
  };

  console.log(options);

  const req = https.request(options, (res) => {
    res.on("data", (chunk) => {
      console.log("data", chunk.toString("utf8"));
    });
  });

  req.on("error", (error) => {
    console.error("error", error);
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

app.get("/create-contract-note", async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent("<h1>Hello world</h1>");

  await page.emulateMediaType("screen");

  const pdf = await page.pdf({
    // path: "result.pdf",
    // margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
    printBackground: true,
    format: "A4",
  });
  console.log(pdf);
  await browser.close();
  uploadFile(pdf);

  res.json({
    status: "success",
    pdf,
    message: "pdf created successfully",
  });
});

const port = process.env.PORT || 3030;

app.listen(port, function () {
  console.log("server is listening on the port " + port);
});
