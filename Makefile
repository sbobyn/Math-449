default: build

build: src/* 
	npx tsc

dist: 
	npx tsc

clean:
	rm -rf build
