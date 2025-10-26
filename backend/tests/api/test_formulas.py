import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.formula import Formula
from app.models.user import User

@pytest.mark.asyncio
class TestFormulasAPI:
    """Test formulas API endpoints."""

    async def test_create_formula_success(self, client: AsyncClient, user_token: str):
        """Test successful formula creation."""
        formula_data = {
            "name": "Test Strategy",
            "description": "A test trading strategy",
            "blocks": [
                {"id": "1", "type": "indicator", "name": "SMA", "parameters": {"period": 20}},
                {"id": "2", "type": "condition", "name": "Price > SMA", "parameters": {}},
                {"id": "3", "type": "action", "name": "Buy", "parameters": {"quantity": 100}},
            ],
            "risk_level": "medium",
            "is_public": True
        }
        
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.post("/api/v1/formulas", json=formula_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == formula_data["name"]
        assert data["description"] == formula_data["description"]
        assert data["risk_level"] == formula_data["risk_level"]
        assert data["is_public"] == formula_data["is_public"]
        assert len(data["blocks"]) == 3
        assert "id" in data
        assert "author_id" in data

    async def test_create_formula_unauthorized(self, client: AsyncClient):
        """Test formula creation without authentication fails."""
        formula_data = {
            "name": "Test Strategy",
            "description": "A test trading strategy",
            "blocks": [],
            "risk_level": "medium",
            "is_public": True
        }
        
        response = await client.post("/api/v1/formulas", json=formula_data)
        
        assert response.status_code == 401

    async def test_create_formula_invalid_data(self, client: AsyncClient, user_token: str):
        """Test formula creation with invalid data fails."""
        formula_data = {
            "name": "",  # Empty name
            "description": "A test trading strategy",
            "blocks": "invalid",  # Should be array
            "risk_level": "invalid",  # Invalid risk level
            "is_public": "yes"  # Should be boolean
        }
        
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.post("/api/v1/formulas", json=formula_data, headers=headers)
        
        assert response.status_code == 422

    async def test_get_formulas_success(self, client: AsyncClient, test_formula: Formula):
        """Test getting formulas list."""
        response = await client.get("/api/v1/formulas")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(formula["id"] == str(test_formula.id) for formula in data)

    async def test_get_formulas_with_filters(self, client: AsyncClient, test_formula: Formula):
        """Test getting formulas with filters."""
        # Test risk level filter
        response = await client.get("/api/v1/formulas?risk_level=medium")
        assert response.status_code == 200
        data = response.json()
        assert all(formula["risk_level"] == "medium" for formula in data)

        # Test public filter
        response = await client.get("/api/v1/formulas?is_public=true")
        assert response.status_code == 200
        data = response.json()
        assert all(formula["is_public"] is True for formula in data)

    async def test_get_formula_by_id_success(self, client: AsyncClient, test_formula: Formula):
        """Test getting formula by ID."""
        response = await client.get(f"/api/v1/formulas/{test_formula.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_formula.id)
        assert data["name"] == test_formula.name

    async def test_get_formula_by_id_not_found(self, client: AsyncClient):
        """Test getting non-existent formula returns 404."""
        response = await client.get("/api/v1/formulas/00000000-0000-0000-0000-000000000000")
        
        assert response.status_code == 404

    async def test_update_formula_success(self, client: AsyncClient, test_formula: Formula, user_token: str):
        """Test successful formula update."""
        update_data = {
            "name": "Updated Strategy",
            "description": "An updated test strategy",
            "risk_level": "high"
        }
        
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.put(f"/api/v1/formulas/{test_formula.id}", json=update_data, headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["description"] == update_data["description"]
        assert data["risk_level"] == update_data["risk_level"]

    async def test_update_formula_unauthorized(self, client: AsyncClient, test_formula: Formula):
        """Test formula update without authentication fails."""
        update_data = {"name": "Updated Strategy"}
        
        response = await client.put(f"/api/v1/formulas/{test_formula.id}", json=update_data)
        
        assert response.status_code == 401

    async def test_update_formula_not_owner(self, client: AsyncClient, test_formula: Formula, admin_token: str):
        """Test formula update by non-owner fails."""
        update_data = {"name": "Updated Strategy"}
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = await client.put(f"/api/v1/formulas/{test_formula.id}", json=update_data, headers=headers)
        
        assert response.status_code == 403

    async def test_delete_formula_success(self, client: AsyncClient, test_formula: Formula, user_token: str):
        """Test successful formula deletion."""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.delete(f"/api/v1/formulas/{test_formula.id}", headers=headers)
        
        assert response.status_code == 200
        assert response.json()["message"] == "Formula deleted successfully"

    async def test_delete_formula_unauthorized(self, client: AsyncClient, test_formula: Formula):
        """Test formula deletion without authentication fails."""
        response = await client.delete(f"/api/v1/formulas/{test_formula.id}")
        
        assert response.status_code == 401

    async def test_delete_formula_not_owner(self, client: AsyncClient, test_formula: Formula, admin_token: str):
        """Test formula deletion by non-owner fails."""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = await client.delete(f"/api/v1/formulas/{test_formula.id}", headers=headers)
        
        assert response.status_code == 403

    async def test_clone_formula_success(self, client: AsyncClient, test_formula: Formula, user_token: str):
        """Test successful formula cloning."""
        clone_data = {
            "name": "Cloned Strategy",
            "description": "A cloned test strategy"
        }
        
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.post(f"/api/v1/formulas/{test_formula.id}/clone", json=clone_data, headers=headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == clone_data["name"]
        assert data["description"] == clone_data["description"]
        assert data["author_id"] != str(test_formula.author_id)  # Different author
        assert len(data["blocks"]) == len(test_formula.blocks)  # Same blocks

    async def test_clone_formula_unauthorized(self, client: AsyncClient, test_formula: Formula):
        """Test formula cloning without authentication fails."""
        clone_data = {"name": "Cloned Strategy"}
        
        response = await client.post(f"/api/v1/formulas/{test_formula.id}/clone", json=clone_data)
        
        assert response.status_code == 401

    async def test_get_user_formulas(self, client: AsyncClient, test_formula: Formula, user_token: str):
        """Test getting user's own formulas."""
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await client.get("/api/v1/formulas/my", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert any(formula["id"] == str(test_formula.id) for formula in data)

    async def test_get_user_formulas_unauthorized(self, client: AsyncClient):
        """Test getting user formulas without authentication fails."""
        response = await client.get("/api/v1/formulas/my")
        
        assert response.status_code == 401

    async def test_search_formulas(self, client: AsyncClient, test_formula: Formula):
        """Test searching formulas."""
        response = await client.get("/api/v1/formulas/search?q=test")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should find the test formula since it contains "test" in name/description

    async def test_get_formula_performance(self, client: AsyncClient, test_formula: Formula):
        """Test getting formula performance metrics."""
        response = await client.get(f"/api/v1/formulas/{test_formula.id}/performance")
        
        assert response.status_code == 200
        data = response.json()
        assert "total_return" in data
        assert "sharpe_ratio" in data
        assert "max_drawdown" in data

    @pytest.mark.parametrize("risk_level,expected_count", [
        ("low", 0),
        ("medium", 1),
        ("high", 0),
    ])
    async def test_formulas_risk_level_filter(self, client: AsyncClient, test_formula: Formula, risk_level: str, expected_count: int):
        """Test filtering formulas by risk level."""
        response = await client.get(f"/api/v1/formulas?risk_level={risk_level}")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == expected_count
        if expected_count > 0:
            assert all(formula["risk_level"] == risk_level for formula in data)