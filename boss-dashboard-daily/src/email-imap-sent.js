const { ImapFlow } = require("imapflow");

/**
 * Upload a copy of the message to IMAP Sent (e.g. Gmail "[Gmail]/Sent Mail").
 * Requires IMAP enabled on the mailbox (Gmail: Settings → Forwarding and POP/IMAP).
 */
async function appendToImapMailbox({ host, user, pass, mailboxPath, rawMime }) {
  const client = new ImapFlow({
    host,
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
  });
  try {
    await client.connect();
    await client.append(mailboxPath, rawMime, ["\\Seen"]);
  } finally {
    try {
      await client.logout();
    } catch {
      /* ignore */
    }
  }
}

module.exports = { appendToImapMailbox };
