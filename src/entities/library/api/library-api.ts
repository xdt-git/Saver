import { apiClient, createQueryKeys } from "@/shared/api";
import type { LibraryStatus } from "@/shared/config/content";

export const libraryKeys = createQueryKeys("library");

/** What C8 needs of a library entry; the full entry (with content) comes with C9. */
export interface LibraryEntryRef {
    id: number;
    status: LibraryStatus;
}

export const libraryApi = {
    add: (contentId: number, status: LibraryStatus) =>
        apiClient.post<LibraryEntryRef>("/library", { contentId, status }),
    setStatus: (entryId: number, status: LibraryStatus) =>
        apiClient.patch<LibraryEntryRef>(`/library/${entryId}`, { status }),
};
