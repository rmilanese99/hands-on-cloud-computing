import { App, Stack } from "aws-cdk-lib";
import { Peer, Port, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
//TODO: DAgg-New
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class FloraStack extends Stack {

    static PREFIX = 'flora-unimol';

    constructor(app: App, id: string) {
        super(app, id);

        // Create a VPC spanning 2 AZs, with a public subnet in each
        // Create VPC in which we'll launch the Instance
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

        //TODO: DAgg-New
        const ec2Instace = new ec2.Instance(this, `${FloraStack.PREFIX}-ec2-instance`, {
            vpc:vpc,
            vpcSubnets:{
                subnetType: ec2.SubnetType.PUBLIC 
            },
            securityGroup: ec2_sg,
            //Ovviamente la classe è da valutare bene
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.C7G,
                ec2.InstanceSize.MEDIUM),
            machineImage: new ec2.AmazonLinuxImage({
                generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
            }),
            //the name of the SSH key pair we are going to use to SSH into the instance
            keyName: 'ec2-flora-unimol',

        });
    }

}
/*
** Dividere in più costrutti le AZ?
** Creare il modello dell'app (costrutto e stack)
** Ho inserito nel sec.group allowAllOutbound: true per l'ALB, ma non so se è corretto (vedere se è giusto)
** Dobbiamo creare in IAM Role  per la EC2 (e nel caso aggiungerlo all'istanza) https://bobbyhadz.com/blog/aws-cdk-ec2-instance-example
*/ 
