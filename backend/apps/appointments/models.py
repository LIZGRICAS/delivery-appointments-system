import uuid
from django.db import models
from django.contrib.auth.models import User

class Appointment(models.Model):
    SUPPLIER_CHOICES = [
        ('A', 'Supplier A'),
        ('B', 'Supplier B'),
        ('C', 'Supplier C'),
    ]

    PRODUCT_LINE_CHOICES = [
        ('Camisetas', 'Camisetas'),
        ('Pantalones', 'Pantalones'),
        ('Zapatos', 'Zapatos'),
        ('Accesorios', 'Accesorios'),
    ]

    STATUS_CHOICES = [
        ('Programada', 'Programada'),
        ('En proceso', 'En proceso'),
        ('Entregada', 'Entregada'),
        ('Cancelada', 'Cancelada'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scheduled_at = models.DateTimeField()
    supplier = models.CharField(max_length=1, choices=SUPPLIER_CHOICES)
    product_line = models.CharField(max_length=20, choices=PRODUCT_LINE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Programada')
    delivered_at = models.DateTimeField(null=True, blank=True)
    observations = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_at']
        indexes = [
            models.Index(fields=['scheduled_at']),
            models.Index(fields=['supplier']),
            models.Index(fields=['product_line']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.id} - {self.supplier} - {self.status}"
