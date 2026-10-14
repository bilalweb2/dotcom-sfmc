module "ftrfuel-cart" {
  source          = "app.terraform.io/frontier-devops/app-services/azure"
  version         = "~> 0.6"
  name            = "ftr-ftrfuelcart"
  environment     = var.environment
  subscription_id = var.subscription_id
  sku_name        = var.environment == "prod" ? "P1v3" : "S1"
  app_settings = {
    DOMAIN                                     = "${var.domain}"
    BASE_API                                   = "${var.base_api}"
    NODE_ENV                                   = "${var.environment == "prod" ? "production" : "development"}"
    FIREBASE_CONFIG                            = "${var.firebase_config}"
    APPLICATIONINSIGHTS_CONNECTION_STRING      = "${var.app_insights_connection_string}"
    TIP_TOKEN                                  = "${var.tip_token}"
    # WEBSITE_HTTPLOGGING_RETENTION_DAYS         = 30
    APPINSIGHTS_PROFILERFEATURE_VERSION        = "disabled"
    APPINSIGHTS_SNAPSHOTFEATURE_VERSION        = "disabled"
    ApplicationInsightsAgent_EXTENSION_VERSION = "disabled"
    DiagnosticServices_EXTENSION_VERSION       = "disabled"
    XDT_MicrosoftApplicationInsights_Mode      = "default"
  }
  acr_name                               = var.acr_name
  acr_resource_group                     = var.acr_resource_group
  image                                  = var.image
  image_tag                              = var.image_tag
  app_slot1_image_tag                    = var.app_slot1_image_tag
  app_slot1_subnet_id                    = data.azurerm_subnet.app_slot1_subnet.id
  swapslot                               = var.swapslot
  public_network_access_enabled_for_slot = true
  public_network_access_enabled          = true
  ip_restrictions = [
    {
      action                    = "Allow",
      name                      = "Allow Prod App Gateway Subnet",
      priority                  = 300,
      virtual_network_subnet_id = data.azurerm_subnet.prod_appgw_subnet.id
    }
  ]
  ip_restrictions_for_slot = [
    {
      action                    = "Allow",
      name                      = "allow Nonprod App Gateway Subnet",
      priority                  = 300,
      virtual_network_subnet_id = data.azurerm_subnet.nonprod_appgw_subnet.id
    }
  ]

  health_check = var.health_check

  instance_min     = 5
  instance_max     = 6
  instance_default = 5
}