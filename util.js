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

export const removeTimezone = (time) => {
  return time.slice(0, 23);
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

  if (!start || !end) return convertMinutesToHoursAndMinutes(0);

  let startWithoutTZ = removeTimezone(start);
  let endWithoutTZ = removeTimezone(end);

  const midrangeWorkingDays =
    Math.floor(getHoursDiff(startWithoutTZ, endWithoutTZ) / 24) - 1;

  if (moment(startWithoutTZ).date() === moment(endWithoutTZ).date())
    return convertMinutesToHoursAndMinutes(
      getMinutesDiff(startWithoutTZ, endWithoutTZ)
    );

  // refactor these
  if (
    moment(startWithoutTZ).isBefore(
      moment(startWithoutTZ)
        .set("hours", AM_SHIFT.START.HOUR)
        .set("minutes", AM_SHIFT.START.MIN)
    )
  )
    firstDayWorkingHour = REQUIRED_WORKING_HOURS * 60;
  else if (
    moment(startWithoutTZ).isAfter(
      moment(startWithoutTZ)
        .set("hours", PM_SHIFT.END.HOUR)
        .set("minutes", PM_SHIFT.END.MIN)
    )
  )
    firstDayWorkingHour = 0;
  else
    firstDayWorkingHour = getMinutesDiff(
      startWithoutTZ,
      moment(startWithoutTZ)
        .set("hours", PM_SHIFT.END.HOUR)
        .set("minutes", PM_SHIFT.END.MIN)
    );

  if (
    moment(endWithoutTZ).isBefore(
      moment(endWithoutTZ)
        .set("hours", AM_SHIFT.START.HOUR)
        .set("minutes", AM_SHIFT.START.MIN)
    )
  )
    lastDayWorkingHour = 0;
  else if (
    moment(endWithoutTZ).isAfter(
      moment(endWithoutTZ)
        .set("hours", PM_SHIFT.END.HOUR)
        .set("minutes", PM_SHIFT.END.MIN)
    )
  )
    lastDayWorkingHour = REQUIRED_WORKING_HOURS * 60;
  else
    lastDayWorkingHour = getMinutesDiff(
      moment(endWithoutTZ)
        .set("hours", AM_SHIFT.START.HOUR)
        .set("minutes", AM_SHIFT.START.MIN),
      endWithoutTZ
    );

  midrangeWorkingHours = midrangeWorkingDays * REQUIRED_WORKING_HOURS * 60;

  totalWorkingHours =
    firstDayWorkingHour + lastDayWorkingHour + midrangeWorkingHours;

  // console.log(startWithoutTZ, endWithoutTZ, "hi");
  // console.log(firstDayWorkingHour, lastDayWorkingHour, midrangeWorkingHours);

  return convertMinutesToHoursAndMinutes(totalWorkingHours);
};

const convertMinutesToHoursAndMinutes = (minutes) => {
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 };
};
