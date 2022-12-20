import moment from "moment";

import {
  END_PM_SHIFT,
  REQUIRED_WORKING_HOURS,
  START_AM_SHIFT,
} from "./constant.js";

export const extractColumnData = (rawData, columnName) => {
  return rawData.map((data) => {
    const date = data.properties[columnName].date;
    if (!date) return null;
    return { id: data.id, start: date.start, end: date.end };
  });
};

export const checkBoundaryHour = (time) => {
  return time < START_AM_SHIFT || time > END_PM_SHIFT;
};

// export const getHoursDiff = (start, end) => {
//   return moment(end).diff(moment(start), "hours");
// };

export const getMinutesDiff = (start, end) => {
  return moment(end).diff(moment(start), "hours");
};

export const getWorkingTimeHours = (start, end) => {
  let firstDayWorkingHour = 0;
  let midrangeWorkingHours = 0;
  let lastDayWorkingHour = 0;

  const midrangeWorkingDays = Math.floor(getHoursDiff(start, end) / 24) - 1;

  firstDayWorkingHour = checkBoundaryHour(moment(start).hour())
    ? REQUIRED_WORKING_HOURS
    : getHoursDiff(start, moment(start).set("hours", END_PM_SHIFT));

  lastDayWorkingHour = checkBoundaryHour(moment(end).hour())
    ? REQUIRED_WORKING_HOURS
    : getHoursDiff(moment(end).set("hours", START_AM_SHIFT), end);

  midrangeWorkingHours = midrangeWorkingDays * REQUIRED_WORKING_HOURS;

  return firstDayWorkingHour + lastDayWorkingHour + midrangeWorkingHours;
};
