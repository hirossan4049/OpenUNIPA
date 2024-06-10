.PHONY: dev
dev:
	yarn build && cd example/bun && time bun run index.ts