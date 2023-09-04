import { HttpApi, VpcLink } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpUserPoolAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { HttpAlbIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { ApplicationListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

import { STACK_PREFIX } from './app';

export class ApiGatewayResources extends Construct {

    constructor(scope: Construct, id: string, resources: {
        alb_listener: ApplicationListener, cognito_client: UserPoolClient, cognito_pool: UserPool, vpc_link: VpcLink
    }) {
        super(scope, id);

        // Defines a private integration for the API Gateway
        const vpc_link_integration =
            new HttpAlbIntegration(`${STACK_PREFIX}-integration`, resources.alb_listener, {
                vpcLink: resources.vpc_link
            });

        // Defines a Cognito User Pool authorizer for the API Gateway
        const cognito_authorizer =
            new HttpUserPoolAuthorizer(`${STACK_PREFIX}-authorizer`, resources.cognito_pool, {
                userPoolClients: [resources.cognito_client]
            });

        // Creates an API Gateway which redirects by default all the authenticated requests to the private EC2
        // instances behind the ALB
        const api_gateway = new HttpApi(this, `${STACK_PREFIX}-api-gateway`, {
            defaultIntegration: vpc_link_integration,
            defaultAuthorizer: cognito_authorizer
        });
    }
}
