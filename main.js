import { NotionApi } from "./api.js";
import * as dotenv from "dotenv";
import { extractColumnData, getWorkingTime } from "./util.js";
import {
  BASE_COLUMN_NAME,
  TARGET_COLUMN_NAME_1,
  TARGET_COLUMN_NAME_2,
} from "./constant.js";
dotenv.config();

const notion = new NotionApi(
  process.env.NOTION_API_KEY,
  process.env.DATABASE_ID
);

const handleData = (data) => {
  return data.map((d) => {
    if (!d) return null;
    const { hours, minutes } = getWorkingTime(d.start, d.end);
    return { id: d.id, workingHours: hours, workingMinutes: minutes };
  });
};

const updateData = async (data) => {
  data.map(async (d) => {
    if (!d) return null;
    await notion.update(d.id, {
      [TARGET_COLUMN_NAME_1]: { number: d.workingHours },
    });
    await notion.update(d.id, {
      [TARGET_COLUMN_NAME_2]: { number: d.workingMinutes },
    });
  });
};

const rawData = await notion.get();
const extractedData = extractColumnData(rawData, BASE_COLUMN_NAME);
const handledData = handleData(extractedData);
await updateData(handledData);
