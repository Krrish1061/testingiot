from channels.exceptions import DenyConnection


class AuthenticationFailed(DenyConnection):
    pass
