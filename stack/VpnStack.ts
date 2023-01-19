import { cdk } from '@aws-cdk/core';
import { VpnStack } from '../lib/vpn';

const app = new cdk.App();

interface ClientVPNEndpointProps {
  vpnServerCertificateArn: string,
  vpnClientCertificateArn: string,

  vpcName: string

  stackProps?: cdk.StackProps
}

export class ClientVPNEndpoint {

  // This is the lowest CIDR block you can have, keep it this way
  // or else you will have to change the CIDR block.
  clientCidrBlock = '10.0.0.0/22'

  constructor(app: cdk.App, props: ClientVPNEndpointProps) {
    new VpnStack(app, 'Vpn', {
      serverCertificateArn: props.vpnServerCertificateArn,
      clientCertificateArn: props.vpnClientCertificateArn,

      clientCidrBlock: this.clientCidrBlock,
      // Add an existing VPC to the stack using the VPC name.
      vpcName: "my-exising-vpc-name",

      stackProps: props.stackProps
    })
  }
}

new ClientVPNEndpoint(app, {
  // Provide the ARN of the VPN server and client certificates.
  vpnServerCertificateArn: "<vpn server cert arn>",
  vpnClientCertificateArn: "<vpn client cert arn>",

  // Provide a name for the VPC.
  vpcName: "my-existing-or-new-vpc-name",

  stackProps: {
    env: {
      // Add the account number and region to deploy the stack to.
      account: '<account number>',
      region: 'ap-southeast-2'
    }
  }
});


app.synth();
