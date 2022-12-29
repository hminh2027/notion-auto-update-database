import { NotionApi } from "./api.js";
import * as dotenv from "dotenv";
import { extractColumnData } from "./util.js";
import { BASE_COLUMN_NAME, INTERVAL_TIME } from "./constant.js";

import { DataHandler } from "./data_handler.js";
dotenv.config();

const notion = new NotionApi(
  process.env.NOTION_API_KEY,
  process.env.DATABASE_ID
);

const dataHandler = new DataHandler(notion);

// setInterval(async () => {
const rawData = await notion.get();
const extractedData = extractColumnData(rawData, BASE_COLUMN_NAME);
const handledData = dataHandler.handleData(extractedData);
await dataHandler.updateData(handledData);
// }, INTERVAL_TIME * 1000);
