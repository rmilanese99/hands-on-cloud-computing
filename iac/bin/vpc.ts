import { Peer, Port, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

import { STACK_PREFIX } from "./app";

export class VpcResources extends Construct {

    public vpc: Vpc;

    public alb_sg: SecurityGroup;
    public ec2_sg: SecurityGroup;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Create a VPC spanning 2 AZs, with a public subnet in each
        const vpc = new Vpc(this, `${STACK_PREFIX}-vpc`, {
            maxAzs: 2,
            natGateways: 0,
            subnetConfiguration: [{
                name: `${STACK_PREFIX}-public`,
                subnetType: SubnetType.PUBLIC
            }]
        });

        // Create security groups for the ALB and EC2 instances
        const alb_sg = new SecurityGroup(this, `${STACK_PREFIX}-alb-sg`, { vpc, allowAllOutbound: true });
        const ec2_sg = new SecurityGroup(this, `${STACK_PREFIX}-ec2-sg`, { vpc });

        // Define ingress rules for the ALB security group
        alb_sg.addIngressRule(Peer.anyIpv4(), Port.tcp(80), 'Allow HTTP traffic on pot 80 from anywhere');

        // Define ingress rules for the EC2 security group
        ec2_sg.addIngressRule(Peer.anyIpv4(), Port.tcp(22), 'Allow SSH access from anywhere');
        ec2_sg.addIngressRule(alb_sg, Port.tcp(80), 'Allow HTTP traffic from the ALB');

        this.vpc = vpc;

        this.alb_sg = alb_sg;
        this.ec2_sg = ec2_sg;
    }
}