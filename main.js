import { Client } from "@notionhq/client";
import moment from "moment";
import { NotionApi } from "./api.js";
import * as dotenv from "dotenv";
import { extractColumnData } from "./util.js";
import {
  COLUMN_NAME,
  END_AM_SHIFT,
  END_PM_SHIFT,
  REQUIRED_WORKING_HOURS,
  START_AM_SHIFT,
} from "./constant.js";
dotenv.config();

// const WORK_HOUR_RANGE = {
//   start: 8,
//   end: 17,
//   get range() {
//     return Math.abs(this.start - this.end);
//   },
// };

// const getColumnData = (rawData, columnName) => {
//   return rawData.map((data) => {
//     const date = data.properties[columnName].date;
//     if (!date) return null;
//     const { start, end } = date;
//     return getWorkHours(start, end);
//   });
// };

const getDateDiff = (start, end) => {
  return moment(end).diff(moment(start), "days");
};
const getHourDiff = (start, end) => {
  return moment(end).diff(moment(start), "hours");
};
// const reAssignData = (rawData, columnName, newData) => {
//   return rawData.map((data, index) => {
//     const {
//       created_time,
//       last_edited_time,
//       created_by,
//       last_edited_by,
//       ...datas
//     } = data;
//     return {
//       ...datas,
//       properties: {
//         ...data.properties,
//         [columnName]: {
//           ...data.properties[columnName],
//           number: workHours[index],
//         },
//       },
//     };
//   });
// };
// // Main
// const rawData = await getDatabaseData();
// const workHours = getDeadline(rawData);

// const newData = reAssignData(rawData, "Working Time", workHours);

// const updateData = (newData) => {
//   return newData.map(async (data) => {
//     const { id, properties } = data;
//     return updateDatabaseData({ id, properties });
//   });
// };

// Promise.allSettled(updateData(newData));

// await updateDatabaseData(rawData[0]);

const getOverTimeHours = () => {};

const getWorkingTimeHours = (start, end) => {
  let firstDayWorkingHour = 0;
  let midrangeWorkingHours = 0;
  let lastDayWorkingHour = 0;
  let totalWorkingHour = 0;
  console.log(start, end);

  const midrangeWorkingDays = getDateDiff(start, end);
  const firstDayStart = moment(start).set("hour", START_AM_SHIFT);
  console.log(firstDayStart);
  // const firstDayEnd = moment(start).set("hour", END_PM_SHIFT);

  // const lastDayStart = moment(end).set("hour", START_AM_SHIFT);
  // const lastDayEnd = moment(end).set("hour", END_PM_SHIFT);

  firstDayWorkingHour = Math.abs(
    getHourDiff(start, moment(start).set("hours", START_AM_SHIFT))
  );
  lastDayWorkingHour = Math.abs(
    getHourDiff(end, moment(end).set("hours", END_PM_SHIFT))
  );

  console.log(firstDayWorkingHour, lastDayWorkingHour);
  console.log(midrangeWorkingDays);

  midrangeWorkingDays > 1
    ? (midrangeWorkingHours = midrangeWorkingDays * REQUIRED_WORKING_HOURS)
    : (midrangeWorkingHours = 0);
  return (totalWorkingHour =
    firstDayWorkingHour + lastDayWorkingHour + midrangeWorkingHours);
};

const handleData = (data) => {
  data.map((d) => {
    console.log(getWorkingTimeHours(d.start, d.end));
  });
};

const notionApi = new NotionApi(
  process.env.NOTION_API_KEY,
  process.env.DATABASE_ID
);

const rawData = await notionApi.get();

const extractedData = extractColumnData(rawData, COLUMN_NAME);

handleData(extractedData);
