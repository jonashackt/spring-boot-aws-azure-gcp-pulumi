# spring-boot-pulumi-aws-azure-google
Example project showing how to deploy [a Vue.js powered Spring Boot app](https://github.com/jonashackt/spring-boot-vuejs) using Buildpacks/Paketo.io &amp; Pulumi to PaaS services like AWS Fargate, Azure App Service &amp; Google App Engine


I really like [Heroku](https://www.heroku.com/) and think that PaaS services like [AWS Fargate](https://aws.amazon.com/fargate/), [Azure App Service](https://azure.microsoft.com/en-us/services/app-service/) and [Google App Engine](https://cloud.google.com/appengine) are simply the correspondence of this service if you look at the big hyperscalers.

So the idea struck me to use a multi cloud infrastructure-as-code SDK like [Pulumi](https://www.pulumi.com/) to provision the needed PaaS services in all 3 hyperscalers and use a well-known application based on Spring Boot and Vue.js as the deployment unit.

Also I would like to use a container as the deployment glue - [using Spring Boot, we can use Cloud Native Buildpacks (CNB) / Paketo.io here](https://blog.codecentric.de/en/2020/11/buildpacks-spring-boot/).

So we should end up with a setup, where you could mix and match nearly any technology you like. Be it using something different to Pulumi (like a cloud vendor's specific SDK like [AWS CDK](https://aws.amazon.com/cdk/) or [Azure bicep](https://github.com/Azure/bicep)) or a different programming language for the backend (Go, .Net/C#, Python, ...).

Ok, enough talk. Let's go:


## Release our Spring Boot App on Docker Hub

Great this one has already been taken care of: https://github.com/jonashackt/spring-boot-vuejs is already published at https://hub.docker.com/r/jonashackt/spring-boot-vuejs 

But maybe we should also switch to [the new GitHub Container Registry?](https://blog.codecentric.de/en/2021/03/github-container-registry/) :)


## Spring Boot on Azure App Service with CNB & Pulumi

Let's choose the Typescript taste of Pulumi with Azure: https://www.pulumi.com/docs/get-started/azure/

To create a skelleton, fire up:

```shell
mkdir spring-boot-pulumi-azure && cd spring-boot-pulumi-azure
pulumi new azure-typescript
```

This will somehow look like this:

[![asciicast](https://asciinema.org/a/397348.svg)](https://asciinema.org/a/397348)

Let's add `azure:environment: public` to our [Pulumi.dev.yaml](spring-boot-pulumi-azure/Pulumi.dev.yaml) to avoid unnecessary CLI questions:

```yaml
config:
  azure:environment: public
  azure-native:location: WestEurope
```

With this we should be able to craft our App Service with Pulumi: https://www.pulumi.com/docs/reference/pkg/azure/appservice/appservice/

But wait, this will use the "old" Pulumi Azure provider https://github.com/pulumi/pulumi-azure

As announced in https://www.pulumi.com/blog/announcing-nextgen-azure-provider/ the new provider is developed at https://github.com/pulumi/pulumi-azure-native as `pulumi-azure-native`. So you should mind the package import as:

```javascript
// old
import * as azure from "@pulumi/azure-native";

// new azure-native provider
import * as azure from "@pulumi/azure";
```

So you also need to check whether you're in the old docs at https://www.pulumi.com/docs/reference/pkg/azure/ or already at the new at https://www.pulumi.com/docs/reference/pkg/azure-native/

And the AppService packages moved from https://www.pulumi.com/docs/reference/pkg/azure/appservice/ to https://www.pulumi.com/docs/reference/pkg/azure-native/web/

We should maybe better have a look at the samples like https://github.com/pulumi/examples/tree/master/azure-ts-appservice-docker (which was updated only 5 days ago switching to the new `azure-native` provider).

Open up the [index.ts](spring-boot-pulumi-azure/index.ts):

```javascript
import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

const resourceGroup = new azure.resources.ResourceGroup("rg-spring-boot", {location: "West Europe"});

const appServicePlan = new azure.web.AppServicePlan("sp-spring-boot", {
    location: resourceGroup.location,
    resourceGroupName: resourceGroup.name,
    kind: "Linux",
    sku: {
        name: "B1",
        tier: "Basic",
    },
});

// Image https://hub.docker.com/r/jonashackt/spring-boot-vuejs
const imageName = "jonashackt/spring-boot-vuejs:latest";

const appServiceSpringBoot = new azure.web.WebApp("spring-boot-vuejs-azure", {
    location: resourceGroup.location,
    resourceGroupName: resourceGroup.name,
    serverFarmId: appServicePlan.id,
    siteConfig: {
        linuxFxVersion: `DOCKER|${imageName}`,
    },
    httpsOnly: true,
});

// Export our app's endpoint
export const helloEndpoint = pulumi.interpolate`https://${appServiceSpringBoot.defaultHostName}`;

```

TODO: Add AzureSQL Database to deployment.



