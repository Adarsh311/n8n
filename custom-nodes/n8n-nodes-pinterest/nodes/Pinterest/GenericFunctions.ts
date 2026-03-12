import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const PINTEREST_API_BASE_URL = 'https://api.pinterest.com/v5';

export async function pinterestApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
	const options = {
		method,
		url: `${PINTEREST_API_BASE_URL}${endpoint}`,
		qs,
		body,
		json: true,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	try {
		return (await this.helpers.requestOAuth2.call(
			this,
			'pinterestOAuth2Api',
			options,
		)) as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function pinterestApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let responseData: IDataObject;
	let bookmark: string | undefined;

	do {
		if (bookmark) {
			qs.bookmark = bookmark;
		}

		responseData = await pinterestApiRequest.call(this, method, endpoint, body, qs);

		const items = responseData.items as IDataObject[] | undefined;
		if (items) {
			returnData.push(...items);
		}

		bookmark = responseData.bookmark as string | undefined;
	} while (bookmark);

	return returnData;
}
