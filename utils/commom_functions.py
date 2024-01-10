def get_groups_tuple(user):
    return tuple(group.name for group in user.groups.all())
