#!/bin/bash

yum update -y

yum install -y amazon-efs-utils
yum install -y git
yum install -y jq
yum install -y nodejs

mkdir /mnt/efs

mount -o iam,tls -t efs $EFS_ID /mnt/efs

cd /mnt/efs

if [ ! -d "hands-on-cloud-computing" ]
then
    GITHUB_TOKEN=`aws secretsmanager get-secret-value --secret-id $STACK_PREFIX | jq --raw-output .SecretString | jq -r .'"github-token"'`

    git clone https://rmilanese99:$GITHUB_TOKEN@github.com/rmilanese99/hands-on-cloud-computing.git &&
        sleep 5 &&
        cd hands-on-cloud-computing/backend &&
        npm install &&
        cd ../.. &&
        touch done ||
        :
fi

while [ ! -f "done" ]
do
    sleep 5
done

cd hands-on-cloud-computing/backend

node index.js
