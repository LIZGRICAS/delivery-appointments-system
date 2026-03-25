from rest_framework import serializers
from django.utils import timezone
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Appointment
        fields = '__all__'

    def validate_scheduled_at(self, value):
        if self.instance is None and value < timezone.now():
            raise serializers.ValidationError("La fecha programada no puede ser en el pasado.")
        return value

    def validate(self, data):
        status = data.get('status', self.instance.status if self.instance else 'Programada')
        delivered_at = data.get('delivered_at', self.instance.delivered_at if self.instance else None)

        if status == 'Entregada' and not delivered_at:
            raise serializers.ValidationError({"delivered_at": "El estado 'Entregada' requiere que delivered_at esté presente."})

        if self.instance:
            old_status = self.instance.status
            if old_status == 'Entregada' and status == 'Programada':
                raise serializers.ValidationError({"status": "La transición de estado 'Entregada' -> 'Programada' no está permitida."})
        
        return data
