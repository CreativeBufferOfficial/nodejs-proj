import awsSdk, { S3 } from 'aws-sdk';

export class S3Service {
  private s3Client: S3;
  constructor() {
    this.s3Client = new awsSdk.S3({
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    });
  }

  async writeToKey(bucket: string, key: string, body: any) {
    return this.s3Client.upload({
      Bucket: bucket, Key: key, Body: body,
    })
    .promise()
    .then((data: any) => {
      console.log(`S3_WRITE_TO: ${bucket} ${key} ${body}: `, data);
    }).catch((err: any) => {
      throw err;
    });
  }
  // S3.GetObjectOutput | awsSdk.AWSError
  async getFile(bucket: string, key: string): Promise<any> {
    try {
      const s3ObjectData: S3.GetObjectOutput = await this.s3Client.getObject({
        Bucket: bucket, Key: key,
      }).promise();
      return s3ObjectData;
    } catch (error) {
      throw error;
    }
  }
}
