from django.core.management.base import BaseCommand
from django.db import connection


#  save point error with executing raw sql at the signals
class Command(BaseCommand):
    help = "Partition the sensor_data_sensordata table"

    def add_arguments(self, parser):
        parser.add_argument("company_name", type=str)
        parser.add_argument("partition_id", type=int)

    def handle(self, company_name, partition_id, *args, **options):
        print(company_name)
        with connection.cursor() as cursor:
            cursor.execute(
                f"ALTER TABLE sensor_data_sensordata REORGANIZE PARTITION p_max INTO (PARTITION p_{company_name} VALUES IN ({partition_id}), PARTITION p_max VALUES IN (10000));"
            )
