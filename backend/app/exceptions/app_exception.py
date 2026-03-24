from typing import Optional


class AppException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 400,
        original_exception: Optional[Exception] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.original_exception = original_exception
        super().__init__(message)
