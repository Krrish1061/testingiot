from django.core.management.base import BaseCommand
from django.contrib.auth.models import Permission, Group
from users.models import User


class Command(BaseCommand):
    help = "Creating groups and assigning permissions"

    def handle(self, *args, **options):
        # Create the super_admin group if it doesn't exist
        super_admin_group, created = Group.objects.get_or_create(name="super_admin")

        # Use contentype to assign all the permission of the model
        # Define the codenames of the required permissions
        permission_codenames = [
            "add_user",
            "change_user",
            "view_user",
            "delete_user",
            "add_adminuserextrafield",
            "view_adminuserextrafield",
            "view_group",
            "view_permission",
            "Can view sensor data",
        ]

        # Get the permissions based on codenames
        permissions = Permission.objects.filter(codename__in=permission_codenames)

        # Assign the permissions to the super_admin group
        super_admin_group.permissions.set(permissions)

        # Create the admin group and assign the admin_access permission to it
        admin_group, created = Group.objects.get_or_create(name="admin")
        admin_permissions_codenames = [
            "add_user",
            "change_user",
            "view_sensordata",
        ]

        admin_permissions = Permission.objects.filter(
            codename__in=admin_permissions_codenames
        )

        admin_group.permissions.set(admin_permissions)

        # Create the moderator group and assign the moderator_access permission to it
        moderator_group, created = Group.objects.get_or_create(name="moderator")
        moderator_permissions = [
            Permission.objects.get(codename="view_sensordata"),
        ]
        moderator_group.permissions.set(moderator_permissions)

        # Create the viewer group and assign the viewer_access permission to it
        viewer_group, created = Group.objects.get_or_create(name="viewer")
        viewer_permission = [
            Permission.objects.get(codename="view_sensordata"),
        ]
        viewer_group.permissions.set(viewer_permission)
