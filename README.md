# spring-boot-aws-azure-gcp-pulumi
Example project showing how to deploy a Vue.js powered Spring Boot app using Buildpacks/Paketo.io &amp; Pulumi to PaaS services like AWS Fargate, Azure App Service &amp; Google App Engine


I really like [Heroku](https://www.heroku.com/) and think that PaaS services like [AWS Fargate](https://aws.amazon.com/fargate/), [Azure App Service](https://azure.microsoft.com/en-us/services/app-service/) and [Google App Engine](https://cloud.google.com/appengine) are simply the correspondence of this service if you look at the big hyperscalers.

So the idea struck me to use a multi cloud infrastructure-as-code SDK like [Pulumi](https://www.pulumi.com/) to provision the needed PaaS services in all 3 hyperscalers and use a well-known application based on Spring Boot and Vue.js as the deployment unit.

Also I would like to use a container as the deployment glue - so we should end up with a setup, where you could mix and match nearly any technology you like. Be it using something different to Pulumi (like a cloud vendor's specific SDK like [AWS CDK](https://aws.amazon.com/cdk/) or [Azure bicep](https://github.com/Azure/bicep)) or a different programming language for the backend (Go, .Net/C#, Python, ...).