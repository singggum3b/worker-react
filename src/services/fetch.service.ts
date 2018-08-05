import { Service } from "typedi";

@Service()
export class FetchService {

    public apiToken?: string;

    public setAPIToken(token: string): string {
        this.apiToken = token;
        return token;
    }

    public async fetch(input?: Request | string, init?: RequestInit): Promise<Response> {
        return fetch(input, init);
    }

}