import type {
	IExecuteFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import {
	pinterestApiRequest,
	pinterestApiRequestAllItems,
} from './GenericFunctions';

export class Pinterest implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pinterest',
		name: 'pinterest',
		icon: 'file:pinterest.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Publish pins and manage boards on Pinterest',
		defaults: {
			name: 'Pinterest',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'pinterestOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Board',
						value: 'board',
					},
					{
						name: 'Pin',
						value: 'pin',
					},
				],
				default: 'pin',
			},

			// ----------------------------------
			//         Board Operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['board'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new board',
						action: 'Create a board',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a board',
						action: 'Delete a board',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a board',
						action: 'Get a board',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many boards',
						action: 'Get many boards',
					},
				],
				default: 'create',
			},

			// ----------------------------------
			//         Pin Operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['pin'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new pin',
						action: 'Create a pin',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a pin',
						action: 'Delete a pin',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a pin',
						action: 'Get a pin',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many pins from a board',
						action: 'Get many pins',
					},
				],
				default: 'create',
			},

			// ----------------------------------
			//         Board: Create
			// ----------------------------------
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['board'],
						operation: ['create'],
					},
				},
				description: 'The name of the board to create',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['board'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Description of the board',
					},
					{
						displayName: 'Privacy',
						name: 'privacy',
						type: 'options',
						options: [
							{
								name: 'Public',
								value: 'PUBLIC',
							},
							{
								name: 'Protected',
								value: 'PROTECTED',
							},
							{
								name: 'Secret',
								value: 'SECRET',
							},
						],
						default: 'PUBLIC',
						description: 'Privacy setting of the board',
					},
				],
			},

			// ----------------------------------
			//         Board: Get / Delete
			// ----------------------------------
			{
				displayName: 'Board ID',
				name: 'boardId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['board'],
						operation: ['get', 'delete'],
					},
				},
				description: 'The ID of the board',
			},

			// ----------------------------------
			//         Board: Get All
			// ----------------------------------
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['board'],
						operation: ['getAll'],
					},
				},
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 25,
				typeOptions: {
					minValue: 1,
					maxValue: 250,
				},
				displayOptions: {
					show: {
						resource: ['board'],
						operation: ['getAll'],
						returnAll: [false],
					},
				},
				description: 'Max number of results to return',
			},

			// ----------------------------------
			//         Pin: Create
			// ----------------------------------
			{
				displayName: 'Board Name or ID',
				name: 'boardId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getBoards',
				},
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['create'],
					},
				},
				description: 'The board to create the pin on. Choose from the list, or specify an ID.',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['create'],
					},
				},
				description: 'The title of the pin (max 100 characters)',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['create'],
					},
				},
				description: 'The description of the pin (max 500 characters)',
			},
			{
				displayName: 'Image Source',
				name: 'imageSource',
				type: 'options',
				options: [
					{
						name: 'URL',
						value: 'url',
					},
					{
						name: 'Binary Data',
						value: 'binaryData',
					},
				],
				default: 'url',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['create'],
					},
				},
				description: 'How to provide the pin image',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['create'],
						imageSource: ['url'],
					},
				},
				description: 'URL of the image to use for the pin',
			},
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				required: true,
				default: 'data',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['create'],
						imageSource: ['binaryData'],
					},
				},
				description: 'Name of the binary property containing the image data',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'Destination Link',
						name: 'link',
						type: 'string',
						default: '',
						description: 'The destination URL for the pin (affiliate link)',
					},
					{
						displayName: 'Alt Text',
						name: 'altText',
						type: 'string',
						default: '',
						description: 'Alt text for the pin image (max 500 characters)',
					},
					{
						displayName: 'Dominant Color',
						name: 'dominantColor',
						type: 'string',
						default: '',
						description: 'Hex color code for the dominant color of the pin',
					},
				],
			},

			// ----------------------------------
			//         Pin: Get / Delete
			// ----------------------------------
			{
				displayName: 'Pin ID',
				name: 'pinId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['get', 'delete'],
					},
				},
				description: 'The ID of the pin',
			},

			// ----------------------------------
			//         Pin: Get All
			// ----------------------------------
			{
				displayName: 'Board Name or ID',
				name: 'boardId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getBoards',
				},
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['getAll'],
					},
				},
				description: 'The board to get pins from. Choose from the list, or specify an ID.',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['getAll'],
					},
				},
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 25,
				typeOptions: {
					minValue: 1,
					maxValue: 250,
				},
				displayOptions: {
					show: {
						resource: ['pin'],
						operation: ['getAll'],
						returnAll: [false],
					},
				},
				description: 'Max number of results to return',
			},
		],
	};

	methods = {
		loadOptions: {
			async getBoards(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const boards = await pinterestApiRequestAllItems.call(
					this,
					'GET',
					'/boards',
				);

				for (const board of boards) {
					returnData.push({
						name: board.name as string,
						value: board.id as string,
					});
				}

				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				if (resource === 'board') {
					// ----------------------------------
					//         Board Operations
					// ----------------------------------
					if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = { name };

						if (additionalFields.description) {
							body.description = additionalFields.description;
						}
						if (additionalFields.privacy) {
							body.privacy = additionalFields.privacy;
						}

						responseData = await pinterestApiRequest.call(
							this,
							'POST',
							'/boards',
							body,
						);
					} else if (operation === 'get') {
						const boardId = this.getNodeParameter('boardId', i) as string;

						responseData = await pinterestApiRequest.call(
							this,
							'GET',
							`/boards/${boardId}`,
						);
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						if (returnAll) {
							responseData = await pinterestApiRequestAllItems.call(
								this,
								'GET',
								'/boards',
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const qs: IDataObject = { page_size: limit };
							const response = await pinterestApiRequest.call(
								this,
								'GET',
								'/boards',
								{},
								qs,
							);
							responseData = (response.items as IDataObject[]) || [];
						}
					} else if (operation === 'delete') {
						const boardId = this.getNodeParameter('boardId', i) as string;

						responseData = await pinterestApiRequest.call(
							this,
							'DELETE',
							`/boards/${boardId}`,
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported for boards`,
							{ itemIndex: i },
						);
					}
				} else if (resource === 'pin') {
					// ----------------------------------
					//         Pin Operations
					// ----------------------------------
					if (operation === 'create') {
						const boardId = this.getNodeParameter('boardId', i) as string;
						const title = this.getNodeParameter('title', i) as string;
						const description = this.getNodeParameter('description', i) as string;
						const imageSource = this.getNodeParameter('imageSource', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = {
							board_id: boardId,
						};

						if (title) {
							body.title = title;
						}
						if (description) {
							body.description = description;
						}

						if (imageSource === 'url') {
							const imageUrl = this.getNodeParameter('imageUrl', i) as string;
							body.media_source = {
								source_type: 'image_url',
								url: imageUrl,
							};
						} else if (imageSource === 'binaryData') {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
							const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							const base64Image = buffer.toString('base64');

							body.media_source = {
								source_type: 'image_base64',
								content_type: binaryData.mimeType || 'image/png',
								data: base64Image,
							};
						}

						if (additionalFields.link) {
							body.link = additionalFields.link;
						}
						if (additionalFields.altText) {
							body.alt_text = additionalFields.altText;
						}
						if (additionalFields.dominantColor) {
							body.dominant_color = additionalFields.dominantColor;
						}

						responseData = await pinterestApiRequest.call(
							this,
							'POST',
							'/pins',
							body,
						);
					} else if (operation === 'get') {
						const pinId = this.getNodeParameter('pinId', i) as string;

						responseData = await pinterestApiRequest.call(
							this,
							'GET',
							`/pins/${pinId}`,
						);
					} else if (operation === 'getAll') {
						const boardId = this.getNodeParameter('boardId', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;

						if (returnAll) {
							responseData = await pinterestApiRequestAllItems.call(
								this,
								'GET',
								`/boards/${boardId}/pins`,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const qs: IDataObject = { page_size: limit };
							const response = await pinterestApiRequest.call(
								this,
								'GET',
								`/boards/${boardId}/pins`,
								{},
								qs,
							);
							responseData = (response.items as IDataObject[]) || [];
						}
					} else if (operation === 'delete') {
						const pinId = this.getNodeParameter('pinId', i) as string;

						responseData = await pinterestApiRequest.call(
							this,
							'DELETE',
							`/pins/${pinId}`,
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported for pins`,
							{ itemIndex: i },
						);
					}
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`The resource "${resource}" is not supported`,
						{ itemIndex: i },
					);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
