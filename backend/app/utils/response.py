from typing import Any

from fastapi.responses import JSONResponse


def success_response(
    message: str,
    data: Any = None,
    status_code: int = 200,
) -> JSONResponse:
    """Standard success response wrapper."""
    content: dict[str, Any] = {"success": True, "message": message}
    if data is not None:
        content["data"] = data
    return JSONResponse(content=content, status_code=status_code)


def error_response(message: str, status_code: int = 400) -> JSONResponse:
    """Standard error response wrapper."""
    return JSONResponse(
        content={"success": False, "message": message},
        status_code=status_code,
    )
