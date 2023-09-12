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
Usiamo Amplify perchè vogliamo in primis soddisfare il requisito che la web application debba essere disponibile a livello mondiale, e questo Amplify lo permette di fare in quanto va a distribuire l'applicazione sulle edge location di AWS utilizzando CloudFront.
Secondo motivo è perché trattandosi di un portale a pagamento vogliamo che gli utenti prima e le chiamate dopo siano autneticate in modo che solamente le chiamate provenienti da utenti auntenticati raggiungano il modello. Questo possiamo farlo utilizzando il servizio managed Amaxon cognito che si integra con Amplify e con API Gateway. 
Infine come ultima ragione che ci ha spinto a scegliere amplify è stata la possibilità di poter integrare direttamente github in questo modo abbiamo che manutenendo il codice nella repository questo sia sempre aggiornato all'ultima versione anche in Amplify. 
### Come gestire il codice  sorgente dell'APP? 
Il codice sorgente dell'applicazione è contentuo allinterno della repository GitHub amplify va a collegarsi andando a scaricare il codice dalla cartella forntend
### Perché si autenticano le chiamate?
Autentichiamo le chiamate perché vogliamo che al modello arrivino solamente quelle chiamate che sono state richieste dagli utenti correnttamente autenticati. Questo eprché si tratta di un portale a pagamento. 
### Come si garantisce che in tutto il mondo sia accessibile?
Attraverso la content delivery network e la propagazione del codice nelle edge location di aws
### Perchè c'è la subnet public
Per permettere alla macchina ec2 di collegarsi ad internet ed effettuare il setup iniziale delle dipendenze inserite nello user data ma anche perché non sapendo nel concreto com'è svilupparto il modello questo potrebbe aver necessità di collegarsi ad interet per reperire immagini per la predizione
### Perché non usare i security group? (ulteriore livello di sicurezza)
Potevamo mettere le istanze ec2 nella subnet pubblica quindi con un ip pubblico e andare a gestire gli accessi con i security group che sono Statefull e quidni di default consentono le chiamate on outbound e di conseguenza consentono anche di ricevere le risposte, tuttavia abbiamo deciso di dicriminare el subnet per aggiungere un ulteriore livello di sicurezza.
### Diffenreza tra iam role e user e perché lo abbiamo definito? 
Un iam Role è un ruolo che sarà definito da delle policy, noi l abbiamo definito per le ec2 per consentire di andare ad accedere ai secret e scaricare il codice della repository backend nelle istanze ec2. Un iam user incece è un utente umano. 
### Perché EFS e non EBS 
GLi EBS sono prenseti e sono di default nelle EC2, abbiamo scelto di utilizzare però per lo storage del modello un EFS perché questo consente di essere montato su più istanze e quidni avere un unico storage **CENTRALIZZATO** a cui tutte le istanze poi si collegheranno e quindi tutte le ec2 avranno l'ultima versione del modello. 
### Come funzionano i Sec Group
Li abbiamo definiti andando a definire su quale porta e da quale altro security group è possibile ricevere le chiamate, per esepmio EC2 riceve le chiamate dal ALB sulla porta 8080
### Come funziona il vpc link e perché non è definito?
Il VpcLink è un endpoint definito all'interno dell'ApiGateway e permette di instradare le chiamate che arrivano all'apiGateway verso il loadBalancer
### Perché non un S3
Usando un S3 che è region based avremmo che tutte le istanze dovrebbero andare a scaricare il modello in locale e quidni avremmo n istanze con n modelli, quidni abbiamo preferito utilizzare un EFS sia per permettere di avere un'unica versione del modello ma anche perché risparmiamo memoria
### Serve sempre un VPC Link (submet private)
Nel nostro caso è necessatio perché abbiamo che le EC2 sono in subnet private e quidni è necessario per raggiungere le istanze
### Fault tollerance (high availability con zero down time)
### Perché ApiGateway non sta dentro la vpc?
In quanto è un servizio region based gestito da AWS e quindi non si trova all'interno della nostra VPC
### Perché ci sono istanze furi dalle subnet pub
### In che modo avviene l'integrazione tra amplify e cog
### Perché non usare ACL
Perché è un servizio stateless quindi in ogni caso non permetterebbe di ricevere le risposte
### Perché Stoccolma?