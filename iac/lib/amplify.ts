import { SecretValue } from "aws-cdk-lib";
import { App, GitHubSourceCodeProvider } from "@aws-cdk/aws-amplify-alpha";
import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

import { STACK_PREFIX } from "../bin/app";

export class AmplifyResources extends Construct {

    constructor(scope: Construct, id: string, resources: {
        api_gateway: HttpApi, cognito_client: UserPoolClient, cognito_pool: UserPool
    }) {
        super(scope, id);

        const amplify_app = new App(this, `${STACK_PREFIX}-app`, {
            sourceCodeProvider: new GitHubSourceCodeProvider({
                owner: 'rmilanese99',
                repository: 'hands-on-cloud-computing',
                oauthToken: SecretValue.secretsManager(`${STACK_PREFIX}`, {
                    jsonField: 'github-token'
                })
            }),
            environmentVariables: {
                AMPLIFY_MONOREPO_APP_ROOT: 'frontend',
                AMPLIFY_USERPOOL_ID: resources.cognito_pool.userPoolId,
                AMPLIFY_WEBCLIENT_ID: resources.cognito_client.userPoolClientId,
                AMPLIFY_API_ENDPOINT: resources.api_gateway.apiEndpoint
            }
        });
        amplify_app.addBranch('master');
    }
}
