# Proxy Server for Prigorod app

This project is a Node.js-based backend proxy server that interacts with the [Яндекс Расписания API](https://yandex.ru/dev/rasp/). It provides a set of endpoints to fetch train schedules, station data, and other related information while handling caching, filtering, and error management.

**Frontend:** [Prigorod](https://github.com/busydayhuh/prigorod) 

## Features

- **Proxy API Requests**: Acts as a proxy to securely call the Яндекс Расписания API.
- **Caching**: Utilizes `apicache` to cache responses and reduce API call frequency.
- **Data Filtering**: Filters and processes station and schedule data for frontend consumption.
- **Error Handling**: Handles API errors and provides meaningful responses to the client.
- **CORS Support**: Allows cross-origin requests for seamless integration with frontend applications.


## Technologies Used

- **Node.js**: Backend runtime environment.
- **Express.js**: Web framework for building the API.
- **Needle**: Lightweight HTTP client for making API requests.
- **Apicache**: Middleware for caching API responses.
- **CORS**: Middleware for handling cross-origin requests.


## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)

## Getting Started


1. Clone the repository:
```
git clone https://github.com/busydayhuh/prigorod-proxy-server.git
cd prigorod-proxy-server
```

2. Install dependencies:
```
npm install
```

3. Create a `.env` file in the root directory and configure the following environment variables:
```
API_BASE_URL=https://api.rasp.yandex.net/v3.0
API_KEY_NAME=apikey
API_KEY_VALUE=your_yandex_api_key
PROXY_BASE_URL=http://localhost:<YOUR_PORT>
```

4. Start the server:
```
npm run dev
```

## API Endpoints
🐱
`/stations_list`
- **Method:** `GET`
- **Description:** Fetches a list of train stations in Russia.
- **Cache Duration:** 3 days
Example:
```
GET /stations_list
```
🐱
`/stations_search`
- **Method:** `GET`
- **Description:** Searches for stations by name.
- **Query Parameters:**
  - `q (optional)`: Search query.
  - `limit (optional)`: Maximum number of results (default: 15).
- **Cache Duration:** 5 minutes
Example:
```
GET /stations_search?q=Болшево
```

🐱
`/search`
- **Method:** `GET`
- **Description:** Searches for train schedules between two stations.
- **Query Parameters:**
  - `from`: Departure station Yandex code.
  - `to`: Arrival station Yandex code.
  - `date (optional)`: Date of travel.
Example:
```
GET /search?from=s2000001&to=s9600830&date=2025-03-26
```

🐱
`/schedule`
- **Method:** `GET`
- **Description:** Fetches the schedule for a specific station.
- **Query Parameters:**
  - `station`: Station Yandex code.
  - `date (optional)`: Date of the schedule.
**Cache Duration:** 2 minutes
Example:
```
GET /schedule?station=s2000001&date=2025-03-26
```

🐱
`/directions`
- **Method:** `GET`
- **Description:** Fetches available directions for a station.
- **Query Parameters:**
  - `station`: Station Yandex code.
**Cache Duration:** 1 day
Example:
```
GET /directions?station=s2000001
```

🐱
`/thread`
- **Method:** `GET`
- **Description:** Fetches detailed information about a specific train thread.
- **Query Parameters:**
  - `thread`: Thread UID.
  - `date (optional)`: Date of the schedule.
**Cache Duration:** 1 hour
Example:
```
GET /thread?uid=6390x6389_0_9601222_g25_4&date=2025-03-26
```

🐱
`/nearest_stations`
- **Method:** `GET`
- **Description:** Fetches the nearest stations to a given location.
- **Query Parameters:**
  - `lat`: Latitude of the location.
  - `lng`: Longitude of the location.
**Cache Duration:** 1 day
Example:
```
GET /nearest_stations?lat=55.7522&lng=37.6156
```

## Acknowledgments
This project uses the Яндекс Расписания API to fetch train schedules and station data. For more information about the [Яндекс Расписания API](https://yandex.ru/dev/rasp/), visit their official documentation.

## License
Distributed under the MIT License. See LICENSE.txt for more information.
