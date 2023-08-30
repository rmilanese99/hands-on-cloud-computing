import { InstanceClass, InstanceSize, InstanceType, LaunchTemplate, MachineImage, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { Construct } from "constructs";

import { STACK_PREFIX } from "./app";

export class InstanceResources extends Construct {

    public ec2_asg: AutoScalingGroup;

    constructor(scope: Construct, id: string, resources: { vpc: Vpc, ec2_sg: SecurityGroup }) {
        super(scope, id);

        // Define launch template for the EC2 instances in the ASG
        const ec2_template = new LaunchTemplate(this, `${STACK_PREFIX}-ec2-template`, {
            instanceType: InstanceType.of(
                InstanceClass.C7G,
                InstanceSize.MEDIUM),
            machineImage: MachineImage.latestAmazonLinux2023(),
            keyName: `${STACK_PREFIX}-ec2-keypair`,
            securityGroup: resources.ec2_sg
        });

        // Create an ASG with 2-4 EC2 instances distributed across the 2 AZs
        const ec2_asg = new AutoScalingGroup(this, `${STACK_PREFIX}-ec2-asg`, {
            launchTemplate: ec2_template,
            vpc: resources.vpc,
            vpcSubnets: {
                // Selects all public subnets across all AZs
                subnetType: SubnetType.PUBLIC
            },
            // Auto Scaling tries to maintain equivalent numbers of instances in each AZ
            desiredCapacity: 2,
            minCapacity: 2,
            maxCapacity: 4
        });
        ec2_asg.scaleOnCpuUtilization(`${STACK_PREFIX}-ec2-scaling`, {
            targetUtilizationPercent: 80
        });

        this.ec2_asg = ec2_asg;
    }
}
