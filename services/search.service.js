const { request } = require("./yandex.service");
const { divideResults, checkForSuggestions } = require("../utils/divide.utils");

async function searchSegments(query) {
  const data = await request("search", query);
  const segments = data.segments || [];

  if (segments.length === 0) {
    return await checkForSuggestions(query.from, query.to);
  }

  return divideResults(segments, query.date);
}

module.exports = { searchSegments };
