default: build

build: src/* 
	npx tsc

clean:
	rm -rf build
