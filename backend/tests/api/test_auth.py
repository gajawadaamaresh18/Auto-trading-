import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

@pytest.mark.asyncio
class TestAuthAPI:
    """Test authentication API endpoints."""

    async def test_register_user_success(self, client: AsyncClient, db_session: AsyncSession):
        """Test successful user registration."""
        user_data = {
            "email": "newuser@example.com",
            "name": "New User",
            "password": "newpassword123"
        }
        
        response = await client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["name"] == user_data["name"]
        assert "id" in data
        assert "hashed_password" not in data

    async def test_register_user_duplicate_email(self, client: AsyncClient, test_user: User):
        """Test registration with duplicate email fails."""
        user_data = {
            "email": test_user.email,
            "name": "Another User",
            "password": "password123"
        }
        
        response = await client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 400
        assert "email already registered" in response.json()["detail"].lower()

    async def test_register_user_invalid_email(self, client: AsyncClient):
        """Test registration with invalid email fails."""
        user_data = {
            "email": "invalid-email",
            "name": "Test User",
            "password": "password123"
        }
        
        response = await client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 422

    async def test_register_user_weak_password(self, client: AsyncClient):
        """Test registration with weak password fails."""
        user_data = {
            "email": "test@example.com",
            "name": "Test User",
            "password": "123"
        }
        
        response = await client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == 422

    async def test_login_success(self, client: AsyncClient, test_user: User):
        """Test successful user login."""
        login_data = {
            "username": test_user.email,
            "password": "testpassword"
        }
        
        response = await client.post("/api/v1/auth/login", data=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_invalid_credentials(self, client: AsyncClient):
        """Test login with invalid credentials fails."""
        login_data = {
            "username": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        response = await client.post("/api/v1/auth/login", data=login_data)
        
        assert response.status_code == 401
        assert "incorrect email or password" in response.json()["detail"].lower()

    async def test_login_wrong_password(self, client: AsyncClient, test_user: User):
        """Test login with wrong password fails."""
        login_data = {
            "username": test_user.email,
            "password": "wrongpassword"
        }
        
        response = await client.post("/api/v1/auth/login", data=login_data)
        
        assert response.status_code == 401
        assert "incorrect email or password" in response.json()["detail"].lower()

    async def test_get_current_user_success(self, client: AsyncClient, user_token: str):
        """Test getting current user with valid token."""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = await client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert "name" in data
        assert "hashed_password" not in data

    async def test_get_current_user_invalid_token(self, client: AsyncClient):
        """Test getting current user with invalid token fails."""
        headers = {"Authorization": "Bearer invalid-token"}
        
        response = await client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 401

    async def test_get_current_user_no_token(self, client: AsyncClient):
        """Test getting current user without token fails."""
        response = await client.get("/api/v1/auth/me")
        
        assert response.status_code == 401

    async def test_logout_success(self, client: AsyncClient, user_token: str):
        """Test successful logout."""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = await client.post("/api/v1/auth/logout", headers=headers)
        
        assert response.status_code == 200
        assert response.json()["message"] == "Successfully logged out"

    async def test_logout_no_token(self, client: AsyncClient):
        """Test logout without token fails."""
        response = await client.post("/api/v1/auth/logout")
        
        assert response.status_code == 401

    async def test_refresh_token_success(self, client: AsyncClient, user_token: str):
        """Test successful token refresh."""
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = await client.post("/api/v1/auth/refresh", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_refresh_token_invalid(self, client: AsyncClient):
        """Test token refresh with invalid token fails."""
        headers = {"Authorization": "Bearer invalid-token"}
        
        response = await client.post("/api/v1/auth/refresh", headers=headers)
        
        assert response.status_code == 401

    @pytest.mark.parametrize("email,password,expected_status", [
        ("", "password123", 422),  # Empty email
        ("test@example.com", "", 422),  # Empty password
        ("invalid-email", "password123", 422),  # Invalid email format
        ("test@example.com", "123", 422),  # Weak password
    ])
    async def test_register_validation_errors(self, client: AsyncClient, email: str, password: str, expected_status: int):
        """Test registration validation errors."""
        user_data = {
            "email": email,
            "name": "Test User",
            "password": password
        }
        
        response = await client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == expected_status

    async def test_login_banned_user(self, client: AsyncClient, test_banned_user: User):
        """Test login for banned user fails."""
        login_data = {
            "username": test_banned_user.email,
            "password": "bannedpassword"
        }
        
        response = await client.post("/api/v1/auth/login", data=login_data)
        
        assert response.status_code == 403
        assert "banned" in response.json()["detail"].lower()