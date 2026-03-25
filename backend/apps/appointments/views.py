from django.db import connection
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Appointment
from .serializers import AppointmentSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = {
        'supplier': ['exact'],
        'product_line': ['exact'],
        'status': ['exact'],
        'scheduled_at': ['gte', 'lte', 'date'],
    }

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='report')
    def report(self, request):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        if not date_from or not date_to:
            return Response({"error": "Parámetros date_from y date_to son requeridos."}, status=status.HTTP_400_BAD_REQUEST)

        # Native SQL query as requested
        query = """
            SELECT product_line,
                   COUNT(*) AS total_deliveries,
                   AVG(EXTRACT(EPOCH FROM (delivered_at - scheduled_at)) / 3600) AS avg_hours,
                   AVG(EXTRACT(EPOCH FROM (delivered_at - scheduled_at)) / 60) AS avg_minutes
            FROM appointments_appointment
            WHERE status = 'Entregada'
              AND scheduled_at BETWEEN %s AND %s
            GROUP BY product_line
            ORDER BY product_line;
        """

        with connection.cursor() as cursor:
            cursor.execute(query, [date_from, date_to])
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
            result = [dict(zip(columns, row)) for row in rows]

        return Response(result)
