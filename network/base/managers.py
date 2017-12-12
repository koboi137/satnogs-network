from django.db import models
from django.utils.timezone import now


class ObservarionQuerySet(models.QuerySet):
    def is_future(self):
        return self.filter(end__gte=now())
