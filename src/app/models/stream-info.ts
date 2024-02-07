import { Header } from "./header";

export interface StreamInfo {
    name: string,
    streamingUrl: string;
    licenseUrl: string;
    subtitleUrl: string;
    streamingUrlHeaders: Array<Header>;
    licenseUrlHeaders: Array<Header>;
}
