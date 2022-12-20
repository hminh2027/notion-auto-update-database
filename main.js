import { Client } from "@notionhq/client";
import moment from "moment";

const notion = new Client({
  auth: "secret_ug7qoOq4krLqHeNdyqM1Iiuma6dfy4EJJqL0KMSzX50",
});

const databaseId = "0b4aa99e-f5cf-4300-bbac-5221e061075a";
const WORK_HOUR = {
  morningStartHour: 8,
  morningStartMinute: 0,
  morningEndHour: 12,
  morningEndMinute: 0,
  afternoonStartHour: 13,
  afternoonStartMinute: 30,
  afternoonEndHour: 17,
  afternoonEndMinute: 30,
  start: 8,
  end: 17,
  get fullMorningMinute() {
    return 240;
  },
  get fullAfternoonMinute() {
    return 240;
  },
  get fullDayMinute() {
    return 480;
  },
};
const BASE_COLUMN = "Date";
const TARGET_COLUMN = "Over Time";
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
const updateDatabaseData = async ({ id, properties }) => {
  try {
    const response = await notion.pages.update({ page_id: id, properties });
    return response;
  } catch (e) {
    console.log(e);
  }
};

const getColumnData = (rawData, columnName) => {
  return rawData.map((data) => {
    const date = data.properties[columnName].date;
    if (!date) return null;
    const { start, end } = date;
    return convertMinuteToHour(getWorkMinutes(start, end));
  });
};

const getDateDiff = (start, end) => {
  return moment(end).diff(moment(start), "days");
};
const getMorningWorkMinutes = (date, isLastDay) => {
  const START = moment(date)
    .set("hour", WORK_HOUR.morningStartHour)
    .set("minute", WORK_HOUR.morningStartMinute);
  const END = moment(date)
    .set("hour", WORK_HOUR.morningEndHour)
    .set("minute", WORK_HOUR.morningEndMinute);
  if (isLastDay && date.isBefore(START)) return 0;

  if (date.isBetween(START, END, "[]"))
    return Math.abs(date.diff(END, "minute"));
  if (date.isBefore(START)) return WORK_HOUR.fullMorningMinute;
  return 0;
};

const getAfternoonWorkMinutes = (date, isLastDay) => {
  const START = moment(date)
    .set("hour", WORK_HOUR.afternoonStartHour)
    .set("minute", WORK_HOUR.afternoonStartMinute);
  const END = moment(date)
    .set("hour", WORK_HOUR.afternoonEndHour)
    .set("minute", WORK_HOUR.afternoonEndMinute);
  if (isLastDay && date.isBefore(START)) return 0;
  if (date.isBetween(START, END, "[]"))
    return Math.abs(date.diff(START, "minute"));
  if (date.isBefore(START)) return WORK_HOUR.fullAfternoonMinute;
  return 0;
};

const getMinutes = (date, isLastDay) => {
  const _date = moment(date);
  const morningMinutes = getMorningWorkMinutes(_date, isLastDay);
  const afternoonMinutes = getAfternoonWorkMinutes(_date, isLastDay);
  return morningMinutes + afternoonMinutes;
};

const getWorkMinutes = (startDate, endDate) => {
  const range = getDateDiff(startDate, endDate);
  const _startDate = moment(startDate);
  const _endDate = moment(endDate);

  if (_startDate.isSame(_endDate)) return 0;
  if (_startDate.date === _endDate.date) return getMinutes(_endDate, true);

  const startDateMinutes = getMinutes(_startDate);
  const lastDateMinutes = getMinutes(_endDate, true);
  const middleDateMinutes = range >= 1 ? range * WORK_HOUR.fullDayMinute : 0;

  return startDateMinutes + lastDateMinutes + middleDateMinutes;
};

const reAssignData = (rawData, columnName, newData) => {
  return rawData.map((data, index) => {
    const {
      created_time,
      last_edited_time,
      created_by,
      last_edited_by,
      ...datas
    } = data;
    return {
      ...datas,
      properties: {
        ...data.properties,
        [columnName]: {
          ...data.properties[columnName],
          rich_text: [
            {
              ...data.properties[columnName].rich_text[0],
              text: { content: newData[index] },
            },
          ],
        },
      },
    };
  });
};
const convertMinuteToHour = (minutes) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour >= 1 ? hour : "00"}:${minute > 10 ? minute : `0${minute}`}`;
};
// Main
const rawData = await getDatabaseData();
const workHours = getColumnData(rawData, BASE_COLUMN);
const newData = reAssignData(rawData, TARGET_COLUMN, workHours);

const updateData = (newData) => {
  return newData.map(async (data) => {
    const { id, properties } = data;
    return updateDatabaseData({ id, properties });
  });
};

Promise.allSettled(updateData(newData)).then(console.log("Done"));

// await updateDatabaseData(rawData[0]);
