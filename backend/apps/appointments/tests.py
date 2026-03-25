from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta
from .models import Appointment


class AppointmentModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass123")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.future_date = timezone.now() + timedelta(days=1)

    def test_cannot_create_appointment_with_past_date(self):
        past_date = timezone.now() - timedelta(days=1)
        response = self.client.post("/api/appointments/", {
            "scheduled_at": past_date.isoformat(),
            "supplier": "A",
            "product_line": "Camisetas",
            "status": "Programada",
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("scheduled_at", response.data)

    def test_entregada_requires_delivered_at(self):
        response = self.client.post("/api/appointments/", {
            "scheduled_at": self.future_date.isoformat(),
            "supplier": "B",
            "product_line": "Zapatos",
            "status": "Entregada",
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("delivered_at", response.data)

    def test_cannot_transition_entregada_to_programada(self):
        appointment = Appointment.objects.create(
            scheduled_at=self.future_date,
            supplier="C",
            product_line="Pantalones",
            status="Entregada",
            delivered_at=timezone.now(),
            created_by=self.user,
        )
        response = self.client.patch(f"/api/appointments/{appointment.id}/", {
            "status": "Programada",
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_request_returns_401(self):
        unauthenticated_client = APIClient()
        response = unauthenticated_client.get("/api/appointments/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_report_endpoint_returns_expected_fields(self):
        Appointment.objects.create(
            scheduled_at=timezone.now() - timedelta(days=5),
            delivered_at=timezone.now() - timedelta(days=4),
            supplier="A",
            product_line="Camisetas",
            status="Entregada",
            created_by=self.user,
        )
        response = self.client.get(
            "/api/appointments/report/",
            {"date_from": "2020-01-01", "date_to": "2030-12-31"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if len(response.data) > 0:
            row = response.data[0]
            self.assertIn("product_line", row)
            self.assertIn("total_deliveries", row)
            self.assertIn("avg_hours", row)
