import { MediaFolder, Reference, Media } from './types';

export interface HdrezkaClient {
    getSearchResults(query: string): Promise<MediaFolder>;
    getMediaByReference(reference: Reference): Promise<Media | null>;
}
