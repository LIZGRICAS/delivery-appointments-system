import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from apps.appointments.models import Appointment


SUPPLIERS = ["A", "B", "C"]
PRODUCT_LINES = ["Camisetas", "Pantalones", "Zapatos", "Accesorios"]
STATUSES = ["Programada", "En proceso", "Entregada", "Cancelada"]


class Command(BaseCommand):
    help = "Seed database with sample users and appointments"

    def handle(self, *args, **kwargs):
        self._create_users()
        self._create_appointments()
        self.stdout.write(self.style.SUCCESS("Seed data created successfully."))

    def _create_users(self):
        users = [
            ("admin", "admin@retailcitas.com", "Admin2024!", True),
            ("operador1", "op1@retailcitas.com", "Operador2024!", False),
            ("operador2", "op2@retailcitas.com", "Operador2024!", False),
        ]
        for username, email, password, is_staff in users:
            if not User.objects.filter(username=username).exists():
                User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    is_staff=is_staff,
                    is_superuser=is_staff,
                )
                self.stdout.write(f"  Created user: {username}")

    def _create_appointments(self):
        users = list(User.objects.all())
        now = timezone.now()

        for i in range(20):
            scheduled = now + timedelta(days=random.randint(-10, 30))
            status = random.choice(STATUSES)
            delivered_at = None

            if status == "Entregada":
                delivered_at = scheduled + timedelta(hours=random.randint(1, 8))

            Appointment.objects.create(
                scheduled_at=scheduled,
                supplier=random.choice(SUPPLIERS),
                product_line=random.choice(PRODUCT_LINES),
                status=status,
                delivered_at=delivered_at,
                observations=f"Observación de prueba #{i + 1}" if random.random() > 0.5 else None,
                created_by=random.choice(users),
            )

        self.stdout.write(f"  Created 20 appointments.")
