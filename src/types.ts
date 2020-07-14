//---------------------------------------------------------
// Domain models
//---------------------------------------------------------

export interface SearchResult {
    title: string;
    subtitle?: string;
    url: string;
}

export enum StreamQuality {
    _240p = '240p',
    _360p = '360p',
    _480p = '480p',
    _720p = '720p',
    _1080p = '1080p',
    _2160p = '2160p',
}

export type StreamMap = {
    [quality in StreamQuality]: MediaStream;
};

export interface Translator {
    id: string;
    title: string;
}

export interface Episode {
    title: string;
    id: string;
    translatorId?: string;
    seasonId: string;
    episodeId: string;
}

//---------------------------------------------------------
// Media: objects that can be displayed to user in a UI
//---------------------------------------------------------

export interface MediaFolder {
    type: 'MediaFolder';
    title: string;
    children: Media[];
}

export interface MediaReference {
    type: 'MediaReference';
    title: string;
    ref: Reference;
}

export interface MediaStream {
    type: 'MediaStream';
    quality: StreamQuality;
    url: string;
}

export interface MediaStreamMap {
    type: 'MediaStreamMap';
    items: StreamMap;
}

export type Media = MediaFolder | MediaReference | MediaStreamMap | MediaStream;

//---------------------------------------------------------
// References: items that are used for information retrieval
//---------------------------------------------------------

export interface ReferenceTranslator {
    type: 'ReferenceTranslator';
    id: string; //TODO: use a whole Translator object
    translatorId: string;
}

export interface ReferenceEpisode {
    type: 'ReferenceEpisode';
    episode: Episode;
}

export interface ReferenceUrl {
    type: 'ReferenceUrl';
    url: string;
}

export interface ReferenceSearchResult {
    type: 'ReferenceSearchResult';
    searchResult: SearchResult;
}

export type Reference =
    | ReferenceTranslator
    | ReferenceEpisode
    | ReferenceUrl
    | ReferenceSearchResult;
