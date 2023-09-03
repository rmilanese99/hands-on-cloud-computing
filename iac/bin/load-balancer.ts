import { VpcLink } from "@aws-cdk/aws-apigatewayv2-alpha";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { ApplicationListener, ApplicationLoadBalancer, ApplicationTargetGroup, TargetGroupLoadBalancingAlgorithmType } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";

import { STACK_PREFIX } from "./app";

export class LoadBalancerResources extends Construct {

    public alb: ApplicationLoadBalancer;
    public alb_listener: ApplicationListener;

    public vpc_link: VpcLink;

    constructor(scope: Construct, id: string, resources: {
        vpc: Vpc, alb_sg: SecurityGroup, ec2_asg: AutoScalingGroup, vpc_link_sg: SecurityGroup
    }) {
        super(scope, id);

        // Create an internal ALB in the VPC
        const alb = new ApplicationLoadBalancer(this, `${STACK_PREFIX}-alb`, {
            vpc: resources.vpc,
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
        const alb_listener = alb.addListener(`${STACK_PREFIX}-asg-listener`, {
            port: 80,
            defaultTargetGroups: [alb_group]
        });

        // Create a VPC link to allow the API Gateway to access the private EC2 instances through the ALB
        const vpc_link = new VpcLink(this, `${STACK_PREFIX}-vpc-link`, {
            vpc: resources.vpc,
            securityGroups: [resources.vpc_link_sg]
        });

        this.alb = alb;
        this.alb_listener = alb_listener;

        this.vpc_link = vpc_link;
    }
}
