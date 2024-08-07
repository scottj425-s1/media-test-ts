# Media Server TypeScript Example

## Requirements

---
* NodeJS 22
* Docker

## Getting Started

---

1. Clone repository
2. Run `docker compose up -d` to start MongoDB
3. Run `npm i` to install dependencies
4. Run `npm run gen-routes` to generate swagger and routes
5. Run `npm run dev` to launch server

### Swagger should listen at http://localhost:3000/api-docs


## Swagger and route generation

---

We are using a library called [tsoa](https://github.com/lukeautry/tsoa) that will generate the express routes and swagger documentation based off files in `src/controllers`.

You can generate new routes and swagger documentation by running `npm run gen-routes` after modifying the controllers.

