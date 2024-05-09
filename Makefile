default: build

build: src/* 
	npx tsc

serve:
	servez demo 

clean:
	rm demo/js/*.js*

deploy:
	./deploy.sh
