import { App, Stack } from "aws-cdk-lib";

import { AmplifyResources } from "./amplify";
import { ApiGatewayResources } from "./api-gateway";
import { CognitoResources } from "./cognito";
import { InstanceResources } from "./instance";
import { LoadBalancerResources } from "./load-balancer";
import { VpcResources } from "./vpc";

export const STACK_PREFIX = 'flora-unimol';

export class FloraStack extends Stack {

    constructor(app: App, id: string) {
        super(app, id);

        const { vpc, alb_sg, ec2_sg, efs_sg, vpc_link_sg } =
            new VpcResources(this, `${STACK_PREFIX}-vpc-res`);

        const { ec2_asg } =
            new InstanceResources(this, `${STACK_PREFIX}-ec2-res`, { vpc, ec2_sg, efs_sg });

        const { cognito_pool, cognito_client } =
            new CognitoResources(this, `${STACK_PREFIX}-cognito-res`);

        const { alb, alb_listener, vpc_link } =
            new LoadBalancerResources(this, `${STACK_PREFIX}-lb-res`, { vpc, alb_sg, ec2_asg, vpc_link_sg });

        const { api_gateway } = new ApiGatewayResources(this, `${STACK_PREFIX}-api-gateway-res`,
            { alb_listener, cognito_client, cognito_pool, vpc_link });

        new AmplifyResources(this, `${STACK_PREFIX}-amplify-res`, { api_gateway, cognito_client, cognito_pool });
    }
}
/*
** Dividere in più costrutti le AZ?
** Creare il modello dell'app (costrutto e stack)
** Ho inserito nel sec.group allowAllOutbound: true per l'ALB, ma non so se è corretto (vedere se è giusto)
** Dobbiamo creare in IAM Role  per la EC2 (e nel caso aggiungerlo all'istanza) https://bobbyhadz.com/blog/aws-cdk-ec2-instance-example
*/
