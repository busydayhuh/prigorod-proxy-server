/**
 * Разделяет сегменты на departed и future
 * @param {Array} segments - массив сегментов от API
 * @param {string} date - необязательная дата фильтрации
 * @returns {{departed: Array, future: Array}}
 */
function divideResults(segments, date) {
  const departed = [];
  const future = [];

  if (!date) {
    return { departed: [], future: [...segments] };
  }

  const targetDate = new Date(date);

  for (const segment of segments) {
    const departureTime = new Date(segment.departure);
    if (departureTime.getTime() > targetDate.getTime()) {
      future.push(segment);
    } else {
      departed.push(segment);
    }
  }

  return { departed, future };
}

/**
 * Разделяет расписание на departed и future
 * @param {Array} segments - массив расписаний от API
 * @param {string} date - необязательная дата фильтрации
 * @returns {{departed: Array, future: Array}}
 */
function divideSchedule(segments, date) {
  const departed = [];
  const future = [];

  if (!date) {
    return { departed: [], future: [...segments] };
  }

  const now = new Date(date);

  for (const segment of segments) {
    // Если нет departure, используем arrival
    const time = new Date(segment.departure || segment.arrival);

    if (time.getTime() > now.getTime()) {
      future.push(segment);
    } else {
      departed.push(segment);
    }
  }

  return { departed, future };
}

/**
 * Проверка для подсказок: ищет похожие станции
 * @param {Array} cachedStations
 * @param {string} fromCode
 * @param {string} toCode
 * @returns {Object} { suggestions: Array }
 */
async function checkForSuggestions(cachedStations, fromCode, toCode) {
  if (!cachedStations) return { suggestions: [] };

  const from = cachedStations.find((s) => s.code === fromCode);
  const to = cachedStations.find((s) => s.code === toCode);

  if (!from || !to) return { suggestions: [] };

  const suggestions = cachedStations.filter(
    (station) =>
      station.direction === from.direction &&
      station.title.includes(to.settlement) &&
      station.station_type === "train_station"
  );

  return { suggestions };
}

module.exports = {
  divideResults,
  divideSchedule,
  checkForSuggestions,
};
