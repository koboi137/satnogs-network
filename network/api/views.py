from django.utils.timezone import now
from django.shortcuts import get_object_or_404
from django.http import Http404

from rest_framework import viewsets, mixins
from rest_framework.response import Response

from network.api.perms import StationOwnerCanEditPermission
from network.api import serializers, filters
from network.base.models import Data, Station


class DataView(viewsets.ModelViewSet, mixins.UpdateModelMixin):
    queryset = Data.objects.all()
    serializer_class = serializers.DataSerializer
    filter_class = filters.DataViewFilter
    permission_classes = [
        StationOwnerCanEditPermission
    ]


class JobView(viewsets.ReadOnlyModelViewSet):
    queryset = Data.objects.filter(payload='')
    serializer_class = serializers.JobSerializer
    filter_class = filters.DataViewFilter
    filter_fields = ('ground_station')

    def get_queryset(self):
        queryset = self.queryset.filter(start__gte=now())
        gs_id = self.request.query_params.get('ground_station', None)
        if gs_id and self.request.user.is_authenticated():
            gs = get_object_or_404(Station, id=gs_id)
            if gs.owner == self.request.user:
                gs.last_seen = now()
                gs.save()
        return queryset


class SettingsView(viewsets.ReadOnlyModelViewSet):
    queryset = Station.objects.all()
    lookup_field = 'uuid'

    def list(self, request):
        raise Http404()

    def retrieve(self, request, queryset=queryset, uuid=None):
        station = get_object_or_404(queryset, uuid=uuid)
        serializer = serializers.SettingsSerializer(station)
        return Response(serializer.data)
