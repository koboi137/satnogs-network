import os
from base import *

ENVIRONMENT = 'production'

# Disable registration
ACCOUNT_ADAPTER = 'network.users.adapter.NoSignupsAdapter'

# Security
SECURE_HSTS_SECONDS = 60
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*')

# Mail
EMAIL_HOST = 'localhost'
EMAIL_PORT = 25
EMAIL_TIMEOUT = 300
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@example.com')
SERVER_EMAIL = DEFAULT_FROM_EMAIL

# Analytics
GOOGLE_ANALYTICS_KEY = os.getenv('GOOGLE_ANALYTICS_KEY', None)
