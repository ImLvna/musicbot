interface iOptions {
	title: string;
	artist: string;
	apiKey: string; // Genius developer access token
	optimizeQuery?: boolean; // (optional, default: false) If true, Perform some cleanup to maximize the chance of finding a match
	authHeader?: boolean; // (optional, default: false) Whether to include auth header in the search request
}
interface iSong {
	id: number; // Genius song id
	title: string; // Song title
	url: string; // Genius webpage URL for the song
	lyrics: string; // Song lyrics
	albumArt: string; // URL of the album art image (jpg/png)
}
interface searchResult {
	id: number; // Genius song id
	url: string; // Genius webpage URL for the song
	title: string; // Song title
	albumArt: string; // URL of the album art image (jpg/png)
}


declare module "genius-lyrics-api" {
    export function getLyrics(options: iOptions): Promise<string|null>;
    export function getAlbumArt(options: iOptions): Promise<string|null>;
    export function getSong(options: iOptions): Promise<iSong|null>;
    export function searchSong(options: iOptions): Promise<searchResult[]|null>;
    export function getSongById(id: number|string, access_token: string): Promise<song>;
}