.PHONY: help setup start stop restart logs clean test-api

help:
	@echo "🚀 FLOTA SYSTEM - DOSTĘPNE KOMENDY:"
	@echo ""
	@echo "make setup   - Setup Docker"
	@echo "make start   - Uruchom wszystko"
	@echo "make stop    - Stop"
	@echo "make logs    - Pokaż logi"
	@echo ""

setup:
	docker-compose build

start:
	docker-compose up -d

stop:
	docker-compose down

logs:
	docker-compose logs -f

test-api:
	curl http://localhost:5000/api/health

db-shell:
	docker-compose exec db psql -U krystek -d flota_db
