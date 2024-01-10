from utils.commom_functions import get_groups_tuple
from utils.constants import GroupName


def is_slugId_ofSameInstance(company_slug, user, user_groups):
    if (
        user.company
        and company_slug == user.company.slug
        or GroupName.SUPERADMIN_GROUP in user_groups
    ):
        return True
    return False
