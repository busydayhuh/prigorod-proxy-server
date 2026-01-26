const needle = require("needle");

const { API_BASE_URL, API_KEY_NAME, API_KEY_VALUE } = process.env;

function buildParams(query) {
  const { apikey, ...safeQuery } = query;

  const params = new URLSearchParams({
    [API_KEY_NAME]: API_KEY_VALUE,
  });

  Object.entries(safeQuery).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value);
    }
  });

  return params;
}

async function request(path, query) {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not defined");
  }

  try {
    const params = buildParams(query);
    const res = await needle(
      "GET",
      `${API_BASE_URL}/${path}/?lang=ru_RU&format=json&limit=1000&${params}`,
    );

    if (res.statusCode !== 200) {
      const yandexErrorText = res.body?.error?.text || "Yandex API error";

      const error = new Error(yandexErrorText);
      error.status = res.statusCode;
      error.source = "yandex";

      console.error("[YANDEX API ERROR]", {
        path,
        status: res.statusCode,
        message: yandexErrorText,
        request: res.body?.error?.request,
      });

      throw error;
    }

    return res.body;
  } catch (err) {
    if (err.source) {
      throw err;
    }

    if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
      const error = new Error("Yandex API unavailable");
      error.status = 502;
      error.source = "network";

      console.error("[NETWORK ERROR]", {
        path,
        code: err.code,
        message: err.message,
      });

      throw error;
    }

    err.status ??= 500;

    console.error("[INTERNAL ERROR]", {
      path,
      status: err.status,
      message: err.message,
      stack: err.stack,
    });

    throw err;
  }
}

module.exports = {
  request,
};
