# API Documentation for Transactions Server

### Base URL

```
http://localhost:5000/api
```
## Endpoints

### 1. Get Multiple Transactions

**Endpoint:** `/transactions`  
**Method:** `GET`  
**Description:** Fetch a list of transactions based on given time range, pool and pagination details.

#### Request Parameters

| Name  | In     | Required | Type     | Description                                         |
|-------|--------|----------|----------|-----------------------------------------------------|
| start | query  | Yes      | integer  | The starting timestamp in seconds.                  |
| end   | query  | Yes      | integer  | The ending timestamp in seconds.                    |
| pool  | query  | Yes      | string   | The pool name (e.g., 'WETH-USDC').                  |
| page  | query  | No       | integer  | The page number for paginated results.              |
| offset| query  | No       | integer  | The number of results per page.                     |

#### Responses

| Status Code | Description                              | Response Schema                                     |
|-------------|------------------------------------------|-----------------------------------------------------|
| 200         | A list of transactions                  | `{ result: [ { hash: string, usdtFee: number, ethFee: number, blockNumber: number, timestamp: number } ] }` |
| 400         | Bad Request                             | `{ message: string }`                               |
| 500         | Internal Server Error                   | `{ message: string }`                               |

---

### 2. Fetch Live Transactions

**Endpoint:** `/transactions/live`  
**Method:** `GET`  
**Description:** Retrieves live transaction data from the database.

#### Request Parameters

| Name  | In     | Required | Type     | Description                                         |
|-------|--------|----------|----------|-----------------------------------------------------|
| pool  | query  | Yes      | string   | The pool name (e.g., 'WETH-USDC').                  |
| page  | query  | No       | integer  | The page number for paginated results.              |
| offset| query  | No       | integer  | The number of results per page.                     |

#### Responses

| Status Code | Description                              | Response Schema                                     |
|-------------|------------------------------------------|-----------------------------------------------------|
| 200         | A list of live transactions              | `{ result: [ { hash: string, usdtFee: number, ethFee: number, blockNumber: number, timestamp: number } ] }` |
| 400         | Bad Request                             | `{ message: string }`                               |
| 500         | Internal Server Error                   | `{ message: string }`                               |

---

### 3. Fetch Price at Timestamp

**Endpoint:** `/transactions/price`  
**Method:** `GET`  
**Description:** Fetches the price of a specified cryptocurrency at a given timestamp.

#### Request Parameters

| Name   | In     | Required | Type     | Description                                         |
|--------|--------|----------|----------|-----------------------------------------------------|
| time   | query  | Yes      | integer  | The timestamp for which to fetch the price (in seconds). |
| symbol | query  | Yes      | string   | The trading pair symbol (e.g., 'ETHUSDT').         |

#### Responses

| Status Code | Description                              | Response Schema                                     |
|-------------|------------------------------------------|-----------------------------------------------------|
| 200         | The price of the cryptocurrency         | `{ result: { price: number } }`                    |
| 400         | Bad Request                             | `{ message: string }`                               |
| 500         | Internal Server Error                   | `{ message: string }`                               |

---

## Error Responses

Common error responses include:

- **400 Bad Request:** Indicates that the request was malformed. The response will include a message detailing the specific issue.
- **500 Internal Server Error:** Indicates that something went wrong on the server side. The response will include a message detailing the error.
