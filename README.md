# Hands-on-cloud-computing
A biology faculty colleague has developed an exciting technology that he would like to do business with: by analyzing satellite shots, his model can predict the growth of flora in urban environments. 
He wants to build a **web application** to make the service available worldwide. 
During a coffee break, he described informally how he imagines the application: the user registers on the **paid portal**, draws an area of interest by navigating on a dynamic satellite map, sends the selected region images for
processing with the number of years to predict and the result will appear on the same map as an
animated heatmap.
He also described the **model**, which is difficult for non-biologists to understand, but you comprehend it is very computationally expensive.
The colleague also managed to find a small loan to start the project; he asked you to take care of the IT part in exchange for a share in the company. 
After taking notes on the back of a McDonald's receipt, you accept and start working on the design of the infrastructure on AWS right away. 
Before leaving, you promise your friend that the next time you see each other,  you will also have provisioned the entire infrastructure, and you can work together on **installing the model**.

> Presentation: [Power Point presentation](https://studentiunimol-my.sharepoint.com/:p:/g/personal/a_daguanno1_studenti_unimol_it/EfKKF5JiaTRBp3Hb56VH0y4BK_rMI-KdQU-43manwEsKPw?e=XgUU45)


# Install dependencies
ref: https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html

> *cd iac* 

> *npm i*
## Project Architecture
![Architecture](architectureH.svg)

## Bootstrapping and Deploy command
Install the AWS Command Line https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

> aws configure 
IAM/security credential/Access key 

> npx cdk bootstrap aws://{AWS_ID_Account}/{region}

> npx cdk deploy


### Perché usare Amplify? 
### Come gestire il codice  sorgente dell'APP? 
### Perché si autenticano le chiamate?
### Come si garantisce che in tutto il mondo sia accessibile? CDN
### Perchè c'è la subnet public
### Perché non usare i security group? (ulteriore livello di sicurezza)
### Diffenreza tra iam role e user e perché lo abbiamo definito? 
### Perché EFS e non EBS 
### Come funzionano i Sec Group
### Come funziona il vpc link e perché non è definito?
### Perché non un S3
### Serve sempre un VPC Link (submet private)
### Fault tollerance (high availability con zero down time)
### Perché ApiGateway non sta dentro la vpc?
### Perché ci sono istanze furi dalle subnet pub
### In che modo avviene l'integrazione tra amplify e cog