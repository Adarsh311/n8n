import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { earnKaroApiRequest } from './GenericFunctions';

export class EarnKaro implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'EarnKaro',
		name: 'earnKaro',
		icon: 'file:earnkaro.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate affiliate links using EarnKaro',
		defaults: {
			name: 'EarnKaro',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'earnKaroApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create Affiliate Link',
						value: 'createLink',
						description: 'Convert a product URL into an EarnKaro affiliate link',
						action: 'Create an affiliate link',
					},
					{
						name: 'Get Link Details',
						value: 'getLinkDetails',
						description: 'Get details about an existing affiliate link',
						action: 'Get link details',
					},
					{
						name: 'Get Earnings',
						value: 'getEarnings',
						description: 'Get earnings summary and statistics',
						action: 'Get earnings',
					},
				],
				default: 'createLink',
			},

			// ----------------------------------
			//         Create Affiliate Link
			// ----------------------------------
			{
				displayName: 'Product URL',
				name: 'productUrl',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://www.amazon.in/dp/B0EXAMPLE',
				displayOptions: {
					show: {
						operation: ['createLink'],
					},
				},
				description: 'The original product URL to convert into an affiliate link. Supports Amazon, Flipkart, and other partner platforms.',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['createLink'],
					},
				},
				options: [
					{
						displayName: 'Campaign Name',
						name: 'campaign',
						type: 'string',
						default: '',
						description: 'Optional campaign name for tracking purposes',
					},
					{
						displayName: 'Custom Tag',
						name: 'tag',
						type: 'string',
						default: '',
						description: 'Custom tag to identify this link in analytics',
					},
					{
						displayName: 'Short Link',
						name: 'shortLink',
						type: 'boolean',
						default: true,
						description: 'Whether to generate a shortened affiliate link',
					},
				],
			},

			// ----------------------------------
			//         Get Link Details
			// ----------------------------------
			{
				displayName: 'Affiliate Link ID',
				name: 'linkId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['getLinkDetails'],
					},
				},
				description: 'The ID of the affiliate link to get details for',
			},

			// ----------------------------------
			//         Get Earnings
			// ----------------------------------
			{
				displayName: 'Date Range',
				name: 'dateRange',
				type: 'options',
				default: 'last7days',
				displayOptions: {
					show: {
						operation: ['getEarnings'],
					},
				},
				options: [
					{
						name: 'Today',
						value: 'today',
					},
					{
						name: 'Last 7 Days',
						value: 'last7days',
					},
					{
						name: 'Last 30 Days',
						value: 'last30days',
					},
					{
						name: 'This Month',
						value: 'thisMonth',
					},
					{
						name: 'Custom',
						value: 'custom',
					},
				],
				description: 'The date range for earnings data',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						operation: ['getEarnings'],
						dateRange: ['custom'],
					},
				},
				description: 'Start date for the earnings report',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						operation: ['getEarnings'],
						dateRange: ['custom'],
					},
				},
				description: 'End date for the earnings report',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject;

				if (operation === 'createLink') {
					const productUrl = this.getNodeParameter('productUrl', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

					const body: IDataObject = {
						deal_url: productUrl,
					};

					if (additionalFields.campaign) {
						body.campaign = additionalFields.campaign;
					}
					if (additionalFields.tag) {
						body.tag = additionalFields.tag;
					}
					if (additionalFields.shortLink !== undefined) {
						body.short_link = additionalFields.shortLink;
					}

					responseData = await earnKaroApiRequest.call(
						this,
						'POST',
						'/links/create',
						body,
					);
				} else if (operation === 'getLinkDetails') {
					const linkId = this.getNodeParameter('linkId', i) as string;

					responseData = await earnKaroApiRequest.call(
						this,
						'GET',
						`/links/${linkId}`,
					);
				} else if (operation === 'getEarnings') {
					const dateRange = this.getNodeParameter('dateRange', i) as string;
					const qs: IDataObject = {};

					if (dateRange === 'custom') {
						qs.start_date = this.getNodeParameter('startDate', i) as string;
						qs.end_date = this.getNodeParameter('endDate', i) as string;
					} else {
						qs.range = dateRange;
					}

					responseData = await earnKaroApiRequest.call(
						this,
						'GET',
						'/earnings/summary',
						{},
						qs,
					);
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`The operation "${operation}" is not supported`,
						{ itemIndex: i },
					);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
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
