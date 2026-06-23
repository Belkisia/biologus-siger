#!/usr/bin/env bash
set -e
cp -n .env.example .env || true
bun install
echo "Edite .env e rode: bun run dev"
