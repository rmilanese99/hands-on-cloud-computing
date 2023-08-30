import { App, Stack } from "aws-cdk-lib";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { InstanceClass, InstanceSize, InstanceType, LaunchTemplate, MachineImage, Peer, Port, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { VpcResources } from "./vpc";
import { InstanceResources } from "./instance";

export const STACK_PREFIX = 'flora-unimol';

export class FloraStack extends Stack {

    constructor(app: App, id: string) {
        super(app, id);

        const { vpc, alb_sg, ec2_sg } = new VpcResources(this, `${STACK_PREFIX}-vpc`);
        const { ec2_asg } = new InstanceResources(this, `${STACK_PREFIX}-instance`, { vpc, ec2_sg });
    }

}
/*
** Dividere in più costrutti le AZ?
** Creare il modello dell'app (costrutto e stack)
** Ho inserito nel sec.group allowAllOutbound: true per l'ALB, ma non so se è corretto (vedere se è giusto)
** Dobbiamo creare in IAM Role  per la EC2 (e nel caso aggiungerlo all'istanza) https://bobbyhadz.com/blog/aws-cdk-ec2-instance-example
*/ 
