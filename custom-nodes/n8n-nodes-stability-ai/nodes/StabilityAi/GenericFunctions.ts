import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const STABILITY_API_BASE_URL = 'https://api.stability.ai';

export async function stabilityAiApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	headers: IDataObject = {},
): Promise<IDataObject> {
	const credentials = await this.getCredentials('stabilityAiApi');

	const options = {
		method,
		url: `${STABILITY_API_BASE_URL}${endpoint}`,
		qs,
		body,
		json: true,
		headers: {
			Authorization: `Bearer ${credentials.apiKey as string}`,
			'Content-Type': 'application/json',
			Accept: 'application/json',
			...headers,
		},
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	try {
		return (await this.helpers.request(options)) as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function stabilityAiApiRequestBinary(
	this: IExecuteFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
): Promise<Buffer> {
	const credentials = await this.getCredentials('stabilityAiApi');

	const options = {
		method,
		url: `${STABILITY_API_BASE_URL}${endpoint}`,
		body,
		json: true,
		headers: {
			Authorization: `Bearer ${credentials.apiKey as string}`,
			'Content-Type': 'application/json',
			Accept: 'image/png',
		},
		encoding: null as unknown as string,
	};

	try {
		return (await this.helpers.request(options)) as unknown as Buffer;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
