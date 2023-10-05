from django.core.management.base import BaseCommand
from django.contrib.auth.models import Permission, Group
from django.contrib.contenttypes.models import ContentType
from users.models import AdminUser, ModeratorUser, ViewerUser
from django.apps import apps
from utils.constants import GroupName


class Command(BaseCommand):
    help = "Creating groups and assigning permissions to the Group"

    def handle(self, *args, **options):
        # fetching all models including third-party apps and Django's built-in apps
        all_models = apps.get_models()

        # django App label name of the app defined
        app_label = (
            "users",
            "sensors",
            "iot_devices",
            "sensor_data",
            "company",
            "send_livedata",
        )

        # getting all the model except proxy model defined in app_label
        models_in_apps = [
            model
            for model in all_models
            if model._meta.app_label in app_label and not model._meta.proxy
        ]

        # Get content types for models defined in your app
        content_types = ContentType.objects.filter(
            model__in=[model.__name__.lower() for model in models_in_apps]
        )

        # content type for all the proxy model
        proxy_content_types = []

        proxy_content_types.append(
            ContentType.objects.get_for_model(AdminUser, for_concrete_model=False)
        )
        proxy_content_types.append(
            ContentType.objects.get_for_model(ModeratorUser, for_concrete_model=False)
        )
        proxy_content_types.append(
            ContentType.objects.get_for_model(ViewerUser, for_concrete_model=False)
        )

        # getting Permissions for the model
        permissions_for_models = Permission.objects.filter(
            content_type__in=content_types
        )

        permissions_for_proxy_models = Permission.objects.filter(
            content_type__in=proxy_content_types
        )

        # Create the super_admin group if it doesn't exist
        super_admin_group, _ = Group.objects.get_or_create(
            name=GroupName.SUPERADMIN_GROUP
        )

        # Assign the permissions to the super_admin group
        all_permissions = permissions_for_models | permissions_for_proxy_models
        super_admin_group.permissions.set(all_permissions)

        # Create the admin group and assign the admin_access permission to it
        admin_group, _ = Group.objects.get_or_create(name=GroupName.ADMIN_GROUP)
        admin_permissions_codenames = [
            "add_user",
            "change_user",
            "view_user",
            "delete_user",
            "view_useradditionalfield",
            "view_companysensordata",
            "view_adminusersensordata",
        ]

        admin_permissions = Permission.objects.filter(
            codename__in=admin_permissions_codenames
        )

        admin_group.permissions.set(admin_permissions)

        # Create the moderator group and assign the moderator_access permission to it
        moderator_group, _ = Group.objects.get_or_create(name=GroupName.MODERATOR_GROUP)
        moderator_permissions_codenames = [
            "view_companysensordata",
            "view_adminusersensordata",
        ]
        moderator_permissions = Permission.objects.filter(
            codename__in=moderator_permissions_codenames
        )

        moderator_group.permissions.set(moderator_permissions)

        # Create the viewer group and assign the viewer_access permission to it
        viewer_group, _ = Group.objects.get_or_create(name=GroupName.VIEWER_GROUP)
        viewer_permissions_codenames = [
            "view_companysensordata",
            "view_adminusersensordata",
        ]
        viewer_permission = Permission.objects.filter(
            codename__in=viewer_permissions_codenames
        )
        viewer_group.permissions.set(viewer_permission)

        # Creating company super admin group and no permission are given
        Group.objects.create(name=GroupName.COMPANY_SUPERADMIN_GROUP)
