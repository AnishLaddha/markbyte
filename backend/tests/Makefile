SHELL := /bin/bash
# Dynamic test targets based on existing test directories
TEST_DIRS := $(notdir $(shell find . -mindepth 1 -maxdepth 1 -type d))


# Default test command: Run all tests in the current directory recursively
test:
	@go test ./... -v

# To run tests for a specific package (e.g., auth, api, cmd)
define TEST_TARGET
test-$(dir): 
	@go test ./$(dir)/... -v
endef
$(foreach dir,$(TEST_DIRS),$(eval $(TEST_TARGET)))

list-tests:
	@echo "Available test targets:"
	@for dir in $(TEST_DIRS); do \
		echo "  test-$$dir"; \
	done

test-files:
	@for dir in $(filter-out $@,$(MAKECMDGOALS)); do \
		echo "Testing directory: $$dir"; \
		go test -v ./$$dir || exit 1; \
	done
	@true

%: # Dummy target to absorb extra arguments
	@:

# Clean up any generated test cache or artifacts (optional)
clean-tests:
	@go clean -testcache

.PHONY: test test-files clean-tests