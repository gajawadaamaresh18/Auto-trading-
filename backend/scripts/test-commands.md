# Backend Test Scripts

## Test Execution Commands

### Unit Tests
```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=html --cov-report=term-missing

# Run specific test file
pytest tests/test_services/test_formula_engine.py

# Run tests matching pattern
pytest -k "test_formula_engine"

# Run tests in parallel
pytest -n auto

# Run tests with verbose output
pytest -v

# Run tests with detailed output
pytest -vv

# Run tests and stop on first failure
pytest -x

# Run tests and show local variables on failure
pytest -l
```

### Integration Tests
```bash
# Run API tests
pytest tests/test_api/

# Run integration tests
pytest tests/test_integrations/

# Run with database
pytest tests/test_api/ --cov=app

# Run specific integration test
pytest tests/test_integrations/test_broker_integration.py
```

### Performance Tests
```bash
# Run performance tests
pytest tests/test_performance/ --benchmark-only

# Run performance tests with detailed output
pytest tests/test_performance/ --benchmark-only --benchmark-sort=mean

# Run performance tests and save results
pytest tests/test_performance/ --benchmark-only --benchmark-save=performance_results
```

### Coverage Analysis
```bash
# Generate coverage report
pytest --cov=app --cov-report=html

# Generate coverage report with missing lines
pytest --cov=app --cov-report=term-missing

# Generate coverage report in XML format
pytest --cov=app --cov-report=xml

# Generate coverage report with threshold
pytest --cov=app --cov-fail-under=80
```

### Test Markers
```bash
# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration

# Run only API tests
pytest -m api

# Run only broker tests
pytest -m broker

# Run only formula tests
pytest -m formula

# Run only risk tests
pytest -m risk

# Run only auth tests
pytest -m auth

# Run only database tests
pytest -m database

# Run slow tests
pytest -m slow

# Skip slow tests
pytest -m "not slow"
```

### Test Configuration
```bash
# Run tests with specific configuration
pytest --config=test_config.ini

# Run tests with specific environment
TESTING=true pytest

# Run tests with specific database
DATABASE_URL=sqlite:///./test.db pytest

# Run tests with specific Redis
REDIS_URL=redis://localhost:6379/1 pytest
```

### Test Debugging
```bash
# Run tests with debug output
pytest --log-cli-level=DEBUG

# Run tests with specific log level
pytest --log-cli-level=INFO

# Run tests with log file
pytest --log-file=test.log

# Run tests with capture disabled
pytest -s

# Run tests with pdb on failure
pytest --pdb

# Run tests with pdb on error
pytest --pdb-on-error
```

### Test Cleanup
```bash
# Clear pytest cache
pytest --cache-clear

# Clear coverage cache
coverage erase

# Remove test artifacts
rm -rf htmlcov/
rm -rf .pytest_cache/
rm -rf test-results.xml
rm -rf coverage.xml
```

### CI/CD Commands
```bash
# Run tests for CI
pytest --cov=app --cov-report=xml --cov-report=html --junitxml=test-results.xml

# Run tests with coverage threshold
pytest --cov=app --cov-fail-under=80 --cov-report=xml

# Run tests in parallel for CI
pytest -n auto --cov=app --cov-report=xml

# Run tests with timeout
pytest --timeout=300

# Run tests with max failures
pytest --maxfail=5
```

### Test Data Management
```bash
# Generate test data
python scripts/generate_test_data.py

# Reset test database
python scripts/reset_test_db.py

# Backup test data
python scripts/backup_test_data.py

# Restore test data
python scripts/restore_test_data.py
```

### Test Monitoring
```bash
# Run tests with performance monitoring
pytest --durations=10

# Run tests with memory profiling
pytest --profile

# Run tests with coverage monitoring
pytest --cov=app --cov-report=term-missing --cov-report=html
```

### Test Maintenance
```bash
# Update test dependencies
pip install -r requirements-dev.txt --upgrade

# Check test dependencies
pip check

# Validate test configuration
pytest --collect-only

# List test markers
pytest --markers

# List test collection
pytest --collect-only -q
```
