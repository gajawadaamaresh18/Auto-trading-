import pytest
import asyncio
from typing import AsyncGenerator, Generator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import get_db, Base
from app.core.config import settings
from app.models.user import User
from app.models.formula import Formula
from app.models.trade import Trade
from app.core.security import create_access_token, get_password_hash

# Test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create test session factory
TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()

@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create a test client with database session override."""
    def override_get_db():
        return db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()

@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        email="test@example.com",
        name="Test User",
        hashed_password=get_password_hash("testpassword"),
        is_admin=False,
        is_banned=False
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def test_admin_user(db_session: AsyncSession) -> User:
    """Create a test admin user."""
    user = User(
        email="admin@example.com",
        name="Admin User",
        hashed_password=get_password_hash("adminpassword"),
        is_admin=True,
        is_banned=False
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
async def test_banned_user(db_session: AsyncSession) -> User:
    """Create a test banned user."""
    user = User(
        email="banned@example.com",
        name="Banned User",
        hashed_password=get_password_hash("bannedpassword"),
        is_admin=False,
        is_banned=True
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.fixture
def user_token(test_user: User) -> str:
    """Create a JWT token for test user."""
    return create_access_token(data={"sub": str(test_user.id)})

@pytest.fixture
def admin_token(test_admin_user: User) -> str:
    """Create a JWT token for test admin user."""
    return create_access_token(data={"sub": str(test_admin_user.id)})

@pytest.fixture
def banned_user_token(test_banned_user: User) -> str:
    """Create a JWT token for test banned user."""
    return create_access_token(data={"sub": str(test_banned_user.id)})

@pytest.fixture
async def test_formula(db_session: AsyncSession, test_user: User) -> Formula:
    """Create a test formula."""
    formula = Formula(
        name="Test Formula",
        description="A test formula for unit testing",
        blocks=[
            {"id": "1", "type": "indicator", "name": "SMA", "parameters": {"period": 20}},
            {"id": "2", "type": "condition", "name": "Price > SMA", "parameters": {}},
        ],
        risk_level="medium",
        is_public=True,
        author_id=test_user.id,
        total_return=15.5,
        sharpe_ratio=1.2,
        max_drawdown=-5.3
    )
    db_session.add(formula)
    await db_session.commit()
    await db_session.refresh(formula)
    return formula

@pytest.fixture
async def test_trade(db_session: AsyncSession, test_user: User, test_formula: Formula) -> Trade:
    """Create a test trade."""
    trade = Trade(
        symbol="AAPL",
        side="buy",
        quantity=100,
        price=150.0,
        formula_id=test_formula.id,
        broker_account_id="test-broker-account-id",
        user_id=test_user.id
    )
    db_session.add(trade)
    await db_session.commit()
    await db_session.refresh(trade)
    return trade