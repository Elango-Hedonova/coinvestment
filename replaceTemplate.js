module.exports = (temp, detail) => {
  let output = temp.replace(/{%COINVESTMENT_NAME%}/g, detail.coinvestment_name);
  output = output.replace(
    /{%CLIENT_NAME%}/g,
    `${detail.firstname} ${detail.lastname}`
  );
  output = output.replace(/{%CLIENT_ADDRESS_LINEONE%}/g, detail.lineOne);
  output = output.replace(/{%CLIENT_ADDRESS_LINETWO%}/g, detail.lineTwo);
  output = output.replace(/{%CLIENT_CITY%}/g, detail.city);
  output = output.replace(/{%CLIENT_STATE%}/g, detail.state);
  output = output.replace(/{%CLIENT_ZIPCODE%}/g, detail.zip);
  output = output.replace(/{%CLIENT_COUNTRY%}/g, detail.country);
  output = output.replace(/{%CLIENT_ACCOUNT%}/g, detail.hedonovaId);
  output = output.replace(
    /{%T_REFERENCE_ID%}/g,
    detail.transaction.referenceID
  );
  output = output.replace(/{%T_DATE%}/g, detail.transaction.date);
  output = output.replace(/{%T_TYPE%}/g, detail.transaction.type);
  output = output.replace(/{%T_AMOUNT%}/g, detail.transaction.amount);
  output = output.replace(/{%T_SOURCE%}/g, detail.transaction.source);
  output = output.replace(/{%T_LOTS%}/g, detail.transaction.lots);

  return output;
};
