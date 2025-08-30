# EVM Lens Makefile

.PHONY: help dev build migrate migrate-generate migrate-update clean install lint

# Default target
help:
	@echo "Available commands:"
	@echo "  dev              - Start development server"
	@echo "  build            - Build the project"
	@echo "  install          - Install dependencies"
	@echo "  lint             - Run ESLint"
	@echo "  migrate          - Generate migration and update index file"
	@echo "  migrate-generate - Generate Drizzle migration files only"
	@echo "  migrate-update   - Update migration index file only"
	@echo "  clean            - Clean node_modules and package-lock.json"

# Development
dev:
	npm run dev

# Build
build:
	npm run build

# Install dependencies
install:
	npm install

# Lint
lint:
	npm run lint

# Clean
clean:
	rm -rf node_modules package-lock.json
	npm install

# Generate migration and automatically update index file
migrate: migrate-generate migrate-update
	@echo "✅ Migration generated and index file updated successfully!"

# Generate Drizzle migration files
migrate-generate:
	@echo "🔄 Generating Drizzle migration..."
	npx drizzle-kit generate

# Update migration index file with new migrations
migrate-update:
	@echo "🔄 Updating migration index file..."
	node scripts/update-migrations.js

# Create migration with custom name (usage: make migrate-named name=your_migration_name)
migrate-named:
	@if [ -z "$(name)" ]; then \
		echo "❌ Error: Please provide a migration name. Usage: make migrate-named name=your_migration_name"; \
		exit 1; \
	fi
	@echo "🔄 Generating named migration: $(name)"
	npx drizzle-kit generate --name $(name)
	@$(MAKE) migrate-update
	@echo "✅ Named migration '$(name)' generated and index file updated!"
