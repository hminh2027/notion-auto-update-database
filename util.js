export const extractColumnData = (rawData, columnName) => {
  return rawData.map((data) => {
    const date = data.properties[columnName].date;
    if (!date) return null;
    return { id: data.id, start: date.start, end: date.end };
  });
};
