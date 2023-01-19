# AWS CDK VPN Stack

This project provides a way to deploy an AWS VPN to your exising VPC.
It uses AWS CDK with [OPENVPN(easyrsa)](https://github.com/OpenVPN/easy-rsa). Easy RSA is a recommended solution
when it comes to mutual autentication for VPN by AWS.

### Prerequisites
- AWS credentials exist on your local machine and you can connect. 

```bash
# Run quick check to see if you can connect to AWS
aws sts get-caller-identity
```

- Git is available and you can clone repositories.

## Instructions

#### Clone OpenVPN Repository
1. Clone the following repository from `OpenVPN` to your local machine to create server & client certificates

```bash
git clone https://github.com/OpenVPN/easy-rsa.git 
```

#### Setup Server CA
2. Change directory and run the following `linux` commands to generate the client & server certificates. Then upload the generated certificates to AWS Certificate Manager, this will be used for your VPN.

```bash
# First Command
cd easy-rsa/easyrsa3.
# Second Command
./easyrsa init-pki
# Third Command
./easyrsa build-ca nopass
# Fourth Command
./easyrsa build-server-full server nopass

# Final Command
aws acm import-certificate --certificate fileb://pki/issued/server.crt --private-key fileb://pki/private/server.key --certificate-chain fileb://pki/ca.crt 
```

#### Generate Client & Server Certificates
There are two ways to set up the certificates on AWS. The manual hands on way or through the CDK option. 

### AWS CDK Option
1. Modify the following lines to include your certificates and an existing VPC network.

```typescript
// Add a cidr block or just choose the following
clientCidrBlock = '10.0.0.0/22'

// Add an existing VPC by their name. This is the VPC you want your VPN to connect to.
vpcName: "dev-uccis-backend-DatabaseStack/Cluster/vpc",

// Second VPC name occurence. Your own VPC name
vpcName: "uccis-client-vpn",

// Add the certificate ARN that has been generated in the previous steps
vpnServerCertificateArn: "<vpn server cert arn>",
vpnClientCertificateArn: "<vpn client cert arn>",

// Add the account number & region you wish to deploy to
account: '1234567890',
region: 'ap-southeast-2'

```

2. Run the CDK to deploy the VPN. This will generate a VPN stack that you'll be able to see in CloudFormation, as well as the VPC VPN client endpoints list.

```bash
cdk deploy
```

### Hands On AWS Option
1. Go to the AWS console > VPC > Client VPN Endpoints

```bash
https://console.aws.amazon.com/vpc/home?#ClientVPNEndpoints
```

2. Follow one of the following instructions below or in tandem.
- [AWS Docs VPN Implementation](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/cvpn-getting-started.html#cvpn-getting-started-connect)
- [Optional YouTube Video Instructions](https://www.youtube.com/watch?v=uADf-JbN-ZE)
- [Optional YouTube Video Instructions](https://www.youtube.com/watch?v=A-Sy5so0Nqs&t=1238s)

3. Download the certificate once you're done, there is an option on AWS Client VPN Endpoints component that allow you to do this.

You will now start adding a certificate and a key to the configuration file you just downloaded. They will be added just before the final line of the configuration, where it says:

```bash
...

reneg sec 0
````

4. Add the certificate of the client to the configuration you just downloaded. You can find the certificate in `easy-sra/easyrsa3/pki/issued/client1.domain.tld.crt`

```bash
<cert>
Certificate:
   ....
-----END CERTIFICATE-----
</ca>
```

5. Add the private key to the configuration. You can find the certificate in `easy-sra/easyrsa3/pki/private/client1.domain.tld.key`

```bash
<key>
-----BEGIN PRIVATE KEY-----
   ...
-----END PRIVATE KEY-----
</key>
```

6. Locate the line that specifies the Client VPN endpoint DNS name, and prepend a random string to it so that the format is `random_string.displayed_DNS_name`. For example

-   Original DNS name: `cvpn-endpoint-0102bc4c2eEXAMPLE.prod.clientvpn.us-west-2.amazonaws.com`
 
-   Modified DNS name: `asdfa.cvpn-endpoint-0102bc4c2eEXAMPLE.prod.clientvpn.us-west-2.amazonaws.com`

### Adding More Clients
1. Add more clients by doing the following command below.

```bash
./easyrsa build-client-full client2.domain.tld nopass
```

### Revoking Client Certificates
Reference: [https://aws.amazon.com/premiumsupport/knowledge-center/client-vpn-revoke-access-specific-client/](https://aws.amazon.com/premiumsupport/knowledge-center/client-vpn-revoke-access-specific-client/)

To revoke a client, you have to generate a new certificate revocation list(CRL) and upload this to ACM.

1.  Revoke the client.

```bash
./easyrsa revoke <client_certificate_name>
```

1.  Generate the CRL.

```bash
./easyrsa gen-crl
```

1.  Now you can upload the CRL to the AWS VPN.

```bash
easyrsa/easyrsa3/crl.pem
```

### Troubleshooting
Error similar to `No such file or directory` / `tun/tap dev` / `dev/net/tun` etc. Check the following link as a start -> [Website Reference](https://9to5answer.com/openvpn-error-cannot-open-tun-tap-dev-dev-net-tun-no-such-file-or-directory-errno-2)

This is project that provides a way to deploy an AWS VPN to your VPC.
It uses CDK to deploy the AWS VPN and (easyrsa)[https://github.com/OpenVPN/easy-rsa] to administer the clients.
Easy RSA is the recommended way to do mutual authentication for VPN by AWS.
