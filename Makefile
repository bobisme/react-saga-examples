PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

default: help

.PHONY: phony
phony:

TEST_FILES ?= 'test/**/*.spec.js'

MOCHA_OPTS := \
	--require babel-register \
	--require babel-polyfill
	# --require test/setup-jsdom

test: phony
	mocha $(MOCHA_OPTS) $(TEST_FILES)

# Terminal color codes.
BLUE := $(shell tput setaf 4)
RESET := $(shell tput sgr0)
.PHONY: help
help:
	@# Find all targets with descriptions.
	@# Split by ":" and the " ##" pattern.
	@# Print just the target, in blue.
	@# Then print the next fields as the description
	@# in case the description has a few ":"s in it.
	@# | sed 's/^[^:]*://'   <-- only if including other makefiles
	@grep -E '^[^ .]+: .*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk '\
			BEGIN { FS = ": .*##" };\
			{ printf "$(BLUE)%-29s$(RESET) %s\n", $$1, $$2  }'
