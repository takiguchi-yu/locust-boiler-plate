#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { PerformanceTestingCdkStack } from '../lib/stack/PerformainceTestingCdkStack';
import { testParameter } from '../parameter';

const app = new cdk.App();
new PerformanceTestingCdkStack(app, 'PerformanceTestingCdkStack', {
  tags: {
    Repository: testParameter.sourceRepository,
    Environment: testParameter.envName,
  },
  ecr: testParameter.ecr,
  vpc: testParameter.vpc,
  loadbalancer: testParameter.loadbalancer,
});
