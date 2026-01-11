const { request } = require("./yandex.service");
const { divideResults } = require("../utils/divide.utils");
const { checkForSuggestions } = require("./stations.service");

async function searchSegments(query) {
  const data = await request("search", query);
  const segments = data.segments || [];

  if (segments.length === 0) {
    return await checkForSuggestions(query.from, query.to);
  }

  return divideResults(segments, query.date);
}

module.exports = { searchSegments };
