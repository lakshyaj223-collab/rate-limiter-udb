# API Rate Limiter (Unstructured Database Assignment)
A Node.js & Express backend implementing a Fixed Window rate limiter (5 requests per 60 seconds) using MongoDB and a TTL index for automatic document expiration.

## How to Run
1. Run `npm install`
2. Ensure local MongoDB is running on `mongodb://127.0.0.1:27017`
3. Run `node server.js` and open `http://localhost:3000`