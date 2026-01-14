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

  const now = Date.now();

  for (const segment of segments) {
    const departureTs = Date.parse(segment.departure);

    if (departureTs > now) {
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

  const now = Date.now();

  for (const segment of segments) {
    // Если нет departure, используем arrival
    const departureTs = segment.departure
      ? Date.parse(segment.departure)
      : Date.parse(segment.arrival);

    if (departureTs > now) {
      future.push(segment);
    } else {
      departed.push(segment);
    }
  }

  return { departed, future };
}

module.exports = {
  divideResults,
  divideSchedule,
};
