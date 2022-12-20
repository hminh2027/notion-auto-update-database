import moment from "moment";

import { AM_SHIFT, PM_SHIFT, REQUIRED_WORKING_HOURS } from "./constant.js";

export const extractColumnData = (rawData, columnName) => {
  return rawData.map((data) => {
    const date = data.properties[columnName].date;
    if (!date) return null;
    return { id: data.id, start: date.start, end: date.end };
  });
};

export const getHoursDiff = (start, end) => {
  return moment(end).diff(moment(start), "hours");
};

export const getMinutesDiff = (start, end) => {
  return moment(end).diff(moment(start), "minutes");
};

// export const checkAMShiftBoundary = (time) => {
//   if (time < AM_SHIFT.START.HOUR) return 0;
//   if (time >= AM_SHIFT.END.HOUR || time < PM_SHIFT.START.HOUR) return AM_SHIFT.RANGE;
//   return time < AM_SHIFT.START.HOUR || time >= AM_SHIFT.END.HOUR;
// };

// export const checkEndBoundaryHour = (time) => {
//   return time >= PM_SHIFT.END.HOUR;
// };

export const getWorkingTime = (start, end) => {
  let firstDayWorkingHour = 0;
  let midrangeWorkingHours = 0;
  let lastDayWorkingHour = 0;
  let totalWorkingHours = 0;

  const midrangeWorkingDays = Math.floor(getHoursDiff(start, end) / 24) - 1;

  if (moment(start).date === moment(end).date)
    return convertMinutesToHoursAndMinutes(getMinutesDiff(start, end));

  // refactor these
  if (moment(end).hour() < AM_SHIFT.START.HOUR)
    firstDayWorkingHour = REQUIRED_WORKING_HOURS * 60;
  else if (moment(end).hour() >= PM_SHIFT.END.HOUR) firstDayWorkingHour = 0;
  else
    firstDayWorkingHour = getMinutesDiff(
      start,
      moment(start)
        .set("hours", PM_SHIFT.END.HOUR)
        .set("minutes", PM_SHIFT.END.MIN)
    );

  if (moment(end).hour() < AM_SHIFT.START.HOUR) lastDayWorkingHour = 0;
  else if (moment(end).hour() >= PM_SHIFT.END.HOUR)
    lastDayWorkingHour = REQUIRED_WORKING_HOURS * 60;
  else
    lastDayWorkingHour = getMinutesDiff(
      moment(end)
        .set("hours", AM_SHIFT.START.HOUR)
        .set("minutes", AM_SHIFT.START.MIN),
      end
    );

  midrangeWorkingHours = midrangeWorkingDays * REQUIRED_WORKING_HOURS * 60;

  totalWorkingHours =
    firstDayWorkingHour + lastDayWorkingHour + midrangeWorkingHours;

  // console.log(firstDayWorkingHour, lastDayWorkingHour, midrangeWorkingHours);

  return convertMinutesToHoursAndMinutes(totalWorkingHours);
};

const convertMinutesToHoursAndMinutes = (minutes) => {
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 };
};
