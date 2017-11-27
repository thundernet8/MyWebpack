export PATH := $(shell pwd)/node_modules/.bin:$(PATH)
.PHONY: init aly dev build clean publish routes

init:
	yarn

aly:
	yarn analyze

dev:
	yarn start

build:
	yarn build

publish:
	yarn publish

clean:
	rm -rf dist

routes:
	yarn routes
