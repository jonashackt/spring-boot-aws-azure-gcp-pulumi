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
