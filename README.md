# URL Shortener - Backend

This is the backend of the URL shortener application, built with NestJS and TypeScript.

## 🚀 How to Run

1. Make sure you have Docker and Docker Compose installed.
2. From the root directory, first run (this is important, as we need a network to communicate this backend and the frontend):

```bash
docker network create app-network
```
3. And then run: 
```bash
docker-compose up --build
```

The application will be available at:  
📍 `http://localhost:3000`

## ✅ Endpoints

- `POST /urls/shorten` → Shortens a URL.
- `GET /:slug` → Redirects to the original URL.

## 🧪 Validations

- If the provided URL is invalid, the backend responds with a 400 error.

## ✅ Extra Credits implemented
- 〰️Add support for accounts so people can view the URLs they have created.
- ✔️ Validate the URL provided is an actual URL.
- ✔️ Display an error message if invalid.
- ✔️ Make it easy to copy the shortened URL to the clipboard.
- 〰️ Allow users to modify the slug of their URL.
- 〰️ Track visits to the shortened URL.
- 〰️ Add rate-limiting to prevent bad-actors.
- 〰️ Add a dashboard showing how popular your URLs are.
- ✔️ Build a Docker image of your application.
