import { App, Stack } from "aws-cdk-lib";
import { SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";

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
    }
}
