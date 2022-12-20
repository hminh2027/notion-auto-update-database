import { Client } from "@notionhq/client";
import moment from "moment";
import axios from "axios";

const notion = new Client({
  auth: "secret_ug7qoOq4krLqHeNdyqM1Iiuma6dfy4EJJqL0KMSzX50",
});

const databaseId = "0b4aa99e-f5cf-4300-bbac-5221e061075a";
const WORK_HOUR_RANGE = {
  start: 8,
  end: 17,
  get range() {
    return Math.abs(this.start - this.end);
  },
};
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
const getDeadline = (rawData) => {
  return getColumnData(rawData, "Deadline");
};

const getColumnData = (rawData, columnName) => {
  return rawData.map((data) => {
    const date = data.properties[columnName].date;
    if (!date) return null;
    const { start, end } = date;
    return getWorkHours(start, end);
  });
};

const getDateDiff = (start, end) => {
  return moment(end).diff(moment(start), "days");
};
const getHourDiff = (start, end) => {
  return moment(end).diff(moment(start), "hour");
};
const getWorkHours = (start, end) => {
  const range = getDateDiff(start, end);
  const firstDayStart = moment(start).set("hour", WORK_HOUR_RANGE.start);
  const firstDayEnd = moment(start).set("hour", WORK_HOUR_RANGE.end);
  const lastDayStart = moment(end).set("hour", WORK_HOUR_RANGE.start);
  const lastDayEnd = moment(end).set("hour", WORK_HOUR_RANGE.end);

  const startMoment = moment(start);
  const endMoment = moment(end);

  let firstDayWorkHour = 0;
  let lastDayWorkHour = 0;
  let totalWorkHour = 0;

  if (startMoment.isAfter(firstDayStart)) {
    firstDayWorkHour = getHourDiff(startMoment, firstDayEnd);
  } else {
    firstDayWorkHour = WORK_HOUR_RANGE.range;
  }

  if (endMoment.isBefore(lastDayEnd)) {
    lastDayWorkHour = getHourDiff(lastDayStart, endMoment);
  } else {
    lastDayWorkHour = WORK_HOUR_RANGE.range;
  }

  totalWorkHour =
    firstDayWorkHour + lastDayWorkHour + range * WORK_HOUR_RANGE.range;
  return totalWorkHour;
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
          number: workHours[index],
        },
      },
    };
  });
};
// Main
const rawData = await getDatabaseData();
const workHours = getDeadline(rawData);

const newData = reAssignData(rawData, "Working Time", workHours);

const updateData = (newData) => {
  return newData.map(async (data) => {
    const { id, properties } = data;
    return updateDatabaseData({ id, properties });
  });
};
Promise.allSettled(updateData(newData));

// await updateDatabaseData(rawData[0]);
