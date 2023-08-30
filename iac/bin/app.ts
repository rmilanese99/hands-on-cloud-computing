import { App, Stack } from "aws-cdk-lib";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { InstanceClass, InstanceSize, InstanceType, LaunchTemplate, MachineImage, Peer, Port, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";

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
        const alb_sg = new SecurityGroup(this, `${FloraStack.PREFIX}-alb-sg`, { vpc, allowAllOutbound: true });
        const ec2_sg = new SecurityGroup(this, `${FloraStack.PREFIX}-ec2-sg`, { vpc });

        // Define ingress rules for the ALB security group
        alb_sg.addIngressRule(Peer.anyIpv4(), Port.tcp(80), 'Allow HTTP traffic on pot 80 from anywhere');

        // Define ingress rules for the EC2 security group
        ec2_sg.addIngressRule(Peer.anyIpv4(), Port.tcp(22), 'Allow SSH access from anywhere');
        ec2_sg.addIngressRule(alb_sg, Port.tcp(80), 'Allow HTTP traffic from the ALB');

        // Define launch template for the EC2 instances in the ASG
        const ec2_template = new LaunchTemplate(this, `${FloraStack.PREFIX}-ec2-template`, {
            instanceType: InstanceType.of(
                InstanceClass.C7G,
                InstanceSize.MEDIUM),
            machineImage: MachineImage.latestAmazonLinux2023(),
            keyName: `${FloraStack.PREFIX}-ec2-keypair`,
            securityGroup: ec2_sg
        });

        // Create an ASG with 2-4 EC2 instances distributed across the 2 AZs
        const ec2_asg = new AutoScalingGroup(this, `${FloraStack.PREFIX}-ec2-asg`, {
            launchTemplate: ec2_template,
            vpc,
            vpcSubnets: {
                // Selects all public subnets across all AZs
                subnetType: SubnetType.PUBLIC
            },
            // Auto Scaling tries to maintain equivalent numbers of instances in each AZ
            desiredCapacity: 2,
            minCapacity: 2,
            maxCapacity: 4
        });
        ec2_asg.scaleOnCpuUtilization(`${FloraStack.PREFIX}-ec2-scaling`, {
            targetUtilizationPercent: 80
        });
    }

}
/*
** Dividere in più costrutti le AZ?
** Creare il modello dell'app (costrutto e stack)
** Ho inserito nel sec.group allowAllOutbound: true per l'ALB, ma non so se è corretto (vedere se è giusto)
** Dobbiamo creare in IAM Role  per la EC2 (e nel caso aggiungerlo all'istanza) https://bobbyhadz.com/blog/aws-cdk-ec2-instance-example
*/ 
