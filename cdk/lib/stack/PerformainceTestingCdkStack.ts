import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

interface PerformanceTestingCdkStackProps extends cdk.StackProps {
  ecr: {
    repositoryName: string;
  };
  loadbalancer: {
    webAclId: string;
  };
  vpc: {
    vpcId: string;
    availabilityZones: string[];
    publicSubnetIds: string[];
    privateSubnetIds: string[];
  };
}

export class PerformanceTestingCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PerformanceTestingCdkStackProps) {
    super(scope, id, props);

    // ECR
    const ecrRepository = ecr.Repository.fromRepositoryName(this, 'LocustRepo', props.ecr.repositoryName);

    // VPC
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'Vpc', {
      vpcId: props.vpc.vpcId,
      availabilityZones: props.vpc.availabilityZones,
      publicSubnetIds: props.vpc.publicSubnetIds,
      privateSubnetIds: props.vpc.privateSubnetIds,
    });

    // ECS クラスタ
    const cluster = new ecs.Cluster(this, 'LocustCluster', {
      vpc: vpc,
    });

    // ECS タスク定義（Locust コンテナを含む）
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'LocustTaskDef', {
      memoryLimitMiB: 4096, // 4096 (4 GB)
      cpu: 1024, // 1024 (1 vCPU)
    });
    const locustContainer = taskDefinition.addContainer('LocustContainer', {
      // image: ecs.ContainerImage.fromRegistry('locustio/locust'),
      image: ecs.ContainerImage.fromEcrRepository(ecrRepository),
    });
    locustContainer.addPortMappings({
      containerPort: 8089,
    });

    // ECS サービス
    const service = new ecs.FargateService(this, 'LocustService', {
      cluster: cluster,
      taskDefinition: taskDefinition,
      desiredCount: 1,
    });

    // ALB
    const lb = new elbv2.ApplicationLoadBalancer(this, 'LocustAlb', {
      vpc: vpc,
      internetFacing: true, // ALB をインターネットに公開
    });
    new cdk.CfnOutput(this, 'LocustAlbDnsName', { value: lb.loadBalancerDnsName });

    // ALB にリスナーを追加
    const listener = lb.addListener('Listener', {
      port: 80,
    });

    listener.addTargets('Target', {
      port: 80,
      targets: [service],
      healthCheck: { path: '/' },
    });
    listener.connections.allowDefaultPortFromAnyIpv4('Open to the world');

    // ALB からのトラフィックを受け付ける
    service.connections.allowFrom(lb, ec2.Port.tcp(80));

    // WAF に ALB を関連付ける
    new cdk.aws_wafv2.CfnWebACLAssociation(this, 'webAclAssociation', {
      resourceArn: lb.loadBalancerArn,
      webAclArn: props.loadbalancer.webAclId,
    });
  }
}
