//---------------------------------------------------------
// Domain models
//---------------------------------------------------------

export interface SearchResult {
    title: string;
    subtitle?: string;
    url: string;
    id: string;
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
    translatorId: string;
    title: string;
    isCamrip?: string;
    isAds?: string;
    isDirector?: string;
}

export interface Episode {
    title: string;
    id: string;
    translatorId?: string;
    seasonId: string;
    episodeId: string;
}

export enum MediaFolderKind {
    TranslationsList = 'TranslationsList',
    EpisodesList = 'EpisodesList',
    SearchResultsList = 'SearchResultsList',
}

//---------------------------------------------------------
// Media: objects that can be displayed to user in a UI
//---------------------------------------------------------

export interface MediaFolder {
    type: 'MediaFolder';
    title: string;
    children: Media[];
    kind: MediaFolderKind;
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

export type ReferenceTranslator = {
    type: 'ReferenceTranslator';
    id: string;
} & Translator;

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
