// Azure Env
variable "environment" {}
variable "subscription_id" {}
variable "app_insights_connection_string" {
  default   = ""
  sensitive = true
}
variable "image" {
  default = "frontier-devops/ftr-fuel-cart-ssr"
}
variable "image_tag" {
  default = "latest"
}

variable "acr_name" {
  default = "ftrrepo"
}

variable "acr_resource_group" {
  default = "rg-infra-nonprod-001"
}

variable "app_slot1_image_tag" {
  default = ""
}

variable "swapslot" {
  default = false
}

variable "health_check" {
  default = "/ftr-forms/"
}
variable "firebase_config" {
  default   = ""
  sensitive = true
}

variable "domain" {
  default = ""
}

variable "base_api" {
  default = ""
}

// Tip token
variable "tip_token" {
  default = ""
  sensitive = true
}

# Subnet to be used for second slot for outbound traffic via the NAT gateway

data "azurerm_subnet" "app_slot1_subnet" {
  name                 = "app-service-ftrcart"
  resource_group_name  = "rg-infra-nonprod-001"
  virtual_network_name = "appGtwy-nonprod-vnet"
}

data "azurerm_subnet" "subnet" {
  name                 = "app-services-ftrcart"
  resource_group_name  = "rg-infra-prod-001"
  virtual_network_name = "appGtwy-prod-vnet"
}

data "azurerm_subnet" "nonprod_appgw_subnet" {
  name                 = "app-gateway"
  resource_group_name  = "rg-infra-nonprod-001"
  virtual_network_name = "appGtwy-nonprod-vnet"
}

data "azurerm_subnet" "prod_appgw_subnet" {
  name                 = "gateway"
  resource_group_name  = "rg-infra-prod-001"
  virtual_network_name = "appGtwy-prod-vnet"
}
