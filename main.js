import { NotionApi } from "./api.js";
import * as dotenv from "dotenv";
import { extractColumnData, getWorkingTimeHours } from "./util.js";
import { BASE_COLUMN_NAME, TARGET_COLUMN_NAME } from "./constant.js";
dotenv.config();

// Promise.allSettled(updateData(newData));
// await updateDatabaseData(rawData[0]);

const notion = new NotionApi(
  process.env.NOTION_API_KEY,
  process.env.DATABASE_ID
);

const handleData = (data) => {
  return data.map((d) => {
    if (!d) return null;
    return { id: d.id, workingHours: getWorkingTimeHours(d.start, d.end) };
  });
};

const updateData = (data) => {
  data.map((d) => {
    if (!d) return null;
    notion.update(d.id, { [TARGET_COLUMN_NAME]: { number: d.workingHours } });
  });
};

const rawData = await notion.get();
const extractedData = extractColumnData(rawData, BASE_COLUMN_NAME);
const handledData = handleData(extractedData);
updateData(handledData);
