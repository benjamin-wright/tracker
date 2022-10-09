.PHONY: setup
setup:
	(cd app && npm install)

.PHONY: start
start: stop
	docker run -d \
		--name tracker \
		-v $(shell pwd)/app/dist:/usr/share/nginx/html \
		-p 8080:80 \
		nginx:alpine
	(cd app && npm run watch)

.PHONY: stop
stop:
	-docker stop tracker
	-docker rm tracker

.PHONY: test
test:
	(cd app && npm run test)

publish:
	(cd app && npm run build)
	gcloud storage cp -r ./app/dist/* gs://tracker.ponglehub.co.uk/