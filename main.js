import { Client } from "@notionhq/client";
import moment from "moment";

const notion = new Client({
  auth: "secret_ug7qoOq4krLqHeNdyqM1Iiuma6dfy4EJJqL0KMSzX50",
});

const databaseId = "0b4aa99e-f5cf-4300-bbac-5221e061075a";

const getDatabaseData = async () => {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });
    return response.results;
  } catch (e) {
    console.log(e);
  }
};

const getDeadline = (rawData) => {
  rawData.map((data) => {});
  return;
};

const getColumnData = (rawData, columnName) => {
  let result = [];
  return rawData.map((data) => {
    result.push(getDatediff(data.properties[columnName].date));
  });
  console.log(result);
  // return rawData
};

const getDatediff = (row) => {
  const start = moment(row.start);
  const end = moment(row.end);
  return end.diff(start, "days");
};

const caculateHandler = (startDate, endDate) => {};

// Main
const res = await getDatabaseData();
// const res2 = getColumnData(res, "Deadline");
console.log(res);
