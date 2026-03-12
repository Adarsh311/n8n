import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function earnKaroApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
	const credentials = await this.getCredentials('earnKaroApi');
	const baseUrl = (credentials.apiBaseUrl as string) || 'https://ekaro.in/api/v1';

	const options = {
		method,
		url: `${baseUrl}${endpoint}`,
		qs,
		body,
		json: true,
		headers: {
			Authorization: `Bearer ${credentials.apiKey as string}`,
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
