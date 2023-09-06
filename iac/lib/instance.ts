import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { InstanceClass, InstanceSize, InstanceType, LaunchTemplate, MachineImage, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { FileSystem } from "aws-cdk-lib/aws-efs";
import { PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { readFileSync } from "fs";

import { STACK_PREFIX } from "../bin/app";

export class InstanceResources extends Construct {

    public ec2_asg: AutoScalingGroup;

    constructor(scope: Construct, id: string, resources: { vpc: Vpc, ec2_sg: SecurityGroup, efs_sg: SecurityGroup }) {
        super(scope, id);

        // Define an inline IAM policy for the EC2 instances to access the stack-related secrets
        const ec2_secret_policy = new PolicyDocument({
            statements: [
                new PolicyStatement({
                    actions: [
                        'secretsmanager:GetResourcePolicy',
                        'secretsmanager:GetSecretValue',
                        'secretsmanager:DescribeSecret',
                        'secretsmanager:ListSecretVersionIds'
                    ],
                    resources: [`arn:aws:secretsmanager:*:*:secret:${STACK_PREFIX}*`]
                }),
                new PolicyStatement({
                    actions: [
                        'kms:Decrypt',
                        'secretsmanager:ListSecrets'
                    ],
                    resources: ['*']
                })
            ]
        })

        // Create an IAM role for the EC2 instances
        const ec2_role = new Role(this, `${STACK_PREFIX}-ec2-role`, {
            assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
            inlinePolicies: {
                'ec2-secret-policy': ec2_secret_policy
            }
        });

        // Create an EFS and grant read/write access to the EC2 instances
        const efs = new FileSystem(this, `${STACK_PREFIX}-efs`, {
            vpc: resources.vpc,
            securityGroup: resources.efs_sg
        });
        efs.grantReadWrite(ec2_role);

        // Define launch template for the EC2 instances in the ASG
        const ec2_template = new LaunchTemplate(this, `${STACK_PREFIX}-ec2-template`, {
            instanceType: InstanceType.of(
                InstanceClass.C7G,
                InstanceSize.MEDIUM),
            machineImage: MachineImage.latestAmazonLinux2023(),
            role: ec2_role,
            securityGroup: resources.ec2_sg
        });

        // Add user data to the launch template, setting required environment variables and reading other commands
        // from assets
        const userData = readFileSync('./assets/user-data.sh', 'utf8');

        ec2_template.userData?.addCommands('EFS_ID=' + efs.fileSystemId);
        ec2_template.userData?.addCommands('STACK_PREFIX=' + STACK_PREFIX);
        ec2_template.userData?.addCommands(userData);

        // Create an ASG with 2-4 EC2 instances distributed across the 2 AZs
        const ec2_asg = new AutoScalingGroup(this, `${STACK_PREFIX}-ec2-asg`, {
            launchTemplate: ec2_template,
            vpc: resources.vpc,
            vpcSubnets: {
                // Selects all private subnets across all AZs
                subnetType: SubnetType.PRIVATE_WITH_EGRESS
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
