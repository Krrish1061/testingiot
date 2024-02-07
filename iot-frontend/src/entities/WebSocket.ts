interface SendMessage {
  type: string;
  company_slug?: string | undefined;
  username?: string | undefined;
  group_type: string;
}

export default SendMessage;
