"""
Unit tests for the FastAPI endpoints
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from services.risk import RiskService, RiskConfig, TradeData


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


@pytest.fixture
def sample_validation_request():
    """Sample validation request data"""
    return {
        "trade": {
            "symbol": "BTC/USDT",
            "entry_price": 50000.0,
            "position_size": 0.1,
            "stop_loss": 48000.0,
            "take_profit": 52000.0,
            "stop_loss_type": "fixed",
            "take_profit_type": "fixed",
            "current_price": 50000.0,
            "portfolio_value": 10000.0,
            "leverage": 1.0
        },
        "risk_config": {
            "max_portfolio_risk": 0.02,
            "max_position_size": 0.1,
            "max_risk_per_trade": 0.01,
            "max_drawdown": 0.05,
            "min_risk_reward_ratio": 1.0,
            "max_leverage": 1.0
        }
    }


class TestAPIEndpoints:
    """Test cases for API endpoints"""
    
    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["message"] == "Risk Control API is running"
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "risk-control"
    
    def test_validate_trade_approved(self, client, sample_validation_request):
        """Test trade validation for approved trade"""
        response = client.post("/api/risk/validate", json=sample_validation_request)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "approved"
        assert "approved" in data["message"].lower()
        assert "risk_metrics" in data
        assert not data["risk_metrics"]["is_risky"]
    
    def test_validate_trade_rejected(self, client, sample_validation_request):
        """Test trade validation for rejected trade"""
        # Modify request to make it risky
        sample_validation_request["trade"]["position_size"] = 0.5  # Exceeds max position size
        
        response = client.post("/api/risk/validate", json=sample_validation_request)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "rejected"
        assert "rejected" in data["message"].lower()
        assert data["risk_metrics"]["is_risky"]
        assert len(data["risk_metrics"]["violations"]) > 0
    
    def test_validate_trade_warning(self, client, sample_validation_request):
        """Test trade validation for trade with warnings"""
        # Modify request to create warnings (poor risk:reward ratio)
        sample_validation_request["trade"]["take_profit"] = 50100.0  # Very close take profit
        
        response = client.post("/api/risk/validate", json=sample_validation_request)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "warning"
        assert "warning" in data["message"].lower()
        assert not data["risk_metrics"]["is_risky"]
        assert len(data["risk_metrics"]["warnings"]) > 0
    
    def test_calculate_risk_metrics(self, client, sample_validation_request):
        """Test risk metrics calculation endpoint"""
        response = client.post("/api/risk/calculate", json=sample_validation_request)
        
        assert response.status_code == 200
        data = response.json()
        assert "risk_amount" in data
        assert "reward_amount" in data
        assert "risk_reward_ratio" in data
        assert "portfolio_risk_percentage" in data
        assert "position_risk_percentage" in data
        assert "is_risky" in data
        assert "violations" in data
        assert "warnings" in data
        assert "recommendations" in data
    
    def test_calculate_max_position_size(self, client):
        """Test maximum position size calculation endpoint"""
        response = client.post(
            "/api/risk/calculate-max-position",
            params={
                "entry_price": 50000.0,
                "stop_loss": 48000.0,
                "stop_loss_type": "fixed",
                "portfolio_value": 10000.0,
                "max_risk_percentage": 0.02
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "max_position_size" in data
        assert "max_risk_amount" in data
        assert data["max_position_size"] > 0
        assert data["max_risk_amount"] == 200.0  # 10000 * 0.02
    
    def test_calculate_optimal_take_profit(self, client):
        """Test optimal take profit calculation endpoint"""
        response = client.post(
            "/api/risk/calculate-optimal-tp",
            params={
                "entry_price": 50000.0,
                "stop_loss": 48000.0,
                "stop_loss_type": "fixed",
                "min_risk_reward_ratio": 2.0
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "optimal_take_profit" in data
        assert "risk_reward_ratio" in data
        assert data["optimal_take_profit"] > 50000.0  # Should be higher than entry price
        assert data["risk_reward_ratio"] == 2.0
    
    def test_validate_trade_invalid_data(self, client):
        """Test trade validation with invalid data"""
        invalid_request = {
            "trade": {
                "symbol": "BTC/USDT",
                "entry_price": "invalid",  # Invalid price
                "position_size": 0.1,
                "stop_loss": 48000.0,
                "take_profit": 52000.0,
                "stop_loss_type": "fixed",
                "take_profit_type": "fixed",
                "current_price": 50000.0,
                "portfolio_value": 10000.0,
                "leverage": 1.0
            },
            "risk_config": {
                "max_portfolio_risk": 0.02,
                "max_position_size": 0.1,
                "max_risk_per_trade": 0.01,
                "max_drawdown": 0.05,
                "min_risk_reward_ratio": 1.0,
                "max_leverage": 1.0
            }
        }
        
        response = client.post("/api/risk/validate", json=invalid_request)
        assert response.status_code == 422  # Validation error
    
    def test_validate_trade_missing_fields(self, client):
        """Test trade validation with missing required fields"""
        incomplete_request = {
            "trade": {
                "symbol": "BTC/USDT",
                "entry_price": 50000.0,
                # Missing other required fields
            },
            "risk_config": {
                "max_portfolio_risk": 0.02,
                "max_position_size": 0.1,
                "max_risk_per_trade": 0.01,
                "max_drawdown": 0.05
            }
        }
        
        response = client.post("/api/risk/validate", json=incomplete_request)
        assert response.status_code == 422  # Validation error
    
    def test_calculate_max_position_size_invalid_params(self, client):
        """Test max position size calculation with invalid parameters"""
        response = client.post(
            "/api/risk/calculate-max-position",
            params={
                "entry_price": "invalid",
                "stop_loss": 48000.0,
                "stop_loss_type": "fixed",
                "portfolio_value": 10000.0,
                "max_risk_percentage": 0.02
            }
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_calculate_optimal_take_profit_invalid_params(self, client):
        """Test optimal take profit calculation with invalid parameters"""
        response = client.post(
            "/api/risk/calculate-optimal-tp",
            params={
                "entry_price": "invalid",
                "stop_loss": 48000.0,
                "stop_loss_type": "fixed",
                "min_risk_reward_ratio": 2.0
            }
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_cors_headers(self, client):
        """Test CORS headers are present"""
        response = client.options("/api/risk/validate")
        # CORS preflight should be handled by middleware
        assert response.status_code in [200, 204]


if __name__ == "__main__":
    pytest.main([__file__])