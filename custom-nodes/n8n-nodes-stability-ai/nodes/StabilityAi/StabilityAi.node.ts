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
	stabilityAiApiRequest,
	stabilityAiApiRequestBinary,
} from './GenericFunctions';

export class StabilityAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Stability AI',
		name: 'stabilityAi',
		icon: 'file:stabilityai.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate images using Stable Diffusion XL via Stability AI API',
		defaults: {
			name: 'Stability AI',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'stabilityAiApi',
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
						name: 'Generate Image',
						value: 'generateImage',
						description: 'Generate an image from a text prompt using Stable Diffusion XL',
						action: 'Generate an image',
					},
					{
						name: 'Image to Image',
						value: 'imageToImage',
						description: 'Transform an existing image using a text prompt',
						action: 'Transform an image',
					},
					{
						name: 'Upscale Image',
						value: 'upscaleImage',
						description: 'Upscale an image to a higher resolution',
						action: 'Upscale an image',
					},
					{
						name: 'Get Account Balance',
						value: 'getBalance',
						description: 'Get your Stability AI account balance',
						action: 'Get account balance',
					},
				],
				default: 'generateImage',
			},

			// ----------------------------------
			//         Generate Image
			// ----------------------------------
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				required: true,
				default: '',
				placeholder: 'A beautiful product photograph on a clean white background, marketing style...',
				displayOptions: {
					show: {
						operation: ['generateImage', 'imageToImage'],
					},
				},
				description: 'The text prompt describing the image to generate',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getEngines',
				},
				default: 'stable-diffusion-xl-1024-v1-0',
				displayOptions: {
					show: {
						operation: ['generateImage', 'imageToImage'],
					},
				},
				description: 'The Stable Diffusion model engine to use',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'PNG',
						value: 'png',
					},
					{
						name: 'JPEG',
						value: 'jpeg',
					},
					{
						name: 'WebP',
						value: 'webp',
					},
				],
				default: 'png',
				displayOptions: {
					show: {
						operation: ['generateImage', 'imageToImage', 'upscaleImage'],
					},
				},
				description: 'The output format for the generated image',
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['generateImage'],
					},
				},
				options: [
					{
						displayName: 'Negative Prompt',
						name: 'negativePrompt',
						type: 'string',
						typeOptions: {
							rows: 2,
						},
						default: 'blurry, low quality, distorted, watermark, text overlay',
						description: 'What the image should NOT contain',
					},
					{
						displayName: 'Width',
						name: 'width',
						type: 'number',
						default: 1024,
						typeOptions: {
							minValue: 512,
							maxValue: 2048,
						},
						description: 'Width of the generated image in pixels (must be divisible by 64)',
					},
					{
						displayName: 'Height',
						name: 'height',
						type: 'number',
						default: 1536,
						typeOptions: {
							minValue: 512,
							maxValue: 2048,
						},
						description: 'Height of the generated image in pixels (must be divisible by 64). Default 1536 for Pinterest vertical format.',
					},
					{
						displayName: 'CFG Scale',
						name: 'cfgScale',
						type: 'number',
						default: 7,
						typeOptions: {
							minValue: 0,
							maxValue: 35,
						},
						description: 'How strictly the model follows the prompt (0-35). Higher values produce images more closely matching the prompt.',
					},
					{
						displayName: 'Steps',
						name: 'steps',
						type: 'number',
						default: 30,
						typeOptions: {
							minValue: 10,
							maxValue: 150,
						},
						description: 'Number of diffusion steps. Higher values produce more detailed images but take longer.',
					},
					{
						displayName: 'Samples',
						name: 'samples',
						type: 'number',
						default: 1,
						typeOptions: {
							minValue: 1,
							maxValue: 10,
						},
						description: 'Number of image variations to generate (1-10)',
					},
					{
						displayName: 'Seed',
						name: 'seed',
						type: 'number',
						default: 0,
						description: 'Random seed for reproducible generation. Use 0 for random.',
					},
					{
						displayName: 'Style Preset',
						name: 'stylePreset',
						type: 'options',
						options: [
							{ name: 'None', value: '' },
							{ name: '3D Model', value: '3d-model' },
							{ name: 'Analog Film', value: 'analog-film' },
							{ name: 'Anime', value: 'anime' },
							{ name: 'Cinematic', value: 'cinematic' },
							{ name: 'Comic Book', value: 'comic-book' },
							{ name: 'Digital Art', value: 'digital-art' },
							{ name: 'Enhance', value: 'enhance' },
							{ name: 'Fantasy Art', value: 'fantasy-art' },
							{ name: 'Isometric', value: 'isometric' },
							{ name: 'Line Art', value: 'line-art' },
							{ name: 'Low Poly', value: 'low-poly' },
							{ name: 'Neon Punk', value: 'neon-punk' },
							{ name: 'Origami', value: 'origami' },
							{ name: 'Photographic', value: 'photographic' },
							{ name: 'Pixel Art', value: 'pixel-art' },
							{ name: 'Tile Texture', value: 'tile-texture' },
						],
						default: '',
						description: 'Apply a predefined style to the generated image',
					},
				],
			},

			// ----------------------------------
			//         Image to Image
			// ----------------------------------
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				required: true,
				default: 'data',
				displayOptions: {
					show: {
						operation: ['imageToImage', 'upscaleImage'],
					},
				},
				description: 'Name of the binary property containing the source image',
			},
			{
				displayName: 'Image Strength',
				name: 'imageStrength',
				type: 'number',
				default: 0.35,
				typeOptions: {
					minValue: 0,
					maxValue: 1,
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						operation: ['imageToImage'],
					},
				},
				description: 'How much to transform the source image (0 = no change, 1 = complete transformation)',
			},

			// ----------------------------------
			//         Upscale Image
			// ----------------------------------
			{
				displayName: 'Target Width',
				name: 'targetWidth',
				type: 'number',
				default: 2048,
				typeOptions: {
					minValue: 512,
					maxValue: 4096,
				},
				displayOptions: {
					show: {
						operation: ['upscaleImage'],
					},
				},
				description: 'Target width for the upscaled image',
			},
		],
	};

	methods = {
		loadOptions: {
			async getEngines(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await stabilityAiApiRequest.call(
						this,
						'GET',
						'/v1/engines/list',
					);

					const engines = response as unknown as Array<{
						id: string;
						name: string;
						description: string;
					}>;

					if (Array.isArray(engines)) {
						return engines
							.filter((engine) => engine.id.includes('stable-diffusion'))
							.map((engine) => ({
								name: engine.name || engine.id,
								value: engine.id,
								description: engine.description || '',
							}));
					}
				} catch (_error) {
					// Fall back to default options if API call fails
				}

				return [
					{
						name: 'Stable Diffusion XL 1.0',
						value: 'stable-diffusion-xl-1024-v1-0',
					},
					{
						name: 'Stable Diffusion 1.6',
						value: 'stable-diffusion-v1-6',
					},
					{
						name: 'Stable Diffusion XL Beta',
						value: 'stable-diffusion-xl-beta-v2-2-2',
					},
				];
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'generateImage') {
					const prompt = this.getNodeParameter('prompt', i) as string;
					const model = this.getNodeParameter('model', i) as string;
					const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;

					const textPrompts: Array<{ text: string; weight: number }> = [
						{ text: prompt, weight: 1 },
					];

					if (additionalOptions.negativePrompt) {
						textPrompts.push({
							text: additionalOptions.negativePrompt as string,
							weight: -1,
						});
					}

					const body: IDataObject = {
						text_prompts: textPrompts,
						cfg_scale: (additionalOptions.cfgScale as number) || 7,
						steps: (additionalOptions.steps as number) || 30,
						samples: (additionalOptions.samples as number) || 1,
						width: (additionalOptions.width as number) || 1024,
						height: (additionalOptions.height as number) || 1536,
					};

					if (additionalOptions.seed) {
						body.seed = additionalOptions.seed;
					}
					if (additionalOptions.stylePreset) {
						body.style_preset = additionalOptions.stylePreset;
					}

					const response = await stabilityAiApiRequest.call(
						this,
						'POST',
						`/v1/generation/${model}/text-to-image`,
						body,
					);

					const artifacts = response.artifacts as Array<{
						base64: string;
						seed: number;
						finishReason: string;
					}>;

					if (artifacts && artifacts.length > 0) {
						for (let j = 0; j < artifacts.length; j++) {
							const artifact = artifacts[j];
							const binaryData = await this.helpers.prepareBinaryData(
								Buffer.from(artifact.base64, 'base64'),
								`generated-image-${i}-${j}.png`,
								'image/png',
							);

							returnData.push({
								json: {
									seed: artifact.seed,
									finishReason: artifact.finishReason,
									imageIndex: j,
									prompt,
									model,
								},
								binary: {
									data: binaryData,
								},
								pairedItem: { item: i },
							});
						}
					}
				} else if (operation === 'imageToImage') {
					const prompt = this.getNodeParameter('prompt', i) as string;
					const model = this.getNodeParameter('model', i) as string;
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const imageStrength = this.getNodeParameter('imageStrength', i) as number;

					const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
					const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
					const base64Image = buffer.toString('base64');

					const body: IDataObject = {
						text_prompts: [{ text: prompt, weight: 1 }],
						init_image: base64Image,
						init_image_mode: 'IMAGE_STRENGTH',
						image_strength: imageStrength,
						cfg_scale: 7,
						steps: 30,
						samples: 1,
					};

					const response = await stabilityAiApiRequest.call(
						this,
						'POST',
						`/v1/generation/${model}/image-to-image`,
						body,
					);

					const artifacts = response.artifacts as Array<{
						base64: string;
						seed: number;
						finishReason: string;
					}>;

					if (artifacts && artifacts.length > 0) {
						const artifact = artifacts[0];
						const resultBinaryData = await this.helpers.prepareBinaryData(
							Buffer.from(artifact.base64, 'base64'),
							`transformed-image-${i}.png`,
							binaryData.mimeType || 'image/png',
						);

						returnData.push({
							json: {
								seed: artifact.seed,
								finishReason: artifact.finishReason,
								prompt,
								model,
							},
							binary: {
								data: resultBinaryData,
							},
							pairedItem: { item: i },
						});
					}
				} else if (operation === 'upscaleImage') {
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const targetWidth = this.getNodeParameter('targetWidth', i) as number;

					const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

					const imageBuffer = await stabilityAiApiRequestBinary.call(
						this,
						'POST',
						'/v1/generation/esrgan-v1-x2plus/image-to-image/upscale',
						{
							image: buffer.toString('base64'),
							width: targetWidth,
						},
					);

					const resultBinaryData = await this.helpers.prepareBinaryData(
						imageBuffer,
						`upscaled-image-${i}.png`,
						'image/png',
					);

					returnData.push({
						json: {
							targetWidth,
							operation: 'upscale',
						},
						binary: {
							data: resultBinaryData,
						},
						pairedItem: { item: i },
					});
				} else if (operation === 'getBalance') {
					const response = await stabilityAiApiRequest.call(
						this,
						'GET',
						'/v1/user/balance',
					);

					returnData.push({
						json: response,
						pairedItem: { item: i },
					});
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`The operation "${operation}" is not supported`,
						{ itemIndex: i },
					);
				}
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
