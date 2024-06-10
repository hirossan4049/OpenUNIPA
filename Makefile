.PHONY: dev
dev:
	yarn build && cd example/bun && bun run index.ts