default: build

build: src/* 
	npx tsc
	cp src/*.html build

clean:
	rm -rf build
