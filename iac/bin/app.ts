import { App, Stack } from "aws-cdk-lib";

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

        const { cognito_pool, cognito_domain } =
            new CognitoResources(this, `${STACK_PREFIX}-cognito-res`);

        const { alb } =
            new LoadBalancerResources(this, `${STACK_PREFIX}-lb-res`, { vpc, alb_sg, ec2_asg, vpc_link_sg });
    }

}
/*
** Dividere in più costrutti le AZ?
** Creare il modello dell'app (costrutto e stack)
** Ho inserito nel sec.group allowAllOutbound: true per l'ALB, ma non so se è corretto (vedere se è giusto)
** Dobbiamo creare in IAM Role  per la EC2 (e nel caso aggiungerlo all'istanza) https://bobbyhadz.com/blog/aws-cdk-ec2-instance-example
*/
