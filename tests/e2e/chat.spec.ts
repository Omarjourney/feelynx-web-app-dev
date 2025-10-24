import { test, expect } from './fixtures';
import sodium from 'libsodium-wrappers';

test.describe('Direct message chat', () => {
  test.beforeAll(async () => {
    await sodium.ready;
  });

  test('stubs messaging endpoints for an encrypted chat session', async ({ page }) => {
    const threadId = 'thread-abc';
    const recipientId = 'creator-42';
    const initialMessageText = 'Hey there! Ready for a private session?';

    const encrypt = (text: string) => {
      const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
      const cipher = sodium.crypto_secretbox_easy(
        sodium.from_string(text),
        nonce,
        new Uint8Array(32),
      );
      return {
        cipher_text: sodium.to_base64(cipher),
        nonce: sodium.to_base64(nonce),
      };
    };

    type MessagePayload = {
      id: string;
      sender_id: string;
      recipient_id: string;
      cipher_text: string;
      nonce: string;
      read_at: string | null;
      burn_after_reading: boolean;
      created_at: string;
    };

    let messages: MessagePayload[] = [
      {
        id: 'msg-1',
        sender_id: recipientId,
        recipient_id: 'test-user-id',
        ...encrypt(initialMessageText),
        read_at: null,
        burn_after_reading: false,
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ];

    await page.route('**/dm/threads', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
        return;
      }

      await route.fulfill({
        status: 200,
        headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' },
        body: JSON.stringify({ id: threadId, recipientId }),
      });
    });

    await page.route('**/dm/threads/*/messages', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
        return;
      }

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' },
          body: JSON.stringify(messages),
        });
        return;
      }

      if (method === 'POST') {
        const body = route.request().postDataJSON() as {
          cipher_text: string;
          nonce: string;
          recipientId: string;
          burnAfterReading: boolean;
        };

        const newMessage: MessagePayload = {
          id: `msg-${messages.length + 1}`,
          sender_id: 'test-user-id',
          recipient_id: body.recipientId,
          cipher_text: body.cipher_text,
          nonce: body.nonce,
          read_at: null,
          burn_after_reading: body.burnAfterReading,
          created_at: new Date().toISOString(),
        };

        messages = [...messages, newMessage];

        await route.fulfill({
          status: 201,
          headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' },
          body: JSON.stringify(newMessage),
        });
        return;
      }

      await route.fulfill({ status: 404, headers: { 'access-control-allow-origin': '*' } });
    });

    await page.route('**/dm/messages/*/read', async (route) => {
      const method = route.request().method();
      if (method === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
        return;
      }

      const match = /\/dm\/messages\/([^/]+)\/read/.exec(route.request().url());
      const messageId = match?.[1];
      if (method === 'POST' && messageId) {
        messages = messages.map((message) =>
          message.id === messageId ? { ...message, read_at: new Date().toISOString() } : message,
        );
        await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
        return;
      }

      await route.fulfill({ status: 404, headers: { 'access-control-allow-origin': '*' } });
    });

    await page.goto(`/dm?to=${recipientId}`);

    await expect(page.getByText(initialMessageText)).toBeVisible();

    const markReadButton = page.getByRole('button', { name: 'Mark read' }).first();
    await markReadButton.click();
    await expect(page.locator('text=Read').first()).toBeVisible();

    const outgoing = 'This is a secure reply from Playwright!';
    const messageInput = page.getByPlaceholder('Type a message');
    await messageInput.fill(outgoing);
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(messageInput).toHaveValue('');
    await expect(page.getByText(outgoing)).toBeVisible();
  });
});
