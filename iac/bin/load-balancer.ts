import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";

import { STACK_PREFIX } from "./app";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";

export class LoadBalancerResources extends Construct {

    public alb: ApplicationLoadBalancer;

    constructor(scope: Construct, id: string, resources: { vpc: Vpc, alb_sg: SecurityGroup, ec2_asg: AutoScalingGroup }) {
        super(scope, id);

        // Create an internet-facing ALB in the VPC
        const alb = new ApplicationLoadBalancer(this, `${STACK_PREFIX}-alb`, {
            vpc: resources.vpc,
            internetFacing: true,
            securityGroup: resources.alb_sg
        });

        // Create a listener on port 80, and set the EC2 ALB as the target
        const alb_listener = alb.addListener(`${STACK_PREFIX}-alb-listener`, { port: 80 });

        alb_listener.addTargets(`${STACK_PREFIX}-alb-targets`, {
            port: 80,
            targets: [resources.ec2_asg]
        });

        this.alb = alb;
    }
}
