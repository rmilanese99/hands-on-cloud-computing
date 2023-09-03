import { Peer, Port, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

import { STACK_PREFIX } from "./app";

export class VpcResources extends Construct {

    public vpc: Vpc;

    public alb_sg: SecurityGroup;
    public ec2_sg: SecurityGroup;
    public efs_sg: SecurityGroup;
    public vpc_link_sg: SecurityGroup;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Create a VPC spanning 2 AZs, with a public and a private subnet in each
        const vpc = new Vpc(this, `${STACK_PREFIX}-vpc`, {
            maxAzs: 2,
            subnetConfiguration: [{
                name: `${STACK_PREFIX}-public`,
                subnetType: SubnetType.PUBLIC
            }, {
                name: `${STACK_PREFIX}-private`,
                subnetType: SubnetType.PRIVATE_ISOLATED
            }]
        });

        // Create security groups for the ALB, EC2 instances, EFS and VPC Link
        const alb_sg = new SecurityGroup(this, `${STACK_PREFIX}-alb-sg`, { vpc, allowAllOutbound: true });
        const ec2_sg = new SecurityGroup(this, `${STACK_PREFIX}-ec2-sg`, { vpc });
        const efs_sg = new SecurityGroup(this, `${STACK_PREFIX}-efs-sg`, { vpc });
        const vpc_link_sg = new SecurityGroup(this, `${STACK_PREFIX}-vpc-link-sg`, { vpc });

        // Define ingress rules for the ALB security group
        alb_sg.addIngressRule(vpc_link_sg, Port.tcp(80), 'Allow HTTP traffic from the VPC Link');

        // Define ingress rules for the EC2 security group
        ec2_sg.addIngressRule(Peer.anyIpv4(), Port.tcp(22), 'Allow SSH access from anywhere');
        ec2_sg.addIngressRule(alb_sg, Port.tcp(80), 'Allow HTTP traffic from the ALB');

        // Define ingress rules for the EFS security group
        efs_sg.addIngressRule(ec2_sg, Port.tcp(2049), 'Allow NFS traffic from the EC2 instances');

        this.vpc = vpc;

        this.alb_sg = alb_sg;
        this.ec2_sg = ec2_sg;
        this.efs_sg = efs_sg;
        this.vpc_link_sg = vpc_link_sg;
    }
}
