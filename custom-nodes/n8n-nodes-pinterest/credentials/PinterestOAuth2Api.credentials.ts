import type { ICredentialType, INodeProperties } from 'n8n-workflow';

const scopes = [
	'boards:read',
	'boards:write',
	'pins:read',
	'pins:write',
	'user_accounts:read',
];

export class PinterestOAuth2Api implements ICredentialType {
	name = 'pinterestOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'Pinterest OAuth2 API';

	documentationUrl = 'https://developers.pinterest.com/docs/getting-started/set-up-app/';

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://www.pinterest.com/oauth/',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://api.pinterest.com/v5/oauth/token',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: scopes.join(','),
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
	];
}
