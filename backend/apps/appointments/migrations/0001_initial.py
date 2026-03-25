import uuid
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Appointment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('scheduled_at', models.DateTimeField()),
                ('supplier', models.CharField(choices=[('A', 'Supplier A'), ('B', 'Supplier B'), ('C', 'Supplier C')], max_length=1)),
                ('product_line', models.CharField(choices=[('Camisetas', 'Camisetas'), ('Pantalones', 'Pantalones'), ('Zapatos', 'Zapatos'), ('Accesorios', 'Accesorios')], max_length=20)),
                ('status', models.CharField(choices=[('Programada', 'Programada'), ('En proceso', 'En proceso'), ('Entregada', 'Entregada'), ('Cancelada', 'Cancelada')], default='Programada', max_length=20)),
                ('delivered_at', models.DateTimeField(blank=True, null=True)),
                ('observations', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointments', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-scheduled_at'],
            },
        ),
        migrations.AddIndex(
            model_name='appointment',
            index=models.Index(fields=['scheduled_at'], name='appointments_scheduled_idx'),
        ),
        migrations.AddIndex(
            model_name='appointment',
            index=models.Index(fields=['supplier'], name='appointments_supplier_idx'),
        ),
        migrations.AddIndex(
            model_name='appointment',
            index=models.Index(fields=['product_line'], name='appointments_product_line_idx'),
        ),
        migrations.AddIndex(
            model_name='appointment',
            index=models.Index(fields=['status'], name='appointments_status_idx'),
        ),
    ]
