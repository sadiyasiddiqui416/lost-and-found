# Integral University Lost & Found

A beginner-friendly MERN (MongoDB, Express, React, Node.js) campus lost-and-found board for Integral University, Lucknow. Students can browse/search reports, post lost or found items, contact the reporter using email, and mark reports reunited.

## What is included

- Responsive React website for the campus board.
- Search by item details and filters for Lost/Found and category.
- Form to publish a lost or found report.
- Email link to contact the reporter.
- “Mark as reunited” action and MongoDB-backed statistics.
- Six example reports to use in a demonstration.

## Before you begin

Install Node.js LTS (npm is included). The API also requires MongoDB. You can either install and run MongoDB on your computer or use a MongoDB Atlas database. The previous “campus board could not be reached” message means the website is open but the API/database is not available; `npm run build` only builds the frontend and does not start the database or app.

## Local setup (first run)

1. Open a terminal in this repository folder, the one containing this README.
2. Install the project packages:

	```bash
	npm install
	```

3. Create the server settings file by copying `server/.env.example` to `server/.env`. Keep the defaults for MongoDB installed locally. If using Atlas, replace `MONGODB_URI` with your Atlas connection string and allow your IP in Atlas network access.

	```env
	PORT=5000
	MONGODB_URI=mongodb://127.0.0.1:27017/integral_lost_found
	CLIENT_URL=http://localhost:5173
	```

	Do not upload `server/.env` to a public Git repository.

4. Start MongoDB. On Linux with systemd, try `sudo systemctl start mongod`; on WSL, depending on your setup, `sudo service mongod start` may work. If neither command works, MongoDB may not be installed/configured. Use MongoDB Atlas or follow the installation instructions for your operating system. A successful MongoDB startup is needed before the API can run.
5. (Optional) Load the demo reports:

	```bash
	npm run seed
	```

	This replaces only the sample reports using the demo `@example.com` addresses. It leaves your other reports intact.

6. Start the API and website together:

	```bash
	npm run dev
	```

7. Wait for terminal messages that Vite is ready and the API says “MongoDB connected” / “API ready”. Open **http://localhost:5173** in your browser. Keep this terminal open while using the site. The API health check is **http://localhost:5000/api/health**.
8. To stop both services, focus the terminal and press **Ctrl+C**.

## Demo steps

1. Show the homepage and introduce this as a student project for Integral University, Lucknow.
2. Point out the sample lost/found reports and the open/reunited statistics.
3. Type “library” in the search field, then clear it. Demonstrate the Lost and Found buttons and category selector.
4. Click **I lost something**. Enter sample data such as “Red umbrella”, a campus location, a short description, your demo name/email, then publish.
5. Post a second report using **I found something**, such as “Calculator found near library”.
6. Click the envelope on a card to demonstrate how it opens an email addressed to the reporter. Use only demo email addresses.
7. Click **Mark as reunited** on a report and show that it disappears from the open list while the reunited count increases.
8. Refresh the page to demonstrate that reports/status are stored in MongoDB.

## Common issue: board cannot be reached

- Confirm `npm run dev` is still running and has not exited.
- Look in its terminal for **“MongoDB connected”** and **“API ready at http://localhost:5000”**.
- If it says `ECONNREFUSED 127.0.0.1:27017`, start MongoDB or configure the Atlas URL in `server/.env`, then restart `npm run dev`.
- If port 5000 or 5173 is already occupied, close the other process or use a different free port and update the Vite proxy / `CLIENT_URL` as appropriate.
- If the board is empty after startup, run `npm run seed` and refresh.

## Useful commands

- `npm run dev` — run the frontend and backend for development.
- `npm run dev:client` and `npm run dev:server` — run each part separately in different terminals.
- `npm run seed` — insert the demo reports.
- `npm run build` — build the React frontend (does not run the API or MongoDB).

## API routes

- `GET /api/health` — API status.
- `GET /api/items` — open board; supports `q`, `type`, and `category` filters.
- `GET /api/items/stats` — report totals.
- `POST /api/items` — create a report.
- `PATCH /api/items/:id/resolve` — mark a report reunited.

## Project layout

- `client/` — React + Vite web app.
- `server/` — Express API, Mongoose model, and sample-data script.

This is an educational demo and has no sign-in or report ownership checks. Reporter emails appear on the board. Use sample information, not sensitive personal information. A real deployment should include university authentication, moderation, rate limiting, and privacy controls.
