import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.core.exceptions import ValidationError

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides detailed error responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Log the error
        logger.error(f"API Error: {exc} in view {context.get('view', 'Unknown')}")
        
        custom_response_data = {
            'error': True,
            'message': 'An error occurred',
            'details': response.data
        }
        
        if isinstance(exc, Http404):
            custom_response_data['message'] = 'Resource not found'
        elif isinstance(exc, ValidationError):
            custom_response_data['message'] = 'Validation error'
        elif hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                custom_response_data['message'] = 'Validation failed'
            else:
                custom_response_data['message'] = str(exc.detail)
        
        response.data = custom_response_data

    return response

class ErrorLoggingMixin:
    """
    Mixin to add error logging to views
    """
    def handle_exception(self, exc):
        logger.error(f"Exception in {self.__class__.__name__}: {exc}", exc_info=True)
        return super().handle_exception(exc)
