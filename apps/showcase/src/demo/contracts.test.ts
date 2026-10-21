import { describe, it, expect, vi } from 'vitest';
import { createTowelBooksClient, ApiRequestError } from '@towelbooks/sdk';
import { demoFetch } from './transport';
import { uuid } from './fixtures';
const client = createTowelBooksClient({
  baseUrl: 'https://demo.invalid/v1',
  fetchImpl: demoFetch,
});
describe('original frontend demo transport', () => {
  it('serves original SDK read contracts used by the preserved screens', async () => {
    const network = vi.spyOn(globalThis, 'fetch');
    expect((await client.users.me.get()).username).toBe('marina_demo');
    expect((await client.collections.list()).items).toHaveLength(3);
    expect((await client.collections.get(uuid(500))).owner.username).toBe(
      'marina_demo',
    );
    expect(
      (await client.collections.listPublicItems(uuid(500))).items,
    ).toHaveLength(2);
    expect((await client.collections.listItems(uuid(500))).items).toHaveLength(
      2,
    );
    expect((await client.catalog.search()).items).toHaveLength(6);
    expect((await client.catalog.get(uuid(100))).display.title).toContain(
      'Atlas',
    );
    expect((await client.libraries.getMyLibrary()).isDefault).toBe(true);
    expect((await client.libraries.listItems(uuid(2))).items).toHaveLength(4);
    expect((await client.libraries.getItemFacets(uuid(2))).total).toBe(4);
    expect(
      (await client.libraries.getItem(uuid(2), uuid(300))).work.catalogEditions,
    ).toHaveLength(1);
    expect(
      await client.libraries.listItemReadingSessions(uuid(2), uuid(300)),
    ).toHaveLength(1);
    expect((await client.rooms.list()).items).toHaveLength(3);
    expect((await client.rooms.listMembers(uuid(600))).items[0]?.userId).toBe(
      uuid(1),
    );
    expect((await client.rooms.getRoleCapabilities(uuid(600))).role).toBe(
      'moderator',
    );
    expect((await client.readings.get(uuid(600), uuid(700))).id).toBe(
      uuid(700),
    );
    expect(
      (await client.users.listProfileBooksRead('marina_demo')).items,
    ).toHaveLength(1);
    expect((await client.rooms.discover()).items).toHaveLength(3);
    expect((await client.rooms.getOverview(uuid(600))).viewer.role).toBe(
      'owner',
    );
    expect((await client.readings.listForRoom(uuid(600))).items).toHaveLength(
      1,
    );
    expect(
      (await client.community.getSettings(uuid(600))).viewerCanModerate,
    ).toBe(true);
    expect((await client.discussions.listDiscussions(uuid(600))).items).toEqual(
      [],
    );
    expect((await client.polls.listPolls(uuid(600))).items).toEqual([]);
    expect((await client.users.me.getHome()).forYou).toHaveLength(3);
    expect((await client.activityEvents.listForViewer()).items).toEqual([]);
    expect((await client.users.getProfile('marina_demo')).viewer?.isSelf).toBe(
      true,
    );
    expect((await client.notifications.list()).items).toEqual([]);
    expect((await client.notifications.unreadCount()).count).toBe(0);
    expect((await client.privacy.getPreferences()).productAnalyticsOptIn).toBe(
      false,
    );
    expect(network).not.toHaveBeenCalled();
    network.mockRestore();
  });
  it('keeps collection create/edit/item/delete operations connected locally', async () => {
    const collection = await client.collections.create({
      name: 'A local shelf',
    });
    const renamed = await client.collections.update(collection.id, {
      name: 'A renamed shelf',
    });
    expect(renamed.name).toBe('A renamed shelf');
    const item = await client.collections.addItem(collection.id, {
      catalogWorkId: uuid(100),
    });
    expect((await client.collections.get(collection.id)).itemCount).toBe(1);
    await client.collections.removeItem(collection.id, item.id);
    expect((await client.collections.get(collection.id)).itemCount).toBe(0);
    await client.collections.remove(collection.id);
    expect(
      (await client.collections.list()).items.some(
        (value) => value.id === collection.id,
      ),
    ).toBe(false);
  });
  it('updates reading detail, library summaries, and continue-reading from the same session', async () => {
    const original = await client.libraries.getItemReadingSession(
      uuid(2),
      uuid(300),
      uuid(400),
    );
    const updated = await client.libraries.updateItemReadingSession(
      uuid(2),
      uuid(300),
      uuid(400),
      { version: original.version, currentPage: 120 },
    );
    expect(updated.currentPage).toBe(120);
    expect(updated.version).toBe(original.version + 1);
    expect(
      (await client.libraries.getItem(uuid(2), uuid(300))).readingSummary
        .mostRecentlyUpdatedSession?.currentPage,
    ).toBe(120);
    expect(
      (await client.users.me.getContinueReading()).items[0]?.progress
        ?.currentPage,
    ).toBe(120);
    await expect(
      client.libraries.updateItemReadingSession(uuid(2), uuid(300), uuid(400), {
        version: original.version,
        currentPage: 50,
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
  it('keeps session notes local and validates them with original contracts', async () => {
    const note = await client.libraries.createItemReadingNote(
      uuid(2),
      uuid(300),
      uuid(400),
      { content: 'A fictional note' },
    );
    expect(
      (
        await client.libraries.listItemReadingNotes(
          uuid(2),
          uuid(300),
          uuid(400),
        )
      ).items[0]?.content,
    ).toBe('A fictional note');
    await client.libraries.removeItemReadingNote(
      uuid(2),
      uuid(300),
      uuid(400),
      note.id,
    );
    expect(
      (
        await client.libraries.listItemReadingNotes(
          uuid(2),
          uuid(300),
          uuid(400),
        )
      ).items,
    ).toEqual([]);
  });
  it('does not execute account deletion or delegate uploads to a real network', async () => {
    await expect(
      client.users.me.delete({ password: 'fictional-demo-value' }),
    ).rejects.toBeInstanceOf(ApiRequestError);
    expect((await client.users.me.get()).username).toBe('marina_demo');
    await expect(
      demoFetch('https://example.invalid/upload', { method: 'PUT' }),
    ).rejects.toThrow('External requests');
  });
});
