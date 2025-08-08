# URL Shortener - Backend

This is the backend of the URL shortener application, built with NestJS and TypeScript.

## 🚀 How to Run

1. Make sure you have Docker and Docker Compose installed.
2. From this directory (`backend`), run:

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

## ✅ Extra Credits

✔️ Validate the URL provided is an actual URL  
✔️ Display an error message if invalid  
✔️ Make it easy to copy the shortened URL to the clipboard  
✔️ Build a Docker image of your application  

> Other extra credit features were not implemented in this version.
