import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { OAuthScope, UserPool, UserPoolClient, UserPoolDomain } from "aws-cdk-lib/aws-cognito";
import { ApplicationLoadBalancer, ApplicationTargetGroup, ListenerAction, TargetGroupLoadBalancingAlgorithmType } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { AuthenticateCognitoAction } from "aws-cdk-lib/aws-elasticloadbalancingv2-actions";
import { Construct } from "constructs";

import { STACK_PREFIX } from "./app";

export class LoadBalancerResources extends Construct {

    public alb: ApplicationLoadBalancer;

    constructor(scope: Construct, id: string, resources: {
        vpc: Vpc, alb_sg: SecurityGroup, ec2_asg: AutoScalingGroup, cognito_pool: UserPool,
        cognito_domain: UserPoolDomain
    }) {
        super(scope, id);

        // Create an internet-facing ALB in the VPC
        const alb = new ApplicationLoadBalancer(this, `${STACK_PREFIX}-alb`, {
            vpc: resources.vpc,
            internetFacing: true,
            securityGroup: resources.alb_sg
        });

        // Create a target group for the EC2 instances
        const alb_group = new ApplicationTargetGroup(this, `${STACK_PREFIX}-alb-group`, {
            port: 80,
            // Here we use the least outstanding requests algorithm to distribute requests as they may vary in
            // complexity
            loadBalancingAlgorithmType:
                TargetGroupLoadBalancingAlgorithmType.LEAST_OUTSTANDING_REQUESTS,
            targets: [resources.ec2_asg]
        });

        // Create a Cognito client to authenticate requests to the ALB
        const cognito_client = new UserPoolClient(this, `${STACK_PREFIX}-cognito-client`, {
            userPool: resources.cognito_pool,
            generateSecret: true,
            authFlows: {
                userPassword: true
            },
            oAuth: {
                flows: {
                    authorizationCodeGrant: true
                },
                scopes: [OAuthScope.EMAIL],
                callbackUrls: [
                    `https://${alb.loadBalancerDnsName}/oauth2/idpresponse`
                ],
            }
        });

        // Create an authenticated listener on port 80, and set the EC2 ASG as the target
        const alb_listener = alb.addListener(`${STACK_PREFIX}-alb-listener`, {
            port: 80,
            defaultAction: new AuthenticateCognitoAction({
                userPool: resources.cognito_pool,
                userPoolClient: cognito_client,
                userPoolDomain: resources.cognito_domain,
                next: ListenerAction.forward([alb_group])
            })
        });

        this.alb = alb;
    }
}
