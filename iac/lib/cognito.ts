import { AccountRecovery, UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

import { STACK_PREFIX } from "./app";

export class CognitoResources extends Construct {

    public cognito_pool: UserPool;
    public cognito_client: UserPoolClient;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Creates a Cognito user pool to authenticate requests to the API Gateway
        const cognito_pool = new UserPool(this, `${STACK_PREFIX}-cognito-pool`, {
            selfSignUpEnabled: true,
            signInAliases: {
                email: true,
                username: true
            },
            accountRecovery: AccountRecovery.EMAIL_ONLY,
        });

        // Creates a Cognito client to configure the authentication flow on the Amplify frontend
        const cognito_client = new UserPoolClient(this, `${STACK_PREFIX}-cognito-client`, {
            userPool: cognito_pool,
            authFlows: {
                custom: true,
                userPassword: true,
                userSrp: true
            }
        });

        this.cognito_pool = cognito_pool;
        this.cognito_client = cognito_client;
    }
}
