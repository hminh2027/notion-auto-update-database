import { Client } from "@notionhq/client";

export class NotionApi {
  constructor(apiKey, databaseId) {
    this.apiKey = apiKey;
    this.databaseId = databaseId;
    this.notion = new Client({
      auth: apiKey,
    });
  }

  async get() {
    try {
      const response = await this.notion.databases.query({
        database_id: this.databaseId,
      });
      return response.results;
    } catch (e) {
      console.log(e);
    }
  }

  async update(pageId, properties) {
    try {
      const response = await this.notion.pages.update({
        page_id: pageId,
        properties,
      });
      return response;
    } catch (e) {
      console.log(e);
    }
  }
}
