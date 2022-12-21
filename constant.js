export const AM_SHIFT = {
  START: {
    HOUR: 8,
    MIN: 0,
  },
  END: {
    HOUR: 12,
    MIN: 0,
  },
  // RANGE: this.END.HOUR - this.START.HOUR,
};

export const PM_SHIFT = {
  START: {
    HOUR: 13,
    MIN: 30,
  },
  END: {
    HOUR: 17,
    MIN: 30,
  },
};

export const REQUIRED_WORKING_HOURS = 8;

export const BASE_COLUMN_NAME = "Due";
export const TARGET_COLUMN_NAME_1 = "Working Time (h)";
export const TARGET_COLUMN_NAME_2 = "Working Time (m)";
export const INTERVAL_TIME = 6;
