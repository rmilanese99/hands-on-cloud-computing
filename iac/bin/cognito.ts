import { AccountRecovery, UserPool, UserPoolDomain } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

import { STACK_PREFIX } from "./app";

export class CognitoResources extends Construct {

    public cognito_pool: UserPool;
    public cognito_domain: UserPoolDomain;

    constructor(scope: Construct, id: string) {
        super(scope, id);
        //Creato lo user pool
        const cognito_pool = new UserPool(this, `${STACK_PREFIX}-cognito-pool`, {
            accountRecovery: AccountRecovery.EMAIL_ONLY
        });
        //Creato il dominio epr lo user pool
        const cognito_domain = new UserPoolDomain(this, `${STACK_PREFIX}-cognito-domain`, {
            userPool: cognito_pool,
            cognitoDomain: {
                domainPrefix: `${STACK_PREFIX}-cognito`
            }
        });

        this.cognito_pool = cognito_pool;
        this.cognito_domain = cognito_domain;
    }
}
