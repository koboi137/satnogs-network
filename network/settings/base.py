from os import path, getenv
import dj_database_url

BASE_DIR = path.dirname(path.dirname(__file__))

# Apps
DJANGO_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
)
THIRD_PARTY_APPS = (
    'avatar',
    'rest_framework',
    'rest_framework.authtoken',
    'django_filters',
    'crispy_forms',
    'allauth',
    'allauth.account',
    'compressor',
    'csp',
)
LOCAL_APPS = (
    'network.users',
    'network.base',
    'network.api',
)

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# Middlware
MIDDLEWARE = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'csp.middleware.CSPMiddleware',
)

# Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
ADMINS = (
    (
        getenv('ADMINS_FROM_NAME', 'Admins'),
        getenv('ADMINS_FROM_EMAIL', 'noreply@example.com')
    ),
)
MANAGERS = ADMINS

# Cache
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake'
    }
}
CACHE_TTL = int(getenv('CACHE_TTL', 300))

# Internationalization
TIME_ZONE = 'UTC'
LANGUAGE_CODE = 'en-us'
SITE_ID = 1
USE_I18N = False
USE_L10N = False
USE_TZ = True

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [path.join(BASE_DIR, 'templates')],
        'OPTIONS': {
            'debug': False,
            'context_processors': [
                'django.contrib.auth.context_processors.auth',
                'django.template.context_processors.debug',
                'django.template.context_processors.i18n',
                'django.template.context_processors.media',
                'django.template.context_processors.static',
                'django.template.context_processors.tz',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.request',
                'network.base.context_processors.analytics',
                'network.base.context_processors.stage_notice',
            ],
            'loaders': [
                'django.template.loaders.filesystem.Loader',
                'django.template.loaders.app_directories.Loader',
            ],
        },

    },
]

# Static & Media
STATIC_ROOT = path.join(path.dirname(BASE_DIR), 'staticfiles')
STATIC_URL = '/static/'
STATICFILES_DIRS = (
    path.join(BASE_DIR, 'static'),
)
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
)
MEDIA_ROOT = path.join(path.dirname(BASE_DIR), 'media')
MEDIA_URL = '/media/'
CRISPY_TEMPLATE_PACK = 'bootstrap3'
STATION_DEFAULT_IMAGE = '/static/img/dish.png'
SATELLITE_DEFAULT_IMAGE = 'https://db.satnogs.org/static/img/sat.png'

# App conf
ROOT_URLCONF = 'network.urls'
WSGI_APPLICATION = 'network.wsgi.application'
TEST_RUNNER = 'django.test.runner.DiscoverRunner'

# Auth
AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)
ACCOUNT_ADAPTER = 'allauth.account.adapter.DefaultAccountAdapter'
ACCOUNT_AUTHENTICATION_METHOD = 'username'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
AUTH_USER_MODEL = 'users.User'
LOGIN_REDIRECT_URL = 'users:redirect_user'
LOGIN_URL = 'account_login'
AUTOSLUG_SLUGIFY_FUNCTION = 'slugify.slugify'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s - %(process)d %(thread)d - %(message)s'
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'opbeat': {
            'level': 'WARNING',
            'filters': ['require_debug_false'],
            'class': 'opbeat.contrib.django.handlers.OpbeatHandler',
        },
    },
    'loggers': {
        'django.request': {
            'handlers': ['opbeat'],
            'level': 'ERROR',
            'propagate': True,
        },
        'django.network.backends': {
            'level': 'ERROR',
            'handlers': ['opbeat'],
            'propagate': False,
        },
        'network': {
            'level': 'WARNING',
            'handlers': ['opbeat'],
            'propagate': False,
        },
        'opbeat.errors': {
            'level': 'ERROR',
            'handlers': ['console'],
            'propagate': False,
        },
    }
}

# API
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'rest_framework.filters.DjangoFilterBackend',
    ),
    'DEFAULT_PAGINATION_CLASS': 'network.api.pagination.LinkedHeaderPageNumberPagination',
    'PAGE_SIZE': 25
}

# Security
SECRET_KEY = getenv('SECRET_KEY', 'changeme')
CSP_DEFAULT_SRC = (
    "'self'",
    'https://*.mapbox.com',
)
CSP_SCRIPT_SRC = (
    "'self'",
    'https://*.google-analytics.com',
)
CSP_IMG_SRC = (
    "'self'",
    'https://*.gravatar.com',
    'https://*.mapbox.com',
    'https://*.satnogs.org',
    'https://*.google-analytics.com',
)
CSP_STYLE_SRC = (
    "'self'",
    "'unsafe-inline'",
)


# Database
DATABASE_URL = getenv('DATABASE_URL', 'sqlite:///db.sqlite3')
DATABASES = {'default': dj_database_url.parse(DATABASE_URL)}

# Mapbox API
MAPBOX_GEOCODE_URL = 'https://api.tiles.mapbox.com/v4/geocode/mapbox.places/'
MAPBOX_MAP_ID = getenv('MAPBOX_MAP_ID', '')
MAPBOX_TOKEN = getenv('MAPBOX_TOKEN', '')

# Observations settings
# Datetimes in minutes for scheduling OPTIONS
# Deletion range in minutes
DATE_MIN_START = '15'
DATE_MIN_END = '75'
DATE_MAX_RANGE = '480'
OBSERVATION_MAX_DELETION_RANGE = getenv('OBSERVATION_MAX_DELETION_RANGE', 10)
OBSERVATION_MIN_DELETION_RANGE = getenv('OBSERVATION_MIN_DELETION_RANGE', 60)

# Station settings
# Heartbeat for keeping a station online in minutes
# Maximum window for upcoming passes in hours
STATION_HEARTBEAT_TIME = getenv('STATION_HEARTBEAT_TIME', 60)
STATION_UPCOMING_END = getenv('STATION_UPCOMING_END', 12)

# DB API
DB_API_ENDPOINT = getenv('DB_API_ENDPOINT', 'https://db.satnogs.org/api/')

# ListView pagination
ITEMS_PER_PAGE = 25

# User settings
AVATAR_GRAVATAR_DEFAULT = getenv('AVATAR_GRAVATAR_DEFAULT', 'mm')
