locals {
  app_name = "${var.name}-${var.environment}"
}
# Private Endpoints

resource "azurerm_private_endpoint" "pvt_endpoint" {
  name                = "${local.app_name}-endpoint"
  location            = var.location
  resource_group_name = var.resource_group_name
  subnet_id           = var.pvt_endpoint_subnet_id

  private_dns_zone_group {
    name = "${local.app_name}-pvtdnszonegroup"
    private_dns_zone_ids = [var.pvt_dns_zone_id]
  }

  private_service_connection {
    name                           = "${local.app_name}-privateconnection"
    private_connection_resource_id = var.private_connection_resource_id
    subresource_names              = ["sites"]
    is_manual_connection           = false
  }
}
