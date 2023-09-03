import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { ApplicationLoadBalancer, ApplicationTargetGroup, ListenerAction, TargetGroupLoadBalancingAlgorithmType } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";

import { STACK_PREFIX } from "./app";

export class LoadBalancerResources extends Construct {

    public alb: ApplicationLoadBalancer;

    constructor(scope: Construct, id: string, resources: {
        vpc: Vpc, alb_sg: SecurityGroup, ec2_asg: AutoScalingGroup
    }) {
        super(scope, id);

        // Create an internet-facing ALB in the VPC
        const alb = new ApplicationLoadBalancer(this, `${STACK_PREFIX}-alb`, {
            vpc: resources.vpc,
            internetFacing: true,
            securityGroup: resources.alb_sg
        });

        // Create a target group for the EC2 instances
        const alb_group = new ApplicationTargetGroup(this, `${STACK_PREFIX}-asg-tg`, {
            port: 80,
            // Here we use the least outstanding requests algorithm to distribute requests as they may vary in
            // complexity
            loadBalancingAlgorithmType:
                TargetGroupLoadBalancingAlgorithmType.LEAST_OUTSTANDING_REQUESTS,
            targets: [resources.ec2_asg]
        });

        // Add a listener to the ALB to forward incoming requests on port 80 to the target group
        alb.addListener(`${STACK_PREFIX}-asg-listener`, {
            port: 80,
            defaultTargetGroups: [alb_group]
        });

        this.alb = alb;
    }
}
