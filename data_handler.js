import { TARGET_COLUMN_NAME_1, TARGET_COLUMN_NAME_2 } from "./constant.js";
import { getWorkingTime } from "./util.js";

export class DataHandler {
  constructor(notion) {
    this.notion = notion;
  }
  handleData = (data) => {
    return data.map((d) => {
      if (!d) return null;
      const { hours, minutes } = getWorkingTime(d.start, d.end);
      return { id: d.id, workingHours: hours, workingMinutes: minutes };
    });
  };
  updateData = async (data) => {
    data.map(async (d) => {
      if (!d) return null;
      await this.notion.update(d.id, {
        [TARGET_COLUMN_NAME_1]: { number: d.workingHours },
      });
      await this.notion.update(d.id, {
        [TARGET_COLUMN_NAME_2]: { number: d.workingMinutes },
      });
    });
  };
}
