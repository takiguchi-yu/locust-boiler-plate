export interface AppParameter {
  envName: string;
  sourceRepository: string;
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

// テスト環境用パラメータ
export const testParameter: AppParameter = {
  envName: 'TEST',
  sourceRepository: 'takiguchi-yu/locust-boiler-plate',
  // ECR
  // !!! 事前に手動で作成してください。!!!
  ecr: {
    repositoryName: 'performance-testing-locust-repo',
  },
  // VPC
  // !!! 事前に手動で作成してください。!!!
  vpc: {
    vpcId: 'vpc-99999999999999999',
    availabilityZones: ['ap-northeast-1a', 'ap-northeast-1c'],
    publicSubnetIds: ['subnet-abc99999999999999', 'subnet-def99999999999999'],
    privateSubnetIds: ['subnet-ghi99999999999999', 'subnet-kjn99999999999999'],
  },
  // ALB
  // !!! 事前に手動で作成してください。!!!
  loadbalancer: {
    webAclId: 'arn:aws:wafv2:ap-northeast-1:999999999999:regional/webacl/foo/bar',
  },
};
