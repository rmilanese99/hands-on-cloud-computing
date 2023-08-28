import { App, Stack } from "aws-cdk-lib";
import { Peer, Port, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";

export class FloraStack extends Stack {

    static PREFIX = 'flora-unimol';

    constructor(app: App, id: string) {
        super(app, id);

        // Create a VPC spanning 2 AZs, with a public subnet in each
        const vpc = new Vpc(this, `${FloraStack.PREFIX}-vpc`, {
            maxAzs: 2,
            natGateways: 0,
            subnetConfiguration: [{
                name: `${FloraStack.PREFIX}-public`,
                subnetType: SubnetType.PUBLIC
            }]
        });

        // Create security groups for the ALB and EC2 instances
        const alb_sg = new SecurityGroup(this, `${FloraStack.PREFIX}-alb-sg`, { vpc });
        const ec2_sg = new SecurityGroup(this, `${FloraStack.PREFIX}-ec2-sg`, { vpc });

        // Define ingress rules for the ALB security group
        alb_sg.addIngressRule(Peer.anyIpv4(), Port.tcp(80), 'Allow HTTP traffic from anywhere');

        // Define ingress rules for the EC2 security group
        ec2_sg.addIngressRule(Peer.anyIpv4(), Port.tcp(22), 'Allow SSH access from anywhere');
        ec2_sg.addIngressRule(alb_sg, Port.tcp(80), 'Allow HTTP traffic from the ALB');
    }
}
