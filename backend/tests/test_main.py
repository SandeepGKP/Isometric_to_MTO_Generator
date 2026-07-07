import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.mto import MTOResponse
from app.services.ai_pipeline import MOCK_MTO_DATA

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_schema_validation_mock_data():
    # Verify that the mock data structure actually passes the Pydantic validation
    # This proves the fallback mechanism won't crash when serving data
    try:
        response = MTOResponse(**MOCK_MTO_DATA)
        assert response.summary.total_pipe_length_m == 12.45
        assert len(response.items) == 6
    except Exception as e:
        pytest.fail(f"Mock data failed Pydantic validation: {e}")

def test_upload_invalid_file_type():
    # Attempt to upload a text file instead of an image/pdf
    files = {'file': ('test.txt', b'fake content', 'text/plain')}
    response = client.post("/api/upload", files=files)
    assert response.status_code == 400
    assert "Only images or PDF files are allowed" in response.json()["detail"]
