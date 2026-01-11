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

module.exports = {
  divideResults,
  divideSchedule,
};
