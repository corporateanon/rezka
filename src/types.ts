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

export interface Media {
    type: 'folder' | 'stream' | 'streamMap' | 'reference';
}

export interface MediaFolder extends Media {
    type: 'folder';
    title: string;
    children: Media[];
}

export interface MediaReference<T extends Reference> extends Media {
    type: 'reference';
    title: string;
    ref: T;
}

export interface MediaStream extends Media {
    type: 'stream';
    quality: StreamQuality;
    url: string;
}

export interface MediaStreamMap extends Media {
    type: 'streamMap';
    items: StreamMap;
}

export interface Translator {
    id: string;
    title: string;
}

export interface Episode {
    title: string;
    episodeId: string;
    seasonId: string;
}

export interface Reference {
    type: 'ReferenceUrl' | 'ReferenceSeriesFolder' | 'ReferenceEpisode';
}

export interface ReferenceSeriesFolder extends Reference {
    type: 'ReferenceSeriesFolder';
    id: string; //TODO: use a whole Translator object
    translatorId: string;
}

export interface ReferenceEpisode extends Reference {
    type: 'ReferenceEpisode';
    episode: Episode;
}

export interface ReferenceUrl extends Reference {
    type: 'ReferenceUrl';
    url: string;
}
