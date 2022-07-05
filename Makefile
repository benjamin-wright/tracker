.PHONY: start
start:
	docker run -d \
		--name tracker \
		-v $(shell pwd)/dist:/usr/share/nginx/html \
		-p 8080:80 \
		nginx:alpine
	npm run watch

.PHONY: stop
stop:
	docker stop tracker
	docker rm tracker

.PHONY: test
test:
	npm run test