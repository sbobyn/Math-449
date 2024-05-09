default: build

build: src/* 
	npx tsc
	cp src/*.html build
	cp styles/*.css build

serve:
	servez build

clean:
	rm -rf build

deploy:
	./deploy.sh
