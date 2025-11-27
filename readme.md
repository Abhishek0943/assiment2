# Communication Platform – Setup & Run Guide

## Requirements

You must have the following installed:

- Docker
- Docker Compose
- Node.js (LTS recommended)
- npm

Project structure:

- docker-compose.yml
- taskRouteService/
- deliveryService/
- logingService/
- comm-frontend/

------------------------------------------------------------

## Services & Ports (Do Not Change)

taskRouteService  → 4000
deliveryService   → 4001
logingService     → 4002
comm-frontend     → 3000

------------------------------------------------------------

## Infrastructure (Docker)

Elasticsearch (internal URL):
http://elasticsearch:9200

Kibana (host URL):
http://localhost:5601

### Start infrastructure

Run this in the project root:

docker compose up -d
(or docker-compose up -d)

------------------------------------------------------------

## Environment Configuration

Each service must contain its own .env file:

./taskRouteService/.env
./deliveryService/.env
./logingService/.env

For taskRouteService:
PORT=4000

For deliveryService:
PORT=4001

For logingService:
PORT=4001

For comm-frontend:
PORT=3000

### Elasticsearch URL (used inside Docker network)

ELASTICSEARCH_HOST=http://elasticsearch:9200

------------------------------------------------------------

## Install Dependencies

Root package.json already includes:

"install:taskRouteService": "npm --prefix ./taskRouteService install",
"install:deliveryService": "npm --prefix ./deliveryService install",
"install:logingService": "npm --prefix ./logingService install",
"install:comm-frontend": "npm --prefix ./comm-frontend install"

To install all services:

npm run install:taskRouteService
npm run install:deliveryService
npm run install:logingService
npm run install:comm-frontend

------------------------------------------------------------

## Start Each Service

To start taskRouteService:

npm --prefix ./taskRouteService run start

To start deliveryService:

npm --prefix ./deliveryService run start

To start logingService:

npm --prefix ./logingService run start

To start comm-frontend:

npm --prefix ./comm-frontend run start

If you added helper scripts in root package.json:

"start:taskRouteService": "npm --prefix ./taskRouteService run start",
"start:deliveryService": "npm --prefix ./deliveryService run start",
"start:logingService": "npm --prefix ./logingService run start",
"start:comm-frontend": "npm --prefix ./comm-frontend run start"

Then you can run:

npm run start:taskRouteService
npm run start:deliveryService
npm run start:logingService
npm run start:comm-frontend

------------------------------------------------------------

## URLs

Backend services:
taskRouteService  → http://localhost:4000
deliveryService   → http://localhost:4001
logingService     → http://localhost:4002

Frontend:
comm-frontend     → http://localhost:3000

Infrastructure:
Elasticsearch     → http://elasticsearch:9200
Kibana            → http://localhost:5601
