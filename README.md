# Trading Platform Data Models

This project defines comprehensive data models for a trading platform using SQLAlchemy and Pydantic.

## Models Overview

### Core Models

1. **User** - User management with normal/creator roles
2. **Formula** - Trading formulas created by users
3. **Subscription** - User subscriptions to formulas
4. **Trade** - Trading records and execution history
5. **BrokerAccount** - Broker integrations and account management
6. **Review** - User feedback and ratings on formulas
7. **Notification** - User notifications and alerts

## Features

- **UUID Primary Keys** - All models use UUID as primary keys
- **Comprehensive Indexing** - Optimized database indexes for performance
- **Rich Relationships** - Well-defined foreign key relationships
- **Pydantic Schemas** - Complete API serialization schemas
- **Database Migrations** - Alembic configuration for schema management
- **Type Safety** - Full type hints and validation

## Installation

```bash
pip install -r requirements.txt
```

## Database Setup

1. **PostgreSQL** (Recommended):
   ```bash
   # Update database.py with your PostgreSQL connection string
   DATABASE_URL = "postgresql://user:password@localhost/trading_platform"
   ```

2. **SQLite** (Development):
   ```bash
   # Uncomment SQLite configuration in database.py
   DATABASE_URL = "sqlite:///./trading_platform.db"
   ```

## Usage

### Initialize Database

```python
from database import init_db
init_db()
```

### Create Tables

```python
from database import create_tables
create_tables()
```

### Database Migrations

```bash
# Initialize Alembic (first time only)
alembic init alembic

# Create a new migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

## Model Relationships

```
User (1) ──→ (N) Formula
User (1) ──→ (N) Subscription ──→ (1) Formula
User (1) ──→ (N) Trade ──→ (1) Formula
User (1) ──→ (N) BrokerAccount
User (1) ──→ (N) Review ──→ (1) Formula
User (1) ──→ (N) Notification
Trade (N) ──→ (1) BrokerAccount
```

## Key Features by Model

### User Model
- Role-based access (normal/creator/admin)
- Profile management
- Creator-specific fields
- Account verification

### Formula Model
- Trading algorithm storage
- Version control
- Pricing and monetization
- Performance metrics
- Risk management

### Subscription Model
- Multiple subscription types
- Auto-renewal
- Payment tracking
- Access control

### Trade Model
- Complete trade lifecycle
- Broker integration
- Performance tracking
- Risk management
- Audit trail

### BrokerAccount Model
- Multi-broker support
- Credential management
- Trading permissions
- Sync capabilities

### Review Model
- Multi-dimensional ratings
- Moderation system
- Helpful voting
- Verification system

### Notification Model
- Multi-channel delivery
- Priority levels
- Action tracking
- Batch processing

## API Schemas

Each model has corresponding Pydantic schemas:
- `*Create` - For creating new records
- `*Update` - For updating existing records
- `*Response` - For API responses
- `*List` - For paginated lists
- `*Search` - For search operations
- `*Stats` - For statistics

## Database Indexes

All models include optimized indexes for:
- Primary lookups
- Foreign key relationships
- Common query patterns
- Performance optimization

## Security Considerations

- Sensitive data (passwords, API keys) should be encrypted
- Use environment variables for database credentials
- Implement proper access controls
- Regular security audits recommended

## Development

```bash
# Install development dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

## License

This project is licensed under the MIT License.