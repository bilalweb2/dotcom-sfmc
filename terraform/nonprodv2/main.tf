data "terraform_remote_state" "network" {
  backend = "remote"

  config = {
    organization = var.tfc_org_name
    workspaces   = {
      name = var.tfc_network_workspace_name
    }
  }
}

locals {
  subnet_id              = data.terraform_remote_state.network.outputs.env_outputs[var.environment]["ftrcartssr_integration_subnet_id"]
  pvt_endpoint_subnet_id = data.terraform_remote_state.network.outputs.env_outputs[var.environment]["pvt_endpoints_subnet_id"]
  vnet_id                = data.terraform_remote_state.network.outputs.vnet_id
  pvt_dns_zone_id        = data.terraform_remote_state.network.outputs.pvt_dns_zone_id
}

module "fuel-ol" {
  source             = "app.terraform.io/frontier-devops/app-services/azure"
  version            = "~> 0.4"
  subscription_id    = var.subscription_id
  environment        = var.environment
  image_tag          = var.image_tag
  image              = var.image
  name               = "ftr-ftrcartssr"
  subnet_id          = local.subnet_id
  acr_name           = "ftrRepo"
  acr_resource_group = "rg-infra-nonprod-001"
  app_settings       = {
    vnetRouteAllEnabled                        = true
    MONGODB_URI                                = "${var.mongodb_uri}"
    NODE_ENV                                   = "${var.environment == "prod" ? "production" : "development"}"
    NEXT_PUBLIC_APP_URL                        = "${var.next_public_app_url}"
    BASE_PATH                                  = "${var.base_path}"
    APPLICATIONINSIGHTS_CONNECTION_STRING      = "${var.applicationinsights_connection_string}"
    TIP_TOKEN                                  = "${var.tip_token}"
    API_SECRET                                 = "${var.api_secret}"
    DOTCOM_SFMC_BASEURL                        = "${var.dotcom_sfmc_baseurl}"
    DOTCOM_SFMC_AUTH_CONSUMER_ID               = "${var.dotcom_sfmc_auth_consumer_id}"
    DOTCOM_SFMC_AUTH_CONSUMER_SECRET           = "${var.dotcom_sfmc_auth_consumer_secret}"
    NEW_RELIC_APP_NAME                         = "${var.new_relic_app_name}"
    NEW_RELIC_LICENSE_KEY                      = "${var.new_relic_license_key}"
    LOG_LEVEL                                  = "${var.log_level}"
    EMEID_AES_IV                               = "${var.emeid_aes_iv}"
    EMEID_AES_KEY                              = "${var.emeid_aes_key}"
    APPINSIGHTS_PROFILERFEATURE_VERSION        = "disabled"
    APPINSIGHTS_SNAPSHOTFEATURE_VERSION        = "disabled"
    ApplicationInsightsAgent_EXTENSION_VERSION = "disabled"
    DiagnosticServices_EXTENSION_VERSION       = "disabled"
    XDT_MicrosoftApplicationInsights_Mode      = "default"
  }
  disable_auto-scaling = var.disable_auto-scaling
  disable_logging      = var.disable_logging
  num_deploy_slots     = var.num_deploy_slots
  health_check         = var.health_check
}

module "pvt_endpoint" {
  source                         = "./private-endpoint"
  environment                    = var.environment
  location                       = module.fuel-ol.resource_group_location
  name                           = "ftr-ftrcartssr"
  private_connection_resource_id = module.fuel-ol.app_service_id
  pvt_endpoint_subnet_id         = local.pvt_endpoint_subnet_id
  resource_group_name            = module.fuel-ol.resource_group_name
  vnet_id                        = local.vnet_id
  pvt_dns_zone_id                = local.pvt_dns_zone_id
}