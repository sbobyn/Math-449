default: build

build: src/* 
	npx tsc
	cp src/*.html build
	cp src/*.css build

clean:
	rm -rf build
