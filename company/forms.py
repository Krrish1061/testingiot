from django import forms
from .models import Company
from django.db import connection


class CompanyCreationForm(forms.ModelForm):
    class Meta:
        model = Company
        fields = "__all__"

    def save(self, commit=True):
        print("outside create partition")
        # company = super().save(commit=False)
        create_partition = self.cleaned_data.get("create_partition")
        company = create_partition
        print(create_partition)
        if create_partition:
            print("inside create partition")
            with connection.cursor() as cursor:
                cursor.execute(
                    f"ALTER TABLE sensor_data_sensordata REORGANIZE PARTITION p_max INTO (PARTITION p_{company.pk}-{company.slug} VALUES IN ({company.pk}), PARTITION p_max VALUES IN (10000));"
                )
                cursor.execute(
                    f"ALTER TABLE sensor_data_sensordata REBUILD PARTITION p_{company.pk}-{company.slug};"
                )
        # company.save()

        return company


class CompanyChangeForm(forms.ModelForm):
    class Meta:
        model = Company
        fields = "__all__"
